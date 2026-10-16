// Warm cream background with big soft blobs of latte, sand and rose
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

export function Background() {
  const { latte, sand, rose, taupe } = colors.blobs;
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: colors.background }]} pointerEvents="none">
      <Blob color={latte} size={380} style={{ top: -150, left: -120 }} />
      <Blob color={sand} size={300} style={{ top: -60, right: -150 }} />
      <Blob color={rose} size={340} style={{ top: 330, right: -170 }} />
      <Blob color={taupe} size={320} style={{ bottom: -120, left: -130 }} />
    </View>
  );
}

// A soft blob: many faint circles stacked, so the centre is stronger and the edge fades out
const LAYERS = Array.from({ length: 12 }, (_, i) => 1 - i * 0.075);

function Blob({ color, size, style }) {
  return (
    <View style={[{ position: 'absolute', width: size, height: size }, style]}>
      {LAYERS.map((scale) => (
        <View
          key={scale}
          style={{
            position: 'absolute',
            width: size * scale,
            height: size * scale,
            borderRadius: size,
            left: (size - size * scale) / 2,
            top: (size - size * scale) / 2,
            backgroundColor: color,
            opacity: 0.13,
          }}
        />
      ))}
    </View>
  );
}
