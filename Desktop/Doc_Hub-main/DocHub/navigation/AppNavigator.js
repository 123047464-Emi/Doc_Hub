// navigation/AppNavigator.js
// NavegaciÃ³n manual implementada con useState (sin librerÃ­as externas de navegaciÃ³n).
// Combina: tabs inferiores (root screens) + stack de pantallas de detalle.

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { ROLE_DASHBOARD, ROLE_PERMISSIONS } from './roleConfig';
import { getNotificacionesContador, listSolicitudesFirma } from '../services/api';

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

export default function AppNavigator({ user, onLogout, onUserUpdate }) {
  const permisos = { ...(ROLE_PERMISSIONS[user.role] || {}), ...(user.permissions || {}) };
  const tabsVisibles = permisos.tabs; // ej. Testigo no incluye 'documentos'
  const [activeTab, setActiveTab] = useState('inicio');
  const [stack, setStack] = useState([]); // [{ screen, params }]
  const [badges, setBadges] = useState({});

  const navigation = useMemo(
    () => ({
      navigate: (screen, params = {}) => setStack((prev) => [...prev, { screen, params }]),
      goBack: () => setStack((prev) => prev.slice(0, -1)),
      popToTab: () => setStack([]),
      goHome: () => {
        setActiveTab('inicio');
        setStack([]);
      },
    }),
    []
  );

  useEffect(() => {
    let mounted = true;

    async function loadBadges() {
      const next = {};
      try {
        if (tabsVisibles.includes('avisos')) {
          const contador = await getNotificacionesContador();
          next.avisos = contador.noLeidas ?? contador.total ?? 0;
        }

        if (tabsVisibles.includes('firma')) {
          const solicitudes = await listSolicitudesFirma();
          next.firma = solicitudes.filter((item) => item.estado === 'Pendiente').length;
        }
      } catch (err) {
        next.avisos = 0;
        next.firma = 0;
      }

      if (mounted) setBadges(next);
    }

    loadBadges();
    return () => {
      mounted = false;
    };
  }, [tabsVisibles, activeTab, stack.length]);
  const handleChangeTab = (tabKey) => {
    setActiveTab(tabKey);
    setStack([]); // al cambiar de tab, regresamos a la raÃ­z de ese tab
  };

  // --- Si hay pantallas apiladas, mostramos la Ãºltima (detalle) ---
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
            onUserUpdate={onUserUpdate}
          />
        </View>
      </View>
    );
  }

  // --- RaÃ­z segÃºn el tab activo ---
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







