import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ControlDock } from './src/components/ControlDock';
import { EmptyState } from './src/components/EmptyState';
import { LanguageBar } from './src/components/LanguageBar';
import { MessageCard } from './src/components/MessageCard';
import { SegmentedControl } from './src/components/SegmentedControl';
import { SettingsSheet } from './src/components/SettingsSheet';
import { DEFAULT_SERVER_URL } from './src/config';
import { getLanguage, voiceFor } from './src/languages';
import { radius, spacing, ThemeProvider, type, useStyles, useTheme } from './src/theme';
import { useMicrophone } from './src/useMicrophone';
import { useServerStatus } from './src/useServerStatus';
import { useTranslator } from './src/useTranslator';

const MODES = [
  { value: 'two-way', label: 'Conversation' },
  { value: 'one-way', label: 'Captions' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TranslatorScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function TranslatorScreen() {
  const styles = useStyles(makeStyles);
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState('two-way'); // 'two-way' conversation, or 'one-way' captions
  const [langA, setLangA] = useState('en');
  const [langB, setLangB] = useState('hi');
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [speaking, setSpeaking] = useState(false); // the phone is reading a translation aloud

  const translator = useTranslator();
  const live = translator.status === 'live';
  const server = useServerStatus(serverUrl, live);

  const level = useRef(new Animated.Value(0)).current; // microphone loudness 0..1, drives the mic ring
  const levelRef = useRef(0); // same value, read by the waveform
  const speakingCount = useRef(0);
  const autoSpeakRef = useRef(autoSpeak);
  autoSpeakRef.current = autoSpeak;

  const mic = useMicrophone((chunk) => {
    const loud = loudness(chunk);
    levelRef.current = loud;
    level.setValue(loud);
    // don't send audio while the phone is speaking, or it would translate its own voice
    if (speakingCount.current === 0) translator.sendAudio(chunk);
  });

  function speak(text, language) {
    speakingCount.current += 1;
    setSpeaking(true);
    const done = () => {
      speakingCount.current = Math.max(0, speakingCount.current - 1);
      if (speakingCount.current === 0) setSpeaking(false);
    };
    Speech.speak(text, { language: voiceFor(language), onDone: done, onStopped: done, onError: done });
  }

  function stopMic() {
    mic.stop();
    levelRef.current = 0;
    level.setValue(0);
  }

  async function toggleListening() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setLocalError(null);
    translator.clearError();
    if (live) {
      stopMic();
      translator.finish();
      return;
    }
    if (langA === langB) {
      setLocalError('Choose two different languages.');
      return;
    }
    // two-way: Whisper picks between A and B and the server translates to the other one
    // one-way: always A -> B
    const languages = mode === 'two-way' ? [langA, langB] : [langA];
    const target = mode === 'two-way' ? null : langB;
    try {
      await translator.connect(serverUrl, languages, target, {
        onFinal: (msg) => autoSpeakRef.current && msg.translation && speak(msg.translation, msg.target),
        onLost: stopMic, // server stopped or Wi-Fi dropped: stop recording too
      });
      await mic.start();
    } catch (e) {
      translator.disconnect();
      stopMic();
      if (e.message !== 'connection failed') setLocalError(e.message);
    }
  }

  useEffect(() => () => mic.stop(), []); // stop the microphone if the app closes while listening

  const scrollRef = useRef(null);
  const error = localError || translator.error;
  const { messages, partial } = translator;

  // which pipeline step is happening now: 0 Listen, 1 Whisper, 2 Translate, 3 Speak (-1 = idle)
  const stage = speaking ? 3 : translator.status === 'finishing' ? 2 : partial.text ? 1 : live ? 0 : -1;
  const avgSeconds = messages.length
    ? (messages.reduce((sum, m) => sum + m.timing_ms.speech + m.timing_ms.translate, 0) / messages.length / 1000).toFixed(1)
    : null;
  const speakerOf = (lang) => (mode === 'one-way' ? null : lang === langB ? 'B' : 'A');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} accessibilityRole="header">
            Vaani
          </Text>
          <ServerStatus status={live ? 'live' : server} />
        </View>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.controls}>
        <SegmentedControl options={MODES} value={mode} onChange={setMode} disabled={live} />
        <LanguageBar mode={mode} langA={langA} langB={langB} onChangeA={setLangA} onChangeB={setLangB} disabled={live} />
      </View>

      {/* Conversation */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.conversation}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.length > 0 && (
          <Text style={styles.stats}>
            {messages.length} {messages.length === 1 ? 'sentence' : 'sentences'} · average {avgSeconds} s ·{' '}
            {getLanguage(langA).name} {mode === 'two-way' ? '⇄' : '→'} {getLanguage(langB).name}
          </Text>
        )}
        {messages.length === 0 && !live ? (
          <EmptyState mode={mode} />
        ) : (
          messages.map((msg) => (
            <MessageCard
              key={msg.key}
              msg={msg}
              speaker={speakerOf(msg.lang)}
              alignEnd={speakerOf(msg.lang) === 'B'}
              onPlay={() => speak(msg.translation, msg.target)}
            />
          ))
        )}
      </ScrollView>

      {error ? (
        <View style={styles.error} accessibilityRole="alert">
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => {
              setLocalError(null);
              translator.clearError();
            }}
            hitSlop={10}
            accessibilityLabel="Dismiss"
          >
            <Ionicons name="close" size={18} color={colors.danger} />
          </Pressable>
        </View>
      ) : null}

      <ControlDock
        status={translator.status}
        stage={stage}
        partial={partial}
        level={level}
        levelRef={levelRef}
        onPressMic={toggleListening}
        bottomInset={insets.bottom}
        hint={hintText(translator.status, mode, server)}
      />

      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        serverUrl={serverUrl}
        onServerUrl={setServerUrl}
        autoSpeak={autoSpeak}
        onAutoSpeak={setAutoSpeak}
        onClear={translator.clear}
        messageCount={messages.length}
      />
    </View>
  );
}

function ServerStatus({ status }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const map = {
    checking: { color: colors.textTertiary, text: 'Checking server…' },
    online: { color: colors.success, text: 'Server online' },
    offline: { color: colors.danger, text: 'Server offline' },
    live: { color: colors.live, text: 'Live' },
  };
  const s = map[status];
  return (
    <View style={styles.status} accessibilityLabel={s.text}>
      <View style={[styles.statusDot, { backgroundColor: s.color }]} />
      <Text style={styles.statusText}>{s.text}</Text>
    </View>
  );
}

function hintText(status, mode, server) {
  if (status === 'connecting') return 'Connecting…';
  if (status === 'finishing') return 'Translating the last sentence…';
  if (status === 'live') return mode === 'two-way' ? 'Listening to both speakers · tap to stop' : 'Listening · tap to stop';
  if (server === 'offline') return 'Server offline · check the address in Settings';
  return 'Tap to start';
}

// how loud a chunk of 16-bit audio is, scaled to 0..1 for the animations
function loudness(chunk) {
  const samples = new Int16Array(chunk);
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i += 4) sum += samples[i] * samples[i];
  const rms = Math.sqrt(sum / Math.ceil(samples.length / 4)) / 32768;
  return Math.min(1, rms * 8);
}

const makeStyles = (c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
    title: { ...type.largeTitle, color: c.text },
    status: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { ...type.footnote, color: c.textSecondary },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controls: { paddingHorizontal: spacing.lg, gap: spacing.md },
    conversation: { padding: spacing.lg, gap: spacing.md },
    stats: { ...type.caption, color: c.textTertiary, textAlign: 'center' },
    error: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: c.dangerSoft,
    },
    errorText: { flex: 1, ...type.footnote, color: c.danger },
  });
