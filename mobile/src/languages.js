// code = what Whisper and the translation API use, voice = what the phone's text-to-speech uses
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', voice: 'en-US' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', voice: 'hi-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', voice: 'bn-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', voice: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', voice: 'te-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', voice: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', voice: 'gu-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', voice: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', voice: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', voice: 'pa-IN' },
  { code: 'ur', name: 'Urdu', native: 'اردو', voice: 'ur-PK' },
  { code: 'fr', name: 'French', native: 'Français', voice: 'fr-FR' },
  { code: 'es', name: 'Spanish', native: 'Español', voice: 'es-ES' },
  { code: 'de', name: 'German', native: 'Deutsch', voice: 'de-DE' },
  { code: 'ja', name: 'Japanese', native: '日本語', voice: 'ja-JP' },
  { code: 'zh', name: 'Chinese', native: '中文', voice: 'zh-CN' },
  { code: 'ar', name: 'Arabic', native: 'العربية', voice: 'ar-SA' },
  { code: 'ru', name: 'Russian', native: 'Русский', voice: 'ru-RU' },
];

export const getLanguage = (code) => LANGUAGES.find((l) => l.code === code) ?? { code, name: code, native: code, voice: code };
export const voiceFor = (code) => getLanguage(code).voice;
