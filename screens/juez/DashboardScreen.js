// screens/juez/DashboardScreen.js
// Pantalla 3: Dashboard - Juez.
// Consulta expedientes/documentos, aprueba o rechaza documentación y firma cuando se requiere.

import React from 'react';
import DashboardBase from '../../components/DashboardBase';
import colors from '../../theme/colors';

export default function DashboardScreenJuez({ user, navigation, onLogout }) {
  const quickActions = [
    {
      label: 'Expedientes de casos activos',
      symbol: '📁',
      bg: colors.infoBg,
      fg: colors.info,
      onPress: () => navigation.navigate('ExpedientesList'),
    },
    {
      label: 'Solicitudes de firma',
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
