// The processing pipeline: Listen -> Whisper -> Translate -> Speak.
// Shown as a small "How it works" diagram, and live (the current step is highlighted) while talking.
import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, type, useStyles, useTheme } from '../theme';

export const STEPS = [
  { icon: 'mic-outline', label: 'Listen', detail: '16 kHz audio' },
  { icon: 'pulse-outline', label: 'Whisper', detail: 'Speech to text' },
  { icon: 'language-outline', label: 'Translate', detail: 'Other language' },
  { icon: 'volume-medium-outline', label: 'Speak', detail: 'Read aloud' },
];

// active: index of the step happening now (-1 = none). compact: icons + labels only.
export function Pipeline({ active = -1, compact = false }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityLabel={active >= 0 ? `Current step: ${STEPS[active].label}` : 'Listen, Whisper, Translate, Speak'}>
      {STEPS.map((step, i) => {
        const on = i === active;
        const done = active > i;
        return (
          <Fragment key={step.label}>
            {i > 0 && <View style={[styles.line, (on || done) && { backgroundColor: colors.accent }]} />}
            <View style={styles.step}>
              <View style={[styles.icon, compact && styles.iconCompact, on && styles.iconOn, done && styles.iconDone]}>
                <Ionicons name={step.icon} size={compact ? 14 : 16} color={on ? colors.onAccent : done ? colors.accent : colors.textTertiary} />
              </View>
              <Text style={[styles.label, (on || done) && { color: colors.text }]}>{step.label}</Text>
              {!compact && <Text style={styles.detail}>{step.detail}</Text>}
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
    step: { alignItems: 'center', width: 70 },
    icon: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    iconCompact: { width: 26, height: 26, borderRadius: 13 },
    iconOn: { backgroundColor: c.accent },
    iconDone: { backgroundColor: c.accentSoft },
    label: { ...type.caption, fontWeight: '600', color: c.textTertiary, marginTop: spacing.xs },
    detail: { ...type.caption, color: c.textTertiary, textAlign: 'center' },
    line: { height: 1, flex: 1, maxWidth: 16, backgroundColor: c.border, marginTop: 13 },
  });
