// The server expects 16 kHz, mono, 16-bit PCM (the format Whisper uses).
// Phones and browsers usually record at 44.1 or 48 kHz, so we convert here before sending.
export const TARGET_RATE = 16000;

/**
 * samples: Int16Array (values -32768..32767) or Float32Array (values -1..1), possibly multi-channel
 * returns: ArrayBuffer of 16 kHz mono Int16 samples, ready to send over the WebSocket
 */
export function toPcm16k(samples, sampleRate, channels = 1) {
  const isFloat = samples instanceof Float32Array;
  const frames = Math.floor(samples.length / channels);
  const ratio = sampleRate / TARGET_RATE; // e.g. 48000 / 16000 = 3 input samples per output sample
  const outLength = Math.floor(frames / ratio);
  const out = new Int16Array(outLength);

  for (let i = 0; i < outLength; i++) {
    // average the input samples that fall into this output sample (simple anti-aliasing filter)
    const from = Math.floor(i * ratio);
    const to = Math.max(from + 1, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = from; j < to && j < frames; j++) sum += samples[j * channels]; // first channel only
    let value = sum / (to - from);
    if (isFloat) value *= 32767;
    out[i] = Math.max(-32768, Math.min(32767, Math.round(value)));
  }
  return out.buffer;
}
