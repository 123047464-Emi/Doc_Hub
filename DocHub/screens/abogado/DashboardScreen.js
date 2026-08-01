// screens/abogado/DashboardScreen.js
// Pantalla 3: Dashboard - Abogado.
// Consulta expedientes en los que participa, solicita firmas y firma documentos.

import React from 'react';
import DashboardBase from '../../components/DashboardBase';
import colors from '../../theme/colors';

export default function DashboardScreenAbogado({ user, navigation, onLogout }) {
  const quickActions = [
    {
      label: 'Mis expedientes',
      symbol: '📁',
      bg: colors.infoBg,
      fg: colors.info,
      onPress: () => navigation.navigate('ExpedientesList'),
    },
    {
      label: 'Solicitar firma',
      symbol: '+',
      bg: colors.warningBg,
      fg: colors.warning,
      onPress: () => navigation.navigate('SolicitudesFirma'),
    },
    {
      label: 'Firmar documentos',
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
