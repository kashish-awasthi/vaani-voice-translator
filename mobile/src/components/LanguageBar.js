// Language picker: [Person A language]  ⇄  [Person B language], like Google/Apple Translate
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getLanguage } from '../languages';
import { cardShadow, radius, spacing, type, useStyles, useTheme } from '../theme';
import { LangBadge } from './LangBadge';
import { LanguageSheet } from './LanguageSheet';

export function LanguageBar({ mode, langA, langB, onChangeA, onChangeB, disabled }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [picking, setPicking] = useState(null); // 'A' | 'B' | null
  const twoWay = mode === 'two-way';
  const labels = twoWay ? ['Person A', 'Person B'] : ['From', 'To'];

  return (
    <View style={[styles.card, disabled && styles.disabled]}>
      <Side
        label={labels[0]}
        code={langA}
        color={colors.speakerA}
        soft={colors.speakerASoft}
        onPress={() => setPicking('A')}
        disabled={disabled}
      />
      <Pressable
        onPress={() => {
          onChangeA(langB);
          onChangeB(langA);
        }}
        disabled={disabled}
        hitSlop={8}
        style={({ pressed }) => [styles.swap, pressed && styles.pressed]}
        accessibilityLabel="Swap languages"
        accessibilityRole="button"
      >
        <Ionicons name={twoWay ? 'swap-horizontal' : 'arrow-forward'} size={18} color={colors.accent} />
      </Pressable>
      <Side
        label={labels[1]}
        code={langB}
        color={colors.speakerB}
        soft={colors.speakerBSoft}
        onPress={() => setPicking('B')}
        disabled={disabled}
        alignEnd
      />

      <LanguageSheet
        visible={picking !== null}
        title={picking === 'A' ? labels[0] : labels[1]}
        selected={picking === 'A' ? langA : langB}
        onClose={() => setPicking(null)}
        onSelect={(code) => {
          (picking === 'A' ? onChangeA : onChangeB)(code);
          setPicking(null);
        }}
      />
    </View>
  );
}

function Side({ label, code, color, soft, onPress, disabled, alignEnd }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const lang = getLanguage(code);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.side, alignEnd && styles.sideEnd, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${lang.name}. Change language`}
    >
      <Text style={styles.sideLabel}>{label}</Text>
      <View style={[styles.sideRow, alignEnd && styles.sideRowEnd]}>
        <LangBadge code={lang.code} color={color} background={soft} />
        <View style={alignEnd && { alignItems: 'flex-end' }}>
          <Text style={styles.name} numberOfLines={1}>{lang.name}</Text>
          {lang.native !== lang.name && <Text style={styles.native} numberOfLines={1}>{lang.native}</Text>}
        </View>
        {!disabled && <Ionicons name="chevron-down" size={14} color={colors.textTertiary} />}
      </View>
    </Pressable>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: spacing.md,
      ...cardShadow(c),
    },
    disabled: { opacity: 0.7 },
    side: { flex: 1, gap: 6, paddingVertical: 2 },
    sideEnd: { alignItems: 'flex-end' },
    sideLabel: { ...type.label, color: c.textTertiary },
    sideRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    sideRowEnd: { flexDirection: 'row-reverse' },
    name: { ...type.headline, color: c.text },
    native: { ...type.caption, color: c.textSecondary },
    swap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginHorizontal: spacing.sm,
      backgroundColor: c.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { opacity: 0.6 },
  });
