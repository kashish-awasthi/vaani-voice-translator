// One finished sentence as a card: who spoke (top strip), the translation (big) and the original (small)
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { getLanguage } from '../languages';
import { colors, shadow, type } from '../theme';

export function MessageBubble({ msg, right, onReplay }) {
  const confidence = msg.confidence != null ? Math.round(msg.confidence * 100) : null;
  const from = getLanguage(msg.lang);
  const to = getLanguage(msg.target);
  const accent = right ? colors.personB : colors.personA;
  const soft = right ? colors.personBSoft : colors.personASoft;

  // slide + fade in when a new message arrives
  const appear = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(appear, { toValue: 1, useNativeDriver: false, friction: 7 }).start();
  }, []);
  const animated = {
    opacity: appear,
    transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };

  return (
    <Animated.View style={[styles.wrap, right && styles.wrapRight, animated]}>
      <View style={[styles.card, right ? { borderTopRightRadius: 8 } : { borderTopLeftRadius: 8 }]}>
        <View style={[styles.head, { backgroundColor: soft }]}>
          <Text style={styles.flag}>{from.flag}</Text>
          <Text style={[styles.meta, { color: accent }]}>
            {from.name} → {to.name}
          </Text>
          {confidence != null && (
            // two-way mode: which language Whisper picked, and how sure it was
            <View style={styles.latency}>
              <Ionicons name="sparkles" size={10} color={accent} />
              <Text style={[styles.latencyText, { color: accent }]}>Auto-detected · {confidence}%</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.original}>{msg.text}</Text>
          <Text style={styles.translation}>{msg.translation ?? 'Translation unavailable'}</Text>
          <View style={styles.footer}>
            {msg.translation ? (
              <Pressable onPress={onReplay} hitSlop={10} style={[styles.replay, { backgroundColor: soft }]}>
                <Ionicons name="volume-medium" size={14} color={accent} />
                <Text style={[styles.replayText, { color: accent }]}>Play</Text>
              </Pressable>
            ) : null}
            <View style={{ flex: 1 }} />
            {/* how long each stage of the pipeline took */}
            <Timing icon="pulse-outline" label="Whisper" ms={msg.timing_ms.speech} />
            <Timing icon="language-outline" label="Translate" ms={msg.timing_ms.translate} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// under 50 ms means the answer came from the translation cache, not the network
function Timing({ icon, label, ms }) {
  return (
    <View style={styles.timing}>
      <Ionicons name={icon} size={10} color={colors.muted} />
      <Text style={styles.timingText}>
        {label} {ms < 50 ? 'cached' : `${(ms / 1000).toFixed(1)}s`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: '88%', alignSelf: 'flex-start' },
  wrapRight: { alignSelf: 'flex-end' },
  card: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  flag: { fontSize: 13 },
  meta: { flex: 1, fontSize: 11, ...type.bold },
  latency: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  latencyText: { fontSize: 11, ...type.semibold },
  body: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12, gap: 6 },
  original: { color: colors.muted, fontSize: 13.5, lineHeight: 19 },
  translation: { color: colors.text, fontSize: 19, lineHeight: 27, ...type.semibold },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  replay: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  timing: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.surfaceAlt, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 9 },
  timingText: { color: colors.muted, fontSize: 10.5, ...type.semibold },
  replayText: { fontSize: 12, ...type.semibold },
});
