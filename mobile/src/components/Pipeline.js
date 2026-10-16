// The processing pipeline: Listen -> Whisper -> Translate -> Speak.
// Used as a "How it works" diagram, and live (the current step lights up while you talk).
import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, type } from '../theme';

export const STEPS = [
  { icon: 'mic-outline', label: 'Listen', detail: 'Phone mic\n16 kHz audio' },
  { icon: 'pulse-outline', label: 'Whisper', detail: 'Speech → text\n+ language' },
  { icon: 'language-outline', label: 'Translate', detail: 'Text → other\nlanguage' },
  { icon: 'volume-high-outline', label: 'Speak', detail: 'Phone reads\nit aloud' },
];

// active: index of the step happening now (-1 = none). showDetail: the small descriptions under each step.
export function Pipeline({ active = -1, showDetail = false }) {
  return (
    <View style={styles.row}>
      {STEPS.map((step, i) => {
        const on = i === active;
        const done = active > i;
        return (
          <Fragment key={step.label}>
            {i > 0 && <View style={[styles.line, (on || done) && styles.lineOn]} />}
            <View style={styles.step}>
              <View style={[styles.icon, on && styles.iconOn, done && styles.iconDone]}>
                <Ionicons name={step.icon} size={16} color={on ? colors.onInk : done ? colors.mocha : colors.muted} />
              </View>
              <Text style={[styles.label, on && styles.labelOn]}>{step.label}</Text>
              {showDetail && <Text style={styles.detail}>{step.detail}</Text>}
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  step: { alignItems: 'center', width: 74 },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  iconDone: { backgroundColor: colors.personASoft, borderColor: colors.personASoft },
  label: { color: colors.muted, fontSize: 11, ...type.semibold, marginTop: 5 },
  labelOn: { color: colors.ink },
  detail: { color: colors.dim, fontSize: 10, lineHeight: 13, textAlign: 'center', marginTop: 2 },
  line: { height: 1.5, flex: 1, maxWidth: 14, backgroundColor: colors.border, marginTop: 17 },
  lineOn: { backgroundColor: colors.mocha },
});
