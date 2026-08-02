// components/IconCircle.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IconCircle({ symbol, bg, fg, size = 40, isIcon = false }) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      {isIcon ? (
        <Ionicons
          name={symbol}
          size={size * 0.55}
          color={fg}
        />
      ) : (
        <Text style={[styles.symbol, { color: fg, fontSize: size * 0.42 }]}>
          {symbol}
        </Text>
      )}
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