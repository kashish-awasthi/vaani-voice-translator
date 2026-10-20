// Bottom sheet with a searchable list of languages
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LANGUAGES } from '../languages';
import { radius, spacing, type, useStyles, useTheme } from '../theme';
import { LangBadge } from './LangBadge';

export function LanguageSheet({ visible, title, selected, onSelect, onClose }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = LANGUAGES.filter((l) => !q || l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q) || l.code === q);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>
        <View style={styles.search}>
          <Ionicons name="search" size={16} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search languages"
            placeholderTextColor={colors.textTertiary}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <FlatList
          data={list}
          keyExtractor={(l) => l.code}
          style={{ maxHeight: 440 }}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const active = item.code === selected;
            return (
              <Pressable
                onPress={() => {
                  setQuery('');
                  onSelect(item.code);
                }}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <LangBadge code={item.code} color={colors.textSecondary} background={colors.surfaceAlt} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.native !== item.name && <Text style={styles.native}>{item.native}</Text>}
                </View>
                {active && <Ionicons name="checkmark" size={20} color={colors.accent} />}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: c.overlay },
    sheet: { backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingTop: spacing.sm },
    handle: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: c.border, marginBottom: spacing.sm },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    title: { ...type.title, color: c.text },
    done: { ...type.callout, fontWeight: '600', color: c.accent },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.sm,
    },
    searchInput: { flex: 1, ...type.body, color: c.text, paddingVertical: 10 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: spacing.lg + 34 + spacing.md },
    name: { ...type.body, color: c.text },
    native: { ...type.footnote, color: c.textSecondary },
  });
