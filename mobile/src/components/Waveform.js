// Live voice waveform: bars that rise and fall with how loud you are speaking
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

const BARS = 18;

export function Waveform({ levelRef }) {
  const { colors } = useTheme();
  const [history, setHistory] = useState(() => Array(BARS).fill(0));
  const tick = useRef(0);

  useEffect(() => {
    // ~14 times a second, push the latest loudness onto the right and drop the oldest
    const id = setInterval(() => {
      tick.current += 1;
      const jitter = 0.8 + 0.2 * Math.sin(tick.current * 1.7); // keeps it lively
      setHistory((h) => [...h.slice(1), levelRef.current * jitter]);
    }, 70);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {history.map((v, i) => (
        <View key={i} style={[styles.bar, { height: 3 + v * 26, backgroundColor: colors.accent, opacity: 0.3 + (i / BARS) * 0.7 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, height: 30, overflow: 'hidden' },
  bar: { width: 3, borderRadius: 2 },
});
