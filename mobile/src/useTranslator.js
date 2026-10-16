// Talks to the FastAPI server over a WebSocket: sends microphone audio, receives captions + translations.
import { useRef, useState } from 'react';

export function useTranslator() {
  const socketRef = useRef(null);
  const onFinalRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | connecting | live | finishing
  const [partial, setPartial] = useState({ text: '', lang: null }); // live caption of the sentence being spoken now
  const [messages, setMessages] = useState([]); // finished sentences with their translations
  const [error, setError] = useState(null);

  function connect(url, languages, target, onFinal) {
    onFinalRef.current = onFinal;
    socketRef.current?.close();
    setError(null);
    setStatus('connecting');

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      socket.binaryType = 'arraybuffer';
      socketRef.current = socket;

      // 1st message: tell the server which languages we're using
      socket.onopen = () => socket.send(JSON.stringify({ type: 'start', languages, target }));

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ready') {
          setStatus('live');
          resolve();
        } else if (msg.type === 'partial') {
          setPartial({ text: msg.text, lang: msg.lang });
        } else if (msg.type === 'final') {
          setPartial({ text: '', lang: null });
          const item = { ...msg, key: `${Date.now()}-${msg.id}`, time: new Date() };
          setMessages((list) => [...list, item]);
          onFinalRef.current?.(item);
        } else if (msg.type === 'error') {
          setError(msg.message);
        }
      };

      socket.onerror = () => {
        setError(`Can't reach the server at ${url}. Is it running, and is the phone on the same Wi-Fi?`);
        reject(new Error('connection failed'));
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
          setStatus('idle');
          setPartial({ text: '', lang: null });
        }
      };
    });
  }

  function sendAudio(chunk) {
    if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(chunk);
  }

  // User pressed stop: ask the server to finish the last sentence, then hang up a bit later
  function finish() {
    const socket = socketRef.current;
    if (!socket) return;
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'stop' }));
    setStatus('finishing');
    setTimeout(() => socket.close(), 10000);
  }

  function disconnect() {
    socketRef.current?.close();
  }

  return { status, partial, messages, error, connect, sendAudio, finish, disconnect, clear: () => setMessages([]) };
}
