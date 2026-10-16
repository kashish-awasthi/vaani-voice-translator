// The microphone: a mocha orb inside a champagne-gold ring.
// While listening, the ring spins and a soft halo grows with your voice.
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { colors, shadow } from '../theme';

const SIZE = 78;
const RING = SIZE + 14;

export function MicButton({ status, level, onPress }) {
  const live = status === 'live';
  const busy = status === 'connecting';
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!live) {
      spin.stopAnimation();
      return;
    }
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: false }));
    spin.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [live]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const halo = {
    opacity: live ? level.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }) : 0.3,
    transform: [{ scale: live ? level.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.5] }) : 1.0 }],
  };

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.halo, halo]}>
        <LinearGradient colors={colors.sheen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill} />
      </Animated.View>
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]}>
        <LinearGradient colors={colors.sheen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill} />
      </Animated.View>
      <Pressable onPress={onPress} disabled={busy} style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.94 }] }]}>
        {busy ? <ActivityIndicator color={colors.onInk} /> : live ? <View style={styles.stop} /> : <Ionicons name="mic" size={32} color={colors.onInk} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: RING * 1.8, height: RING * 1.5, alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1 },
  halo: { position: 'absolute', width: RING, height: RING, borderRadius: RING / 2, overflow: 'hidden' },
  ring: { position: 'absolute', width: RING, height: RING, borderRadius: RING / 2, overflow: 'hidden' },
  button: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', ...shadow, shadowOpacity: 0.3 },
  stop: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#F1DDBD' },
});
