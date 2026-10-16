"""The WebSocket protocol end to end, with Whisper and the translation API replaced by fakes."""
import json

import numpy as np
from fastapi.testclient import TestClient

import main
from asr import SAMPLE_RATE


def fake_transcribe(audio, languages, partial=False, with_confidence=False):
    # pretend the first sentence is English and anything longer is Hindi
    lang = "en" if len(audio) < SAMPLE_RATE * 2.8 else "hi"  # 1 s sentence ≈ 2 s with pre-roll + pause
    return ("partial words" if partial else f"sentence in {lang}", lang, 0.9)


def make_client(monkeypatch):
    monkeypatch.setattr(main, "get_model", lambda: None)  # don't load the real model
    monkeypatch.setattr(main, "transcribe", fake_transcribe)
    monkeypatch.setattr(main, "translate", lambda text, src, tgt: f"[{src}->{tgt}] {text}")
    return TestClient(main.app)


def speech(seconds):
    t = np.arange(int(SAMPLE_RATE * seconds)) / SAMPLE_RATE
    audio = np.concatenate([np.zeros(SAMPLE_RATE // 2), 0.3 * np.sin(2 * np.pi * 220 * t), np.zeros(SAMPLE_RATE)])
    return (audio * 32767).astype(np.int16).tobytes()


def test_health(monkeypatch):
    with make_client(monkeypatch) as client:
        assert client.get("/health").json() == {"status": "ok"}


def test_two_way_conversation_switches_direction(monkeypatch):
    with make_client(monkeypatch) as client, client.websocket_connect("/ws") as ws:
        ws.send_text(json.dumps({"type": "start", "languages": ["en", "hi"]}))
        assert ws.receive_json() == {"type": "ready"}

        results = []
        for seconds in (1.0, 2.5):  # a short (English) then a long (Hindi) sentence
            ws.send_bytes(speech(seconds))
            msg = ws.receive_json()
            while msg["type"] != "final":
                msg = ws.receive_json()
            results.append(msg)

    assert [(m["lang"], m["target"]) for m in results] == [("en", "hi"), ("hi", "en")]
    assert results[0]["translation"] == "[en->hi] sentence in en"
    assert results[0]["confidence"] == 0.9
    assert set(results[0]["timing_ms"]) == {"speech", "translate"}
