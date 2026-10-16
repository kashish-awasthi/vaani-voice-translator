"""Two-way test: stream a WAV, detect which of two languages each sentence is in, translate to the other."""
import sys
import time
import wave

from asr import SAMPLE_RATE, StreamingTranscriber, transcribe
from translator import other_language, translate

path, pair = sys.argv[1], sys.argv[2].split(",")

with wave.open(path, "rb") as w:
    pcm = w.readframes(w.getnframes())


def show(events):
    for kind, audio in events:
        if kind != "final":
            continue
        t0 = time.time()
        text, lang = transcribe(audio, pair)
        t1 = time.time()
        target = other_language(lang, pair)
        out = translate(text, lang, target)
        t2 = time.time()
        print(f"[{lang} -> {target}] {text}")
        print(f"            {out}   (speech {t1 - t0:.2f}s, translate {t2 - t1:.2f}s)\n")


stream = StreamingTranscriber()
chunk = SAMPLE_RATE // 10 * 2
for i in range(0, len(pcm), chunk):
    show(stream.feed(pcm[i:i + chunk]))
show(stream.flush())