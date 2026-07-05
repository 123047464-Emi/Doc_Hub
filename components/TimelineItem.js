// components/TimelineItem.js
// Elemento visual de línea de tiempo, usado en la pantalla de Trazabilidad.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';

const TIPO_COLOR = {
  subida: colors.info,
  firma: colors.success,
  aprobacion: colors.purple,
  creacion: colors.primary,
  rechazo: colors.danger,
};

export default function TimelineItem({ item, isLast }) {
  const dotColor = TIPO_COLOR[item.tipo] || colors.primary;
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.actor}>{item.actor}</Text>
        <Text style={styles.accion}>{item.accion}</Text>
        <Text style={styles.fecha}>{item.fecha}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  rail: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.divider,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  actor: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  accion: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fecha: {
    fontSize: fonts.size.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
});
