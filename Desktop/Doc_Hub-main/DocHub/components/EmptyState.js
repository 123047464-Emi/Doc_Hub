// components/EmptyState.js
// Estado vacío reutilizable para listas sin resultados.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';

export default function EmptyState({ icon = '◌', title = 'Sin resultados', message = '' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 36,
    color: colors.textMuted,
    marginBottom: 12,
  },
  title: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  message: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
