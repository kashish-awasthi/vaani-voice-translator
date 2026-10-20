// Bottom control area: live caption, pipeline status, waveform and the microphone button
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { getLanguage } from '../languages';
import { spacing, type, useStyles, useTheme } from '../theme';
import { LangBadge } from './LangBadge';
import { Pipeline } from './Pipeline';
import { Waveform } from './Waveform';

export function ControlDock({ status, stage, partial, level, levelRef, onPressMic, bottomInset, hint }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const live = status === 'live';
  const lang = partial.lang ? getLanguage(partial.lang) : null;

  return (
    <View style={[styles.dock, { paddingBottom: bottomInset + spacing.sm }]}>
      {stage >= 0 && (
        <View style={styles.pipeline}>
          <Pipeline active={stage} compact />
        </View>
      )}

      {live && (
        <View style={styles.caption} accessibilityLiveRegion="polite">
          <View style={styles.captionHeader}>
            <View style={styles.liveDot} />
            <Text style={styles.captionLabel}>{partial.text ? 'Hearing' : 'Listening'}</Text>
            {partial.text && lang ? <LangBadge code={lang.code} color={colors.textSecondary} background={colors.surfaceAlt} size="sm" /> : null}
          </View>
          <Text style={[styles.captionText, !partial.text && styles.captionPlaceholder]} numberOfLines={2}>
            {partial.text || 'Start speaking…'}
          </Text>
        </View>
      )}

      <View style={styles.controls}>
        <View style={styles.side}>{live ? <Waveform levelRef={levelRef} /> : null}</View>
        <MicButton status={status} level={level} onPress={onPressMic} />
        <View style={styles.side} />
      </View>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const SIZE = 60;

function MicButton({ status, level, onPress }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const live = status === 'live';
  const busy = status === 'connecting';
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!live) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: false }));
    loop.start();
    return () => loop.stop();
  }, [live]);

  // a ring that pulses outward, and grows a little more when you speak louder
  const ring = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
    transform: [{ scale: Animated.add(pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }), Animated.multiply(level, 0.25)) }],
  };

  return (
    <View style={styles.micWrap}>
      {live && <Animated.View style={[styles.ring, { backgroundColor: colors.live }, ring]} />}
      <Pressable
        onPress={onPress}
        disabled={busy}
        style={({ pressed }) => [styles.mic, live && { backgroundColor: colors.live }, pressed && { transform: [{ scale: 0.95 }] }]}
        accessibilityRole="button"
        accessibilityLabel={live ? 'Stop listening' : 'Start listening'}
      >
        {busy ? <ActivityIndicator color={colors.onAccent} /> : <Ionicons name={live ? 'stop' : 'mic'} size={live ? 24 : 28} color={live ? '#FFFFFF' : colors.onAccent} />}
      </Pressable>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    dock: {
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    pipeline: { marginBottom: spacing.sm },
    caption: { backgroundColor: c.surfaceAlt, borderRadius: 14, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.xs, gap: 2 },
    captionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.live },
    captionLabel: { ...type.footnote, fontWeight: '600', color: c.live, flex: 1 },
    captionText: { ...type.body, color: c.text },
    captionPlaceholder: { color: c.textTertiary },
    controls: { flexDirection: 'row', alignItems: 'center' },
    side: { flex: 1, alignItems: 'center', overflow: 'hidden' },
    micWrap: { width: SIZE + 20, height: SIZE + 20, alignItems: 'center', justifyContent: 'center' },
    ring: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
    mic: {
      width: SIZE,
      height: SIZE,
      borderRadius: SIZE / 2,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    hint: { ...type.footnote, color: c.textSecondary, textAlign: 'center' },
  });
