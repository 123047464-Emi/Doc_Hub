// screens/testigo/DashboardScreen.js
// Pantalla 3: Dashboard - Testigo.
// Único acceso: consultar y firmar las solicitudes de firma que le sean asignadas.

import React from 'react';
import DashboardBase from '../../components/DashboardBase';
import colors from '../../theme/colors';

export default function DashboardScreenTestigo({ user, navigation, onLogout }) {
  const quickActions = [
    {
      label: 'Solicitudes de firma asignadas',
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
