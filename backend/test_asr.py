"""Simulate a phone streaming a WAV file in 100 ms chunks and print what Whisper hears."""
import sys
import time
import wave

from asr import SAMPLE_RATE, StreamingTranscriber, transcribe

path = sys.argv[1]
languages = sys.argv[2].split(",") if len(sys.argv) > 2 else None

with wave.open(path, "rb") as w:
    assert w.getframerate() == SAMPLE_RATE and w.getnchannels() == 1 and w.getsampwidth() == 2, \
        "need a 16 kHz, mono, 16-bit WAV"
    pcm = w.readframes(w.getnframes())


def show(events):
    for kind, audio in events:
        start = time.time()
        text, lang = transcribe(audio, languages, partial=(kind == "partial"))
        print(f"{kind:8}[{lang}] {text}   ({time.time() - start:.2f}s)")


stream = StreamingTranscriber()
chunk = SAMPLE_RATE // 10 * 2  # 100 ms of 16-bit audio = 3200 bytes
for i in range(0, len(pcm), chunk):
    show(stream.feed(pcm[i:i + chunk]))
show(stream.flush())