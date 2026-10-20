// iOS-style segmented control: "Conversation | Captions"
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { cardShadow, radius, type, useStyles } from '../theme';

export function SegmentedControl({ options, value, onChange, disabled }) {
  const styles = useStyles(makeStyles);
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const slide = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.spring(slide, { toValue: index, useNativeDriver: false, friction: 9, tension: 90 }).start();
  }, [index]);

  const segment = (width - 4) / options.length;
  return (
    <View
      style={[styles.track, disabled && styles.disabled]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="tablist"
    >
      {width > 0 && <Animated.View style={[styles.thumb, { width: segment, transform: [{ translateX: Animated.multiply(slide, segment) }] }]} />}
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            disabled={disabled}
            style={styles.segment}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    track: { flexDirection: 'row', backgroundColor: c.surfaceAlt, borderRadius: radius.md, padding: 2 },
    disabled: { opacity: 0.55 },
    thumb: { position: 'absolute', top: 2, bottom: 2, left: 2, borderRadius: radius.md - 2, backgroundColor: c.surface, ...cardShadow(c), shadowOpacity: 0.1 },
    segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
    label: { ...type.subhead, fontWeight: '500', color: c.textSecondary },
    labelSelected: { color: c.text, fontWeight: '600' },
  });
