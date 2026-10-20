// Design system: colours (light + dark), type scale, spacing and corner radii.
// Every screen reads from here, so the whole app stays consistent.
import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

const light = {
  background: '#F7F5F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F0ECE7',
  border: '#E5DFD8',
  text: '#1C1917',
  textSecondary: '#6B635B',
  textTertiary: '#A1978D',
  accent: '#7A5A45', // mocha: primary actions, mic, selected states
  onAccent: '#FFFFFF',
  accentSoft: '#F1E8E1',
  speakerA: '#7A5A45',
  speakerASoft: '#F1E8E1',
  speakerB: '#9C6F2A',
  speakerBSoft: '#F6EDDD',
  live: '#C8442F',
  liveSoft: '#FBE9E5',
  success: '#2F8A55',
  danger: '#C8442F',
  dangerSoft: '#FBE9E5',
  overlay: 'rgba(28,25,23,0.35)',
  shadow: '#3B2A1F',
};

const dark = {
  background: '#121110',
  surface: '#1C1A18',
  surfaceAlt: '#272421',
  border: '#36312C',
  text: '#F5F2EE',
  textSecondary: '#B4AAA0',
  textTertiary: '#7E756C',
  accent: '#C9A487',
  onAccent: '#1C1917',
  accentSoft: '#2F2621',
  speakerA: '#C9A487',
  speakerASoft: '#2F2621',
  speakerB: '#D9B26A',
  speakerBSoft: '#2F2819',
  live: '#F06A55',
  liveSoft: '#3A1E19',
  success: '#5CC489',
  danger: '#F06A55',
  dangerSoft: '#3A1E19',
  overlay: 'rgba(0,0,0,0.55)',
  shadow: '#000000',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };

// system font (San Francisco on iPhone, Roboto on Android), like native apps
export const type = {
  largeTitle: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.4 },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22 },
  callout: { fontSize: 15, lineHeight: 20 },
  subhead: { fontSize: 14, lineHeight: 19 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
};

const ThemeContext = createContext({ colors: light, isDark: false });

// follows the phone's light/dark setting
export function ThemeProvider({ children }) {
  const scheme = useColorScheme();
  const value = useMemo(() => ({ colors: scheme === 'dark' ? dark : light, isDark: scheme === 'dark' }), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// build a StyleSheet from the current colours (rebuilt only when the theme changes)
export function useStyles(factory) {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors]);
}

export const cardShadow = (colors) => ({
  shadowColor: colors.shadow,
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
});
