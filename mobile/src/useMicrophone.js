// Phone version (iOS / Android): expo-audio streams raw microphone audio in small buffers.
import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioStream } from 'expo-audio';
import { useRef } from 'react';

import { TARGET_RATE, toPcm16k } from './audio';

export function useMicrophone(onChunk) {
  const onChunkRef = useRef(onChunk);
  onChunkRef.current = onChunk;

  const { stream } = useAudioStream({
    sampleRate: TARGET_RATE, // a request: the phone may still deliver 44.1/48 kHz
    channels: 1,
    encoding: 'int16',
    onBuffer: (buffer) => {
      const samples = new Int16Array(buffer.data);
      onChunkRef.current(toPcm16k(samples, buffer.sampleRate, buffer.channels));
    },
  });

  async function start() {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) throw new Error('Microphone access is off. Enable it for Expo Go in your phone settings.');
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await stream.start();
  }

  function stop() {
    stream.stop();
  }

  return { start, stop };
}
