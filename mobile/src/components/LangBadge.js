// Small rounded badge with a language code, e.g. "EN" or "HI"
import { StyleSheet, Text, View } from 'react-native';

import { type } from '../theme';

export function LangBadge({ code, color, background, size = 'md' }) {
  const small = size === 'sm';
  return (
    <View style={[styles.badge, small && styles.small, { backgroundColor: background }]}>
      <Text style={[styles.text, small && styles.smallText, { color }]}>{code.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { minWidth: 34, height: 26, borderRadius: 8, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  small: { minWidth: 26, height: 20, borderRadius: 6, paddingHorizontal: 4 },
  text: { ...type.caption, fontWeight: '700', letterSpacing: 0.5 },
  smallText: { fontSize: 10, lineHeight: 12 },
});
