// What the screen shows before the first sentence
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, type, useStyles, useTheme } from '../theme';
import { Pipeline } from './Pipeline';

export function EmptyState({ mode }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const twoWay = mode === 'two-way';
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name={twoWay ? 'chatbubbles-outline' : 'reader-outline'} size={26} color={colors.accent} />
      </View>
      <Text style={styles.title}>{twoWay ? 'Start a conversation' : 'Live captions'}</Text>
      <Text style={styles.body}>
        {twoWay
          ? 'Tap the microphone and take turns speaking. Vaani detects who is talking and translates for the other person.'
          : 'Tap the microphone and speak. Your words are transcribed and translated as you talk.'}
      </Text>
      <View style={styles.how}>
        <Text style={styles.howTitle}>How it works</Text>
        <Pipeline />
      </View>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
    icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    title: { ...type.title, color: c.text, marginBottom: spacing.sm },
    body: { ...type.callout, color: c.textSecondary, textAlign: 'center', maxWidth: 320 },
    how: {
      alignSelf: 'stretch',
      marginTop: spacing.xl,
      paddingVertical: spacing.lg,
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    howTitle: { ...type.label, color: c.textTertiary, textAlign: 'center', marginBottom: spacing.md },
  });
