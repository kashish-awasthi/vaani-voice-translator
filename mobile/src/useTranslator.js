// Talks to the FastAPI server over a WebSocket: sends microphone audio, receives captions + translations.
import { useRef, useState } from 'react';

export function useTranslator() {
  const socketRef = useRef(null);
  const handlersRef = useRef({});
  const [status, setStatus] = useState('idle'); // idle | connecting | live | finishing
  const [partial, setPartial] = useState({ text: '', lang: null }); // live caption of the sentence being spoken now
  const [messages, setMessages] = useState([]); // finished sentences with their translations
  const [error, setError] = useState(null);

  // onFinal(msg): a sentence was translated. onLost(): the server went away mid-conversation.
  function connect(url, languages, target, { onFinal, onLost } = {}) {
    handlersRef.current = { onFinal, onLost };
    closeQuietly(socketRef.current);
    setError(null);
    setStatus('connecting');

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      socket.binaryType = 'arraybuffer';
      socketRef.current = socket;

      // 1st message: tell the server which languages we're using
      socket.onopen = () => {
        socket.opened = true;
        socket.send(JSON.stringify({ type: 'start', languages, target }));
      };

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
          handlersRef.current.onFinal?.(item);
        } else if (msg.type === 'error') {
          setError(msg.message);
        }
      };

      socket.onerror = () => {
        if (!socket.opened) {
          setError("Can't reach the server. Check that it's running and the phone is on the same Wi-Fi.");
          reject(new Error('connection failed'));
        }
      };

      socket.onclose = () => {
        if (socketRef.current !== socket) return;
        socketRef.current = null;
        setStatus('idle');
        setPartial({ text: '', lang: null });
        if (socket.opened && !socket.intentional) {
          // the server stopped or Wi-Fi dropped while we were talking
          setError('Connection to the server was lost.');
          handlersRef.current.onLost?.();
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
    socket.intentional = true;
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'stop' }));
    setStatus('finishing');
    setTimeout(() => socket.close(), 10000);
  }

  function disconnect() {
    closeQuietly(socketRef.current);
  }

  return {
    status,
    partial,
    messages,
    error,
    connect,
    sendAudio,
    finish,
    disconnect,
    clearError: () => setError(null),
    clear: () => setMessages([]),
  };
}

function closeQuietly(socket) {
  if (!socket) return;
  socket.intentional = true;
  socket.close();
}
