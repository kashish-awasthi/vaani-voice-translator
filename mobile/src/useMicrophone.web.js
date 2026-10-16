// Browser version: Expo picks this file automatically when the app runs on the web.
// Uses the Web Audio API to get raw microphone samples.
import { useRef } from 'react';

import { toPcm16k } from './audio';

export function useMicrophone(onChunk) {
  const onChunkRef = useRef(onChunk);
  onChunkRef.current = onChunk;
  const nodes = useRef(null);

  async function start() {
    let media;
    try {
      media = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      throw new Error('Microphone access is blocked. Allow it in your browser settings and try again.');
    }
    const context = new AudioContext();
    const source = context.createMediaStreamSource(media);
    // 4096 samples at 48 kHz = about 85 ms per chunk
    const processor = context.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => {
      const samples = event.inputBuffer.getChannelData(0); // Float32Array, -1..1
      onChunkRef.current(toPcm16k(samples, context.sampleRate, 1));
    };
    source.connect(processor);
    processor.connect(context.destination); // required in some browsers for onaudioprocess to fire
    nodes.current = { media, context, source, processor };
  }

  function stop() {
    if (!nodes.current) return;
    const { media, context, source, processor } = nodes.current;
    processor.disconnect();
    source.disconnect();
    media.getTracks().forEach((track) => track.stop());
    context.close();
    nodes.current = null;
  }

  return { start, stop };
}
