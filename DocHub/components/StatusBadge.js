// components/StatusBadge.js
// Insignia de estado reutilizable para expedientes, documentos y firmas.

import React from 'react';
import { View, Text } from 'react-native';
import colors from '../theme/colors';
import globalStyles from '../theme/globalStyles';

const STATUS_MAP = {
  'Activo':            { bg: colors.successBg, fg: colors.success },
  'Pendiente':         { bg: colors.warningBg, fg: colors.warning },
  'Cerrado':           { bg: colors.border,    fg: colors.textSecondary },
  'Autorizado':        { bg: colors.successBg, fg: colors.success },
  'Pendiente firma':   { bg: colors.warningBg, fg: colors.warning },
  'Subido':            { bg: colors.infoBg,    fg: colors.info },
  'Procesando OCR':    { bg: colors.purpleBg,  fg: colors.purple },
  'Firmado':           { bg: colors.successBg, fg: colors.success },
  'Rechazado':         { bg: colors.dangerBg,  fg: colors.danger },
};

export default function StatusBadge({ status, style }) {
  const colorSet = STATUS_MAP[status] || { bg: colors.border, fg: colors.textSecondary };
  return (
    <View style={[globalStyles.badge, { backgroundColor: colorSet.bg }, style]}>
      <Text style={[globalStyles.badgeText, { color: colorSet.fg }]}>{status}</Text>
    </View>
  );
}
