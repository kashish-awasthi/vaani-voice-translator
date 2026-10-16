// Bottom sheet with a searchable list of languages
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LANGUAGES } from '../languages';
import { colors, fonts, type } from '../theme';

export function LanguageSheet({ visible, selected, title, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const q = query.trim().toLowerCase();
  const list = LANGUAGES.filter((l) => !q || l.name.toLowerCase().includes(q) || l.native.toLowerCase().includes(q));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.search}>
          <Ionicons name="search" size={16} color={colors.dim} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search languages"
            placeholderTextColor={colors.dim}
            style={styles.searchInput}
            autoCorrect={false}
          />
        </View>
        <FlatList
          data={list}
          keyExtractor={(l) => l.code}
          style={{ maxHeight: 420 }}
          renderItem={({ item }) => {
            const active = item.code === selected;
            return (
              <Pressable
                onPress={() => {
                  setQuery('');
                  onSelect(item.code);
                }}
                style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.native}>{item.native}</Text>
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={22} color={colors.mocha} />}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 14 },
  title: { color: colors.text, fontFamily: fonts.serifBold, fontSize: 24, marginBottom: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: colors.text, ...type.medium, paddingVertical: 11, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 11, paddingHorizontal: 10, borderRadius: 14 },
  rowActive: { backgroundColor: colors.surfaceAlt },
  flag: { fontSize: 24 },
  native: { color: colors.text, ...type.semibold, fontSize: 16 },
  name: { color: colors.muted, ...type.regular, fontSize: 12 },
});
