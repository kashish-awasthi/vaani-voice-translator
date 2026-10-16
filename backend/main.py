"""FastAPI server: the phone streams microphone audio over a WebSocket,
the server streams back live captions and translations."""
import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from asr import StreamingTranscriber, get_model, transcribe
from translator import other_language, translate

whisper_lock = asyncio.Lock()  # the Whisper model is shared, so run one job at a time


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(get_model)  # load Whisper before the first user connects
    yield


app = FastAPI(title="Voice Translator", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.websocket("/ws")
async def stream_translate(ws: WebSocket):
    await ws.accept()
    start = await ws.receive_json()
    languages = start["languages"]  # two-way: ["en", "hi"]   one-way: ["en"]
    target = start.get("target")  # one-way only, e.g. "hi"

    audio_queue: asyncio.Queue = asyncio.Queue()
    worker = asyncio.create_task(process_audio(ws, audio_queue, languages, target))
    await ws.send_json({"type": "ready"})

    try:
        while True:
            message = await ws.receive()
            if message["type"] == "websocket.disconnect":
                break
            if message.get("bytes"):
                await audio_queue.put(message["bytes"])  # a chunk of microphone audio
            elif message.get("text") and '"stop"' in message["text"]:
                await audio_queue.put(None)  # user pressed stop: finish the current sentence
    except WebSocketDisconnect:
        pass
    finally:
        worker.cancel()


async def process_audio(ws: WebSocket, audio_queue: asyncio.Queue, languages, target):
    stream = StreamingTranscriber()
    sentence_id = 0
    while True:
        # take everything that has arrived, so we never fall behind the speaker
        chunks = [await audio_queue.get()]
        while not audio_queue.empty():
            chunks.append(audio_queue.get_nowait())

        events = []
        for chunk in chunks:
            events += stream.flush() if chunk is None else stream.feed(chunk)
        # an old partial is useless once newer audio exists: keep finals + only the very last partial
        events = [e for i, e in enumerate(events) if e[0] == "final" or i == len(events) - 1]

        for kind, audio in events:
            t0 = time.perf_counter()
            async with whisper_lock:
                text, lang, confidence = await asyncio.to_thread(transcribe, audio, languages, kind == "partial", True)
            t1 = time.perf_counter()
            if not text:
                continue

            if kind == "partial":
                await ws.send_json({"type": "partial", "id": sentence_id, "text": text, "lang": lang})
                continue

            to_lang = target or other_language(lang, languages)  # the automatic direction switch
            try:
                translation = await asyncio.to_thread(translate, text, lang, to_lang)
            except Exception as e:
                translation = None
                await ws.send_json({"type": "error", "message": str(e)})
            t2 = time.perf_counter()

            await ws.send_json({
                "type": "final",
                "id": sentence_id,
                "text": text,
                "lang": lang,
                "translation": translation,
                "target": to_lang,
                "confidence": round(confidence, 3) if confidence is not None else None,  # two-way only
                "timing_ms": {"speech": round((t1 - t0) * 1000), "translate": round((t2 - t1) * 1000)},
            })
            sentence_id += 1