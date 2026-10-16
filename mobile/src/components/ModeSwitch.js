// "Conversation | Captions" toggle with a sliding mocha pill
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, type } from '../theme';

const OPTIONS = [
  { value: 'two-way', label: 'Conversation', icon: 'people-outline' },
  { value: 'one-way', label: 'Captions', icon: 'text-outline' },
];

export function ModeSwitch({ value, onChange, disabled }) {
  const [width, setWidth] = useState(0);
  const slide = useRef(new Animated.Value(value === 'two-way' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slide, { toValue: value === 'two-way' ? 0 : 1, useNativeDriver: false, friction: 8 }).start();
  }, [value]);

  const half = (width - 8) / 2;
  return (
    <View style={[styles.container, disabled && { opacity: 0.6 }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Animated.View style={[styles.highlight, { width: half, transform: [{ translateX: Animated.multiply(slide, half) }] }]} />
      )}
      {OPTIONS.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} style={styles.option} disabled={disabled} onPress={() => onChange(o.value)}>
            <Ionicons name={o.icon} size={15} color={active ? colors.onInk : colors.muted} />
            <Text style={[styles.label, active && styles.labelActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 4 },
  highlight: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 14, backgroundColor: colors.ink },
  option: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  label: { color: colors.muted, fontSize: 14, ...type.semibold },
  labelActive: { color: colors.onInk },
});
