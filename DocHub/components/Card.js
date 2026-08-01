// components/Card.js
// Tarjeta contenedora reutilizable, opcionalmente presionable.

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import globalStyles from '../theme/globalStyles';

export default function Card({ children, onPress, style }) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          globalStyles.card,
          style,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[globalStyles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
});
