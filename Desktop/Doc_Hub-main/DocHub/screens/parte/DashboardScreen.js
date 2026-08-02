// screens/parte/DashboardScreen.js
// Pantalla 3: Dashboard - Parte.
// Carga documentos personales, consulta su expediente y firma cuando se le solicita.

import React from 'react';
import DashboardBase from '../../components/DashboardBase';
import colors from '../../theme/colors';

export default function DashboardScreenParte({ user, navigation, onLogout }) {
  const quickActions = [
    {
      label: 'Mi expediente',
      symbol: 'folder-open-outline',
      bg: colors.infoBg,
      fg: colors.info,
      onPress: () => navigation.navigate('ExpedientesList'),
    },
    {
      label: 'Firmar documentos',
      symbol: 'create-outline',
      bg: colors.purpleBg,
      fg: colors.purple,
      onPress: () => navigation.navigate('SolicitudesFirma'),
    },
  ];

  return (
    <DashboardBase user={user} navigation={navigation} onLogout={onLogout} quickActions={quickActions} />
  );
}

