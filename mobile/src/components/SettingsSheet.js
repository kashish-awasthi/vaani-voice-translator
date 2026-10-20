// Settings: speak translations, server address (with a connection test) and clear conversation
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing, type, useStyles, useTheme } from '../theme';
import { checkServer } from '../useServerStatus';

export function SettingsSheet({ visible, onClose, serverUrl, onServerUrl, autoSpeak, onAutoSpeak, onClear, messageCount }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [test, setTest] = useState(null); // null | 'testing' | 'ok' | 'fail'

  async function testConnection() {
    setTest('testing');
    setTest((await checkServer(serverUrl)) ? 'ok' : 'fail');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close settings" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <Text style={styles.groupLabel}>Playback</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Speak translations</Text>
              <Text style={styles.rowSub}>Read each translation aloud</Text>
            </View>
            <Switch
              value={autoSpeak}
              onValueChange={onAutoSpeak}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor="#FFFFFF"
              activeThumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.groupLabel}>Server</Text>
        <View style={styles.group}>
          <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch', gap: spacing.sm }]}>
            <Text style={styles.rowTitle}>Address</Text>
            <TextInput
              value={serverUrl}
              onChangeText={(t) => {
                onServerUrl(t);
                setTest(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={styles.input}
              accessibilityLabel="Server address"
            />
            <Text style={styles.rowSub}>Your computer's Wi-Fi IP, e.g. ws://192.168.1.5:8500/ws</Text>
          </View>
          <View style={styles.divider} />
          <Pressable onPress={testConnection} style={({ pressed }) => [styles.row, pressed && styles.pressed]} accessibilityRole="button">
            <Text style={[styles.rowTitle, { color: colors.accent, flex: 1 }]}>Test connection</Text>
            {test === 'testing' && <ActivityIndicator color={colors.accent} />}
            {test === 'ok' && <Result icon="checkmark-circle" color={colors.success} text="Connected" />}
            {test === 'fail' && <Result icon="close-circle" color={colors.danger} text="Not reachable" />}
          </Pressable>
        </View>

        <View style={[styles.group, { marginTop: spacing.xl }]}>
          <Pressable
            onPress={() => {
              onClear();
              onClose();
            }}
            disabled={messageCount === 0}
            style={({ pressed }) => [styles.row, pressed && styles.pressed, messageCount === 0 && { opacity: 0.4 }]}
            accessibilityRole="button"
          >
            <Text style={[styles.rowTitle, { color: colors.danger }]}>Clear conversation</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Vaani 1.0 · Whisper · FastAPI · WebSockets · React Native</Text>
      </View>
    </Modal>
  );
}

function Result({ icon, color, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ ...type.subhead, color }}>{text}</Text>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: c.overlay },
    sheet: { backgroundColor: c.background, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingTop: spacing.sm, paddingHorizontal: spacing.lg },
    handle: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: c.border, marginBottom: spacing.sm },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    title: { ...type.title, color: c.text },
    done: { ...type.callout, fontWeight: '600', color: c.accent },
    groupLabel: { ...type.label, color: c.textTertiary, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: spacing.xs },
    group: { backgroundColor: c.surface, borderRadius: radius.md, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: c.border },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 50 },
    rowTitle: { ...type.body, color: c.text },
    rowSub: { ...type.footnote, color: c.textSecondary, marginTop: 2 },
    input: { ...type.callout, color: c.text, backgroundColor: c.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 10 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: spacing.lg },
    pressed: { backgroundColor: c.surfaceAlt },
    footer: { ...type.caption, color: c.textTertiary, textAlign: 'center', marginTop: spacing.xl },
  });
