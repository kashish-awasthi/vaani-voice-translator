// Pings the server's /health endpoint so the app can show "Server online" before you tap the mic
import { useEffect, useState } from 'react';

// ws://192.168.1.5:8500/ws  ->  http://192.168.1.5:8500/health
export const healthUrl = (wsUrl) => wsUrl.replace(/^ws/, 'http').replace(/\/ws\/?$/, '/health');

export async function checkServer(wsUrl, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(healthUrl(wsUrl), { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function useServerStatus(wsUrl, paused) {
  const [status, setStatus] = useState('checking'); // checking | online | offline

  useEffect(() => {
    if (paused) return; // no need to poll while a conversation is running
    let active = true;
    const run = async () => {
      const ok = await checkServer(wsUrl);
      if (active) setStatus(ok ? 'online' : 'offline');
    };
    run();
    const id = setInterval(run, 10000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [wsUrl, paused]);

  return status;
}
