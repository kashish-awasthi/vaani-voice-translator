// What the screen shows before the first sentence
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, shadow, type } from '../theme';
import { Pipeline } from './Pipeline';
import { Sheen } from './Sheen';

export function EmptyState({ mode }) {
  return (
    <View style={styles.container}>
      <Sheen radius={30} width={2.5} style={shadow}>
        <View style={styles.icon}>
          <Ionicons name={mode === 'two-way' ? 'chatbubbles-outline' : 'reader-outline'} size={27} color={colors.ink} />
        </View>
      </Sheen>
      <Text style={styles.title}>
        {mode === 'two-way' ? 'Speak freely,\n' : 'Your words,\n'}
        <Text style={styles.titleItalic}>{mode === 'two-way' ? 'be understood.' : 'in any language.'}</Text>
      </Text>
      <Text style={styles.body}>
        {mode === 'two-way'
          ? 'Tap the mic and take turns talking. Each of you hears the other in your own language.'
          : 'Tap the mic and speak. Live captions appear and are translated as you talk.'}
      </Text>
      <View style={styles.how}>
        <Text style={styles.howTitle}>How it works</Text>
        <Pipeline showDetail />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 12, paddingTop: 4 },
  icon: { width: 60, height: 60, borderRadius: 23.5, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontFamily: fonts.serifBold, fontSize: 28, lineHeight: 34, textAlign: 'center', marginTop: 14 },
  titleItalic: { fontFamily: fonts.serifItalic, color: colors.mocha },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  how: { alignSelf: 'stretch', marginTop: 18, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 20, paddingVertical: 14 },
  howTitle: { color: colors.muted, fontSize: 11, ...type.bold, letterSpacing: 1, textAlign: 'center', marginBottom: 10, textTransform: 'uppercase' },
});
