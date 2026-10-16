// Wraps anything in a thin champagne-gold edge
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme';

export function Sheen({ children, radius = 22, width = 1.5, style }) {
  return (
    <LinearGradient colors={colors.sheen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[{ borderRadius: radius, padding: width }, style]}>
      {children}
    </LinearGradient>
  );
}
