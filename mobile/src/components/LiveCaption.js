// The card that shows what is being said right now (before the sentence is finished)
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { getLanguage } from '../languages';
import { colors, fonts, shadow, type } from '../theme';
import { Sheen } from './Sheen';

export function LiveCaption({ text, lang, listening }) {
  if (!listening && !text) return null;
  const language = lang ? getLanguage(lang) : null;
  return (
    <Sheen radius={22} width={1.5} style={styles.outer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Dots />
          <Text style={styles.label}>{text ? 'Hearing' : 'Listening'}</Text>
          {language && text ? <Text style={styles.lang}>{language.flag} {language.name}</Text> : null}
        </View>
        <Text style={[styles.text, !text && styles.placeholder]} numberOfLines={3}>
          {text || 'Go ahead, start speaking…'}
        </Text>
      </View>
    </Sheen>
  );
}

// three dots lighting up one after another
function Dots() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 1200, useNativeDriver: false }));
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => {
        const start = i * 0.2;
        const opacity = t.interpolate({ inputRange: [0, start, start + 0.2, start + 0.4, 1], outputRange: [0.25, 0.25, 1, 0.25, 0.25] });
        return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { marginHorizontal: 16, marginBottom: 4, ...shadow },
  card: { backgroundColor: colors.surface, borderRadius: 20.5, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.live },
  label: { color: colors.live, fontSize: 12, ...type.bold, flex: 1 },
  lang: { color: colors.muted, fontSize: 12, ...type.medium },
  text: { color: colors.text, fontSize: 17, lineHeight: 24, ...type.medium },
  placeholder: { color: colors.dim, fontFamily: fonts.serifItalic, fontSize: 18 },
});
