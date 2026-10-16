"""Streaming speech-to-text: cuts live audio into utterances and runs Whisper on them."""
import collections
import os

import numpy as np
from faster_whisper import WhisperModel

SAMPLE_RATE = 16000  # Whisper expects 16 kHz mono audio
FRAME_MS = 30  # the voice detector looks at audio in 30 ms frames
FRAME_SAMPLES = SAMPLE_RATE * FRAME_MS // 1000

_model = None


def get_model() -> WhisperModel:
    """Load Whisper once and share it between all connections."""
    global _model
    if _model is None:
        size = os.getenv("WHISPER_MODEL", "small")
        _model = WhisperModel(size, device="cpu", compute_type="int8")
    return _model


def pcm16_to_float(data: bytes) -> np.ndarray:
    """Raw 16-bit PCM bytes -> float32 samples between -1 and 1."""
    return np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0


class StreamingTranscriber:
    """Splits a live audio stream into utterances using loudness-based voice detection.

    feed() returns a list of events:
      ("partial", audio)  speaker is still talking -> transcribe for live captions
      ("final", audio)    speaker paused -> transcribe and translate this utterance
    """

    def __init__(self, silence_ms=700, partial_every_ms=1000, max_utterance_s=15, min_speech_ms=300):
        self.silence_frames_to_end = silence_ms // FRAME_MS
        self.partial_every = SAMPLE_RATE * partial_every_ms // 1000
        self.max_samples = SAMPLE_RATE * max_utterance_s
        self.min_speech_frames = min_speech_ms // FRAME_MS
        self.pending = np.zeros(0, dtype=np.float32)
        # keep 300 ms of audio from before speech starts so the first syllable isn't cut off
        self.preroll = collections.deque(maxlen=10)
        self.frames = []
        self.in_speech = False
        self.speech_frames = 0
        self.silent_frames = 0
        self.since_partial = 0
        self.noise_floor = 0.003

    def feed(self, pcm: bytes):
        self.pending = np.concatenate([self.pending, pcm16_to_float(pcm)])
        events = []
        while len(self.pending) >= FRAME_SAMPLES:
            frame = self.pending[:FRAME_SAMPLES]
            self.pending = self.pending[FRAME_SAMPLES:]
            rms = float(np.sqrt(np.mean(frame**2)))
            loud = rms > max(0.01, self.noise_floor * 3)

            if not self.in_speech:
                if loud:
                    self.in_speech = True
                    self.frames = list(self.preroll) + [frame]
                    self.speech_frames = 1
                    self.silent_frames = 0
                    self.since_partial = 0
                else:
                    # learn how loud the room is when nobody is talking
                    self.noise_floor = 0.95 * self.noise_floor + 0.05 * rms
                    self.preroll.append(frame)
                continue

            self.frames.append(frame)
            self.since_partial += FRAME_SAMPLES
            if loud:
                self.speech_frames += 1
                self.silent_frames = 0
            else:
                self.silent_frames += 1

            too_long = len(self.frames) * FRAME_SAMPLES >= self.max_samples
            if self.silent_frames >= self.silence_frames_to_end or too_long:
                event = self._end_utterance()
                if event:
                    events.append(event)
            elif self.since_partial >= self.partial_every:
                self.since_partial = 0
                events.append(("partial", np.concatenate(self.frames)))

        # only the newest partial is worth transcribing
        finals = [e for e in events if e[0] == "final"]
        if events and events[-1][0] == "partial":
            return finals + [events[-1]]
        return finals

    def flush(self):
        """Call when the stream ends, so a half-finished utterance still gets finalized."""
        if not self.in_speech:
            return []
        event = self._end_utterance()
        return [event] if event else []

    def _end_utterance(self):
        audio = np.concatenate(self.frames)
        long_enough = self.speech_frames >= self.min_speech_frames  # ignore coughs and clicks
        self.in_speech = False
        self.frames = []
        self.preroll.clear()
        return ("final", audio) if long_enough else None


def transcribe(audio: np.ndarray, languages=None, partial=False, with_confidence=False):
    """Run Whisper. If `languages` is e.g. ["hi", "en"], the result is forced to one of those two.

    Returns (text, language_code), or (text, language_code, confidence) when with_confidence=True.
    confidence = how sure Whisper is about the chosen language compared to the other one (0..1),
    or None when only one language is allowed.
    """
    model = get_model()
    seconds = len(audio) / SAMPLE_RATE
    opts = dict(
        beam_size=1 if partial else 5,  # partials: fast and rough; finals: slower and accurate
        temperature=0.0,  # no retries at higher temperatures (that made Hindi partials take 12 s)
        no_repeat_ngram_size=3,  # stop "अगर अगर अगर ..." style repetition loops
        max_new_tokens=min(int(seconds * 20) + 10, 400),  # a few seconds of speech can't need more
        without_timestamps=True,
        condition_on_previous_text=False,
    )
    fixed = languages[0] if languages and len(languages) == 1 else None

    confidence = None
    segments, info = model.transcribe(audio, language=fixed, **opts)
    if fixed is None and languages:
        # Whisper scores all ~100 languages; pick whichever of OUR two scored higher.
        # This is what lets two-way mode switch direction automatically.
        probs = dict(info.all_language_probs or [])
        best = max(languages, key=lambda code: probs.get(code, 0.0))
        total = sum(probs.get(code, 0.0) for code in languages)
        confidence = probs.get(best, 0.0) / total if total else None
        if best != info.language:
            segments, info = model.transcribe(audio, language=best, **opts)

    text = " ".join(s.text.strip() for s in segments).strip()
    if with_confidence:
        return text, info.language, confidence
    return text, info.language
