// The two language cards with a swap button in the middle
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getLanguage } from '../languages';
import { colors, shadow, type } from '../theme';
import { LanguageSheet } from './LanguageSheet';
import { Sheen } from './Sheen';

export function LanguageBar({ mode, langA, langB, onChangeA, onChangeB, disabled }) {
  const [picking, setPicking] = useState(null); // 'A' | 'B' | null
  const labels = mode === 'two-way' ? ['Person A', 'Person B'] : ['From', 'To'];

  return (
    <View style={[styles.container, disabled && { opacity: 0.8 }]}>
      <LanguageCard label={labels[0]} code={langA} accent={colors.personA} soft={colors.personASoft} disabled={disabled} onPress={() => setPicking('A')} />

      <Pressable
        disabled={disabled}
        onPress={() => {
          onChangeA(langB);
          onChangeB(langA);
        }}
        style={styles.swapWrap}
      >
        <Sheen radius={26} width={3}>
          <View style={styles.swap}>
            <Ionicons name={mode === 'two-way' ? 'swap-horizontal' : 'arrow-forward'} size={19} color={colors.onInk} />
          </View>
        </Sheen>
      </Pressable>

      <LanguageCard label={labels[1]} code={langB} accent={colors.personB} soft={colors.personBSoft} disabled={disabled} onPress={() => setPicking('B')} alignRight />

      <LanguageSheet
        visible={picking !== null}
        selected={picking === 'A' ? langA : langB}
        title={picking === 'A' ? labels[0] : labels[1]}
        onClose={() => setPicking(null)}
        onSelect={(code) => {
          (picking === 'A' ? onChangeA : onChangeB)(code);
          setPicking(null);
        }}
      />
    </View>
  );
}

function LanguageCard({ label, code, accent, soft, onPress, disabled, alignRight }) {
  const lang = getLanguage(code);
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}>
      <View style={[styles.cardInner, alignRight && { alignItems: 'flex-end' }]}>
        <View style={[styles.tag, { backgroundColor: soft, alignSelf: alignRight ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.tagText, { color: accent }]}>{label}</Text>
        </View>
        <Text style={styles.native} numberOfLines={1}>{lang.native}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.flag}>{lang.flag}</Text>
          <Text style={styles.name}>{lang.name}</Text>
          {!disabled && <Ionicons name="chevron-down" size={12} color={colors.dim} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  card: { flex: 1, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 24, ...shadow },
  cardInner: { padding: 16, gap: 6 },
  tag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 11, ...type.bold },
  native: { color: colors.text, fontSize: 22, ...type.semibold, marginTop: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  flag: { fontSize: 13 },
  name: { color: colors.muted, fontSize: 12, ...type.medium },
  swapWrap: { marginHorizontal: -16, zIndex: 2, borderRadius: 26 },
  swap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
