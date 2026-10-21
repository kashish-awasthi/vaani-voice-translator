import Constants from 'expo-constants';
import { Platform } from 'react-native';

// The phone must reach the Mac over Wi-Fi, so it needs the Mac's IP address (not "localhost").
// When the app is opened from `npx expo start`, Expo already knows that address (the same one in
// the QR code), so we reuse it. That way it keeps working when you switch Wi-Fi networks.
// If it can't be detected, set it by hand in the app under Settings → Server address.
const PORT = 8500;
const FALLBACK_IP = '192.168.1.60'; // find yours with:  ipconfig getifaddr en0

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0]; // e.g. "192.168.1.60:8081" -> "192.168.1.60"

export const DEFAULT_SERVER_URL =
  Platform.OS === 'web'
    ? `ws://${window.location.hostname}:${PORT}/ws` // in a browser on the Mac, the server is on the same machine
    : `ws://${expoHost || FALLBACK_IP}:${PORT}/ws`;
