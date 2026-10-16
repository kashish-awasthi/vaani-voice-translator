"""Pretend to be the phone: stream a WAV file to the server in real time and print what comes back."""
import asyncio
import json
import sys
import wave

import websockets

URL = "ws://localhost:8500/ws"


async def main(path, languages, target=None):
    with wave.open(path, "rb") as w:
        pcm = w.readframes(w.getnframes())

    async with websockets.connect(URL) as ws:
        await ws.send(json.dumps({"type": "start", "languages": languages, "target": target}))
        print("server:", await ws.recv())

        async def receive():
            while True:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=8)
                except asyncio.TimeoutError:
                    return  # nothing more is coming
                msg = json.loads(raw)
                if msg["type"] == "partial":
                    print(f"  ...  [{msg['lang']}] {msg['text']}")
                elif msg["type"] == "final":
                    print(f"FINAL  [{msg['lang']} -> {msg['target']}] {msg['text']}")
                    print(f"       {msg['translation']}   {msg['timing_ms']}\n")
                else:
                    print("server:", msg)

        receiver = asyncio.create_task(receive())
        chunk = 3200  # 100 ms of 16 kHz 16-bit audio
        for i in range(0, len(pcm), chunk):
            await ws.send(pcm[i:i + chunk])
            await asyncio.sleep(0.1)  # send at real-time speed, like a microphone
        await ws.send(json.dumps({"type": "stop"}))
        try:  # keep listening until the server has been quiet for 8 seconds
            await asyncio.wait_for(receiver, timeout=60)
        except asyncio.TimeoutError:
            pass


if __name__ == "__main__":
    langs = sys.argv[2].split(",")
    asyncio.run(main(sys.argv[1], langs, sys.argv[3] if len(sys.argv) > 3 else None))
