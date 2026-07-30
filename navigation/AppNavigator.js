// navigation/AppNavigator.js
// Navegación manual implementada con useState (sin librerías externas de navegación).
// Combina: tabs inferiores (root screens) + stack de pantallas de detalle.

import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { ROLE_DASHBOARD, ROLE_PERMISSIONS } from './roleConfig';

// Dashboards por rol
import DashboardJuez from '../screens/juez/DashboardScreen';
import DashboardNotario from '../screens/notario/DashboardScreen';
import DashboardAbogado from '../screens/abogado/DashboardScreen';
import DashboardParte from '../screens/parte/DashboardScreen';
import DashboardTestigo from '../screens/testigo/DashboardScreen';

// Pantallas comunes (compartidas entre roles, controladas por permisos)
import ExpedientesListScreen from '../screens/ExpedientesListScreen';
import ExpedienteDetalleScreen from '../screens/ExpedienteDetalleScreen';
import DocumentosScreen from '../screens/DocumentosScreen';
import CargaDocumentoScreen from '../screens/CargaDocumentoScreen';
import VisorDocumentoScreen from '../screens/VisorDocumentoScreen';
import SolicitudesFirmaScreen from '../screens/SolicitudesFirmaScreen';
import FirmaDigitalScreen from '../screens/FirmaDigitalScreen';
import TrazabilidadScreen from '../screens/TrazabilidadScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';
import PerfilScreen from '../screens/PerfilScreen';

const DASHBOARD_COMPONENTS = {
  DashboardJuez,
  DashboardNotario,
  DashboardAbogado,
  DashboardParte,
  DashboardTestigo,
};

// Registro de pantallas de stack (navegables con navigate())
const STACK_SCREENS = {
  ExpedientesList: ExpedientesListScreen,
  ExpedienteDetalle: ExpedienteDetalleScreen,
  Documentos: DocumentosScreen,
  CargaDocumento: CargaDocumentoScreen,
  VisorDocumento: VisorDocumentoScreen,
  SolicitudesFirma: SolicitudesFirmaScreen,
  FirmaDigital: FirmaDigitalScreen,
  Trazabilidad: TrazabilidadScreen,
  Notificaciones: NotificacionesScreen,
  Perfil: PerfilScreen,
};

export default function AppNavigator({ user, onLogout }) {
  const permisos = ROLE_PERMISSIONS[user.role];
  const tabsVisibles = permisos.tabs; // ej. Testigo no incluye 'documentos'
  const [activeTab, setActiveTab] = useState('inicio');
  const [stack, setStack] = useState([]); // [{ screen, params }]

  const navigation = useMemo(
    () => ({
      navigate: (screen, params = {}) => setStack((prev) => [...prev, { screen, params }]),
      goBack: () => setStack((prev) => prev.slice(0, -1)),
      popToTab: () => setStack([]),
    }),
    []
  );

  const handleChangeTab = (tabKey) => {
    setActiveTab(tabKey);
    setStack([]); // al cambiar de tab, regresamos a la raíz de ese tab
  };

  // --- Si hay pantallas apiladas, mostramos la última (detalle) ---
  if (stack.length > 0) {
    const top = stack[stack.length - 1];
    const ScreenComponent = STACK_SCREENS[top.screen];
    return (
      <View style={styles.flex}>
        <View style={styles.flex}>
          <ScreenComponent
            navigation={navigation}
            route={{ params: top.params }}
            user={user}
            onLogout={onLogout}
          />
        </View>
      </View>
    );
  }

  // --- Raíz según el tab activo ---
  const renderTabRoot = () => {
    switch (activeTab) {
      case 'inicio': {
        const DashboardComponent = DASHBOARD_COMPONENTS[ROLE_DASHBOARD[user.role]];
        return <DashboardComponent navigation={navigation} user={user} onLogout={onLogout} />;
      }
      case 'documentos':
        return <ExpedientesListScreen navigation={navigation} user={user} />;
      case 'firma':
        return <SolicitudesFirmaScreen navigation={navigation} user={user} />;
      case 'avisos':
        return <NotificacionesScreen navigation={navigation} user={user} />;
      default:
        return null;
    }
  };

  const badges = {};
  if (tabsVisibles.includes('avisos')) badges.avisos = 2;
  if (tabsVisibles.includes('firma')) badges.firma = 2;

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>{renderTabRoot()}</View>
      <BottomTabBar
        activeTab={activeTab}
        onChangeTab={handleChangeTab}
        badges={badges}
        visibleTabs={tabsVisibles}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
