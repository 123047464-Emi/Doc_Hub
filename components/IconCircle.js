// components/IconCircle.js
// Círculo con símbolo/letra dentro, usado como "icono" simulado (sin librería de iconos).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IconCircle({ symbol, bg, fg, size = 40 }) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.symbol, { color: fg, fontSize: size * 0.42 }]}>{symbol}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontWeight: '700',
  },
});
