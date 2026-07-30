// screens/abogado/DashboardScreen.js

import React from 'react';
import { Ionicons } from "@expo/vector-icons";
import DashboardBase from '../../components/DashboardBase';
import colors from '../../theme/colors';

export default function DashboardScreenAbogado({ user, navigation, onLogout }) {
  const quickActions = [
    {
      label: 'Mis expedientes',
      icon: <Ionicons name="folder-outline" size={28} color={colors.info} />,
      bg: colors.infoBg,
      fg: colors.info,
      onPress: () => navigation.navigate('ExpedientesList'),
    },
    {
      label: 'Solicitar firma',
      icon: <Ionicons name="document-text-outline" size={28} color={colors.warning} />,
      bg: colors.warningBg,
      fg: colors.warning,
      onPress: () => navigation.navigate('SolicitudesFirma'),
    },
    {
      label: 'Firmar documentos',
      icon: <Ionicons name="create-outline" size={28} color={colors.purple} />,
      bg: colors.purpleBg,
      fg: colors.purple,
      onPress: () => navigation.navigate('SolicitudesFirma'),
    },
  ];

  return (
    <DashboardBase
      user={user}
      navigation={navigation}
      onLogout={onLogout}
      quickActions={quickActions}
    />
  );
}