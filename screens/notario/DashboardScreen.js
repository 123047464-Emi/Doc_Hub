// screens/notario/DashboardScreen.js
// Pantalla 3: Dashboard - Notario.
// Consulta expedientes, revisa/valida documentación y firma documentos que requieren certificación.

import React from 'react';
import DashboardBase from '../../components/DashboardBase';
import colors from '../../theme/colors';

export default function DashboardScreenNotario({ user, navigation, onLogout }) {
  const quickActions = [
    {
      label: 'Expedientes',
      symbol: '📁',
      bg: colors.infoBg,
      fg: colors.info,
      onPress: () => navigation.navigate('ExpedientesList'),
    },
    {
      label: 'Validar documentos',
      symbol: '✓',
      bg: colors.successBg,
      fg: colors.success,
      onPress: () => navigation.navigate('ExpedientesList'),
    },
    {
      label: 'Firmas de certificación',
      symbol: '✎',
      bg: colors.purpleBg,
      fg: colors.purple,
      onPress: () => navigation.navigate('SolicitudesFirma'),
    },
  ];

  return (
    <DashboardBase user={user} navigation={navigation} onLogout={onLogout} quickActions={quickActions} />
  );
}
