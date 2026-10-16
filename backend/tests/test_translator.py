"""Translation direction logic (no network needed)."""
from translator import other_language, translate


def test_two_way_direction_switches_automatically():
    assert other_language("en", ["en", "hi"]) == "hi"
    assert other_language("hi", ["en", "hi"]) == "en"


def test_same_language_and_empty_text_skip_the_api():
    assert translate("hello", "en", "en") == "hello"
    assert translate("", "en", "hi") == ""
