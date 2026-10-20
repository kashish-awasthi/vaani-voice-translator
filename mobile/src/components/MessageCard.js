// One translated sentence: who spoke, the translation (large), the original (small) and actions
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { getLanguage } from '../languages';
import { cardShadow, radius, spacing, type, useStyles, useTheme } from '../theme';
import { LangBadge } from './LangBadge';

export function MessageCard({ msg, speaker, alignEnd, onPlay }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  const from = getLanguage(msg.lang);
  const to = getLanguage(msg.target);
  const accent = speaker === 'B' ? colors.speakerB : colors.speakerA;
  const soft = speaker === 'B' ? colors.speakerBSoft : colors.speakerASoft;
  const confidence = msg.confidence != null ? Math.round(msg.confidence * 100) : null;

  // fade + slide in when a new message arrives
  const appear = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 220, useNativeDriver: false }).start();
  }, []);

  async function copy() {
    await Clipboard.setStringAsync(msg.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Animated.View
      style={[
        styles.wrap,
        alignEnd && styles.wrapEnd,
        { opacity: appear, transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <Text style={[styles.speaker, { color: accent }]} numberOfLines={1}>
            {speaker ? `Person ${speaker}` : 'You'}
          </Text>
          <View style={{ flex: 1 }} />
          <LangBadge code={from.code} color={accent} background={soft} size="sm" />
          <Ionicons name="arrow-forward" size={11} color={colors.textTertiary} />
          <LangBadge code={to.code} color={colors.textSecondary} background={colors.surfaceAlt} size="sm" />
        </View>

        <Text style={styles.translation} selectable>
          {msg.translation ?? 'Translation unavailable'}
        </Text>
        <Text style={styles.original} selectable>
          {msg.text}
        </Text>

        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            {confidence != null && <Text style={styles.timing}>Auto-detected · {confidence}% confident</Text>}
            <Text style={styles.timing}>
              Whisper {seconds(msg.timing_ms.speech)} · Translate {msg.timing_ms.translate < 50 ? 'cached' : seconds(msg.timing_ms.translate)}
            </Text>
          </View>
          {msg.translation ? (
            <View style={styles.actions}>
              <IconButton icon={copied ? 'checkmark' : 'copy-outline'} label={copied ? 'Copied' : 'Copy translation'} onPress={copy} />
              <IconButton icon="volume-medium-outline" label="Play translation" onPress={onPlay} />
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

function IconButton({ icon, label, onPress }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.5 }]} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const seconds = (ms) => `${(ms / 1000).toFixed(1)} s`;

const makeStyles = (c) =>
  StyleSheet.create({
    wrap: { width: '90%', alignSelf: 'flex-start' },
    wrapEnd: { alignSelf: 'flex-end' },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: spacing.lg,
      gap: spacing.sm,
      ...cardShadow(c),
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    speaker: { ...type.footnote, fontWeight: '600', marginRight: 2 },
    translation: { ...type.title, color: c.text },
    original: { ...type.callout, color: c.textSecondary },
    footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    timing: { ...type.caption, color: c.textTertiary },
    actions: { flexDirection: 'row', gap: spacing.xs },
    iconButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceAlt },
  });
