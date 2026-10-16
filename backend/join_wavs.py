"""Join several WAV files into one: python join_wavs.py out.wav in1.wav in2.wav ..."""
import sys
import wave

out_path, inputs = sys.argv[1], sys.argv[2:]

with wave.open(out_path, "wb") as out:
    for i, path in enumerate(inputs):
        with wave.open(path, "rb") as w:
            if i == 0:
                out.setparams(w.getparams())  # copy sample rate / channels from the first file
            out.writeframes(w.readframes(w.getnframes()))

print(f"{out_path} ready ({len(inputs)} files joined)")