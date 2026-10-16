// code = what Whisper and the translation API use, voice = what the phone's text-to-speech uses
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', voice: 'en-US' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', voice: 'hi-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', voice: 'bn-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', voice: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', voice: 'te-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', voice: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', voice: 'gu-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', voice: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', voice: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', voice: 'pa-IN' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', voice: 'ur-PK' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', voice: 'fr-FR' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', voice: 'es-ES' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', voice: 'de-DE' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', voice: 'ja-JP' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳', voice: 'zh-CN' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', voice: 'ar-SA' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', voice: 'ru-RU' },
];

export const getLanguage = (code) => LANGUAGES.find((l) => l.code === code) ?? { code, name: code, native: code, flag: '🌐', voice: code };
export const voiceFor = (code) => getLanguage(code).voice;
