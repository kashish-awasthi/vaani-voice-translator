import { Platform } from 'react-native';

// The phone must reach the Mac over Wi-Fi, so it needs the Mac's IP address (not "localhost").
// Find it with:  ipconfig getifaddr en0
const MAC_IP = '10.8.192.218';
const PORT = 8500;

export const DEFAULT_SERVER_URL =
  Platform.OS === 'web'
    ? `ws://${window.location.hostname}:${PORT}/ws` // in a browser on the Mac, the server is on the same machine
    : `ws://${MAC_IP}:${PORT}/ws`;
