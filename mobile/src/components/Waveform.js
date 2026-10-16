// Live voice waveform: bars that rise and fall with how loud you are speaking
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

const BARS = 32;
const PALETTE = [colors.mocha, '#A9805F', colors.gold, '#D9B27A', '#B9917A'];

export function Waveform({ levelRef, active }) {
  const [history, setHistory] = useState(() => Array(BARS).fill(0));
  const tick = useRef(0);

  useEffect(() => {
    if (!active) {
      setHistory(Array(BARS).fill(0));
      return;
    }
    // ~14 times a second, push the latest loudness onto the right and drop the oldest
    const id = setInterval(() => {
      tick.current += 1;
      const jitter = 0.75 + 0.25 * Math.sin(tick.current * 1.7); // keeps it lively
      setHistory((h) => [...h.slice(1), levelRef.current * jitter]);
    }, 70);
    return () => clearInterval(id);
  }, [active]);

  return (
    <View style={styles.row}>
      {history.map((v, i) => (
        <View key={i} style={[styles.bar, { height: 4 + v * 30, backgroundColor: PALETTE[Math.floor((i / BARS) * PALETTE.length)], opacity: 0.35 + (i / BARS) * 0.65 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, height: 36 },
  bar: { width: 4, borderRadius: 2 },
});
