// Settings: server address, speak translations on/off, clear the conversation
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, type } from '../theme';

export function SettingsSheet({ visible, onClose, serverUrl, onServerUrl, autoSpeak, onAutoSpeak, onClear }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Settings</Text>

        <View style={styles.item}>
          <View style={styles.itemIcon}><Ionicons name="volume-high" size={18} color={colors.mocha} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Speak translations</Text>
            <Text style={styles.itemSub}>Read every translation aloud</Text>
          </View>
          <Switch value={autoSpeak} onValueChange={onAutoSpeak} trackColor={{ true: colors.mocha, false: colors.dim }} thumbColor={colors.surface} activeThumbColor={colors.surface} />
        </View>

        <View style={[styles.item, { flexDirection: 'column', alignItems: 'stretch', gap: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.itemIcon}><Ionicons name="server" size={17} color={colors.mocha} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Server address</Text>
              <Text style={styles.itemSub}>Your Mac's IP, port 8500</Text>
            </View>
          </View>
          <TextInput
            value={serverUrl}
            onChangeText={onServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={() => {
            onClear();
            onClose();
          }}
          style={({ pressed }) => [styles.clear, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="trash-outline" size={17} color={colors.danger} />
          <Text style={styles.clearText}>Clear conversation</Text>
        </Pressable>

        <Text style={styles.credits}>Whisper · FastAPI · WebSockets · React Native</Text>
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
    gap: 12,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 4 },
  title: { color: colors.text, fontFamily: fonts.serifBold, fontSize: 26, marginBottom: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { color: colors.text, ...type.semibold, fontSize: 15 },
  itemSub: { color: colors.muted, ...type.regular, fontSize: 12 },
  input: {
    color: colors.text,
    ...type.medium,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  clear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(229,72,77,0.2)',
    borderWidth: 1,
  },
  clearText: { color: colors.danger, ...type.semibold, fontSize: 15 },
  credits: { color: colors.dim, ...type.medium, fontSize: 11, textAlign: 'center', marginTop: 4 },
});
