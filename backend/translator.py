"""Translation layer: tries free translation APIs in order until one works."""
import functools

import requests

# Whisper and the translation APIs use different codes for a few languages
WHISPER_TO_API = {"zh": "zh-CN", "he": "iw", "jw": "jv"}


def _mymemory(text: str, src: str, tgt: str) -> str:
    """MyMemory: free, no API key (about 5,000 characters per day)."""
    r = requests.get(
        "https://api.mymemory.translated.net/get",
        params={"q": text, "langpair": f"{src}|{tgt}"},
        timeout=5,
    )
    r.raise_for_status()
    data = r.json()
    if data.get("responseStatus") != 200:
        raise RuntimeError(data.get("responseDetails"))
    if data["responseData"]["translatedText"]:
        return data["responseData"]["translatedText"]
    # MyMemory is crowd-sourced and sometimes stores a blank translation: use the next-best match
    for match in data.get("matches", []):
        if match.get("translation"):
            return match["translation"]
    raise RuntimeError("MyMemory returned an empty translation")


def _google(text: str, src: str, tgt: str) -> str:
    """Google's free endpoint: fast, but often blocks with 'too many requests'."""
    r = requests.get(
        "https://translate.googleapis.com/translate_a/single",
        params={"client": "gtx", "sl": src, "tl": tgt, "dt": "t", "q": text},
        timeout=5,
    )
    r.raise_for_status()
    return "".join(part[0] for part in r.json()[0] if part[0])


PROVIDERS = [_mymemory, _google]


@functools.lru_cache(maxsize=1024)
def translate(text: str, source: str, target: str) -> str:
    if not text or source == target:
        return text
    src = WHISPER_TO_API.get(source, source)
    tgt = WHISPER_TO_API.get(target, target)
    errors = []
    for provider in PROVIDERS:
        try:
            return provider(text, src, tgt)
        except Exception as e:  # this provider failed, try the next one
            errors.append(f"{provider.__name__}: {e}")
    raise RuntimeError("All translation providers failed: " + "; ".join(errors))


def other_language(detected: str, pair: list[str]) -> str:
    """Two-way mode: if person A spoke language A, translate into B, and vice versa."""
    a, b = pair
    return b if detected == a else a