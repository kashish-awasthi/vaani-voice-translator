// Phone version (iOS / Android): expo-audio streams raw microphone audio in small buffers.
import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioStream } from 'expo-audio';
import { useRef } from 'react';
import { Platform } from 'react-native';

import { TARGET_RATE, toPcm16k } from './audio';

export function useMicrophone(onChunk) {
  const onChunkRef = useRef(onChunk);
  onChunkRef.current = onChunk;
  const wantsToListen = useRef(false); // true between start() and stop(), even while paused for playback

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
    wantsToListen.current = true;
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) throw new Error('Microphone access is off. Enable it for Expo Go in your phone settings.');
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await stream.start();
  }

  function stop() {
    wantsToListen.current = false;
    stream.stop();
  }

  // On iPhone the mic stream puts the audio session in "record" mode, which mutes ALL sound output
  // (and it stays that way after the stream stops). So before speaking we stop the stream and
  // switch to "playback" mode, which also uses the loudspeaker.
  async function pauseForPlayback() {
    if (Platform.OS !== 'ios') return;
    stream.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  }

  // back to listening once the phone has finished speaking, unless the user pressed stop meanwhile
  async function resumeAfterPlayback() {
    if (Platform.OS !== 'ios' || !wantsToListen.current) return;
    await stream.start();
  }

  return { start, stop, pauseForPlayback, resumeAfterPlayback };
}
