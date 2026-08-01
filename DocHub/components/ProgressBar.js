// components/ProgressBar.js
// Barra de progreso simple para mostrar avance de expedientes/cargas.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function ProgressBar({ progress = 0, color = colors.primary, height = 8 }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
