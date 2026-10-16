"""Voice-activity detection: does the stream get cut into the right sentences?"""
import numpy as np

from asr import SAMPLE_RATE, StreamingTranscriber


def tone(seconds, amplitude=0.3):
    t = np.arange(int(SAMPLE_RATE * seconds)) / SAMPLE_RATE
    return amplitude * np.sin(2 * np.pi * 220 * t)


def silence(seconds):
    return np.zeros(int(SAMPLE_RATE * seconds))


def to_pcm(samples):
    return (samples * 32767).astype(np.int16).tobytes()


def stream_in_chunks(transcriber, samples, chunk_ms=100):
    pcm = to_pcm(samples)
    size = SAMPLE_RATE * chunk_ms // 1000 * 2
    events = []
    for i in range(0, len(pcm), size):
        events += transcriber.feed(pcm[i:i + size])
    return events


def finals(events):
    return [audio for kind, audio in events if kind == "final"]


def test_two_sentences_with_a_pause_become_two_finals():
    audio = np.concatenate([silence(0.5), tone(1.0), silence(1.0), tone(0.8), silence(1.0)])
    events = stream_in_chunks(StreamingTranscriber(), audio)
    sentences = finals(events)
    assert len(sentences) == 2
    # each sentence holds its speech plus the pre-roll and trailing silence, not the whole stream
    assert 1.0 <= len(sentences[0]) / SAMPLE_RATE < 2.2


def test_partials_are_emitted_while_still_speaking():
    events = stream_in_chunks(StreamingTranscriber(), np.concatenate([silence(0.3), tone(3.0)]))
    assert any(kind == "partial" for kind, _ in events)
    assert not finals(events)  # no pause yet, so nothing is final


def test_short_clicks_are_ignored():
    audio = np.concatenate([silence(0.5), tone(0.1), silence(1.0)])
    assert finals(stream_in_chunks(StreamingTranscriber(), audio)) == []


def test_flush_finishes_a_sentence_cut_off_by_stop():
    transcriber = StreamingTranscriber()
    stream_in_chunks(transcriber, np.concatenate([silence(0.3), tone(1.0)]))
    assert len(finals(transcriber.flush())) == 1


def test_very_long_speech_is_split_at_the_maximum_length():
    events = stream_in_chunks(StreamingTranscriber(max_utterance_s=5), tone(12.0))
    assert len(finals(events)) == 2
