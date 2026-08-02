import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import TimelineItem from '../components/TimelineItem';
import EmptyState from '../components/EmptyState';
import { listDocumentoTrazabilidad, listExpedienteTrazabilidad } from '../services/api';

export default function TrazabilidadScreen({ route, navigation }) {
  const { expedienteId, documentoId, documentoNombre } = route.params || {};
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistorial = useCallback(async () => {
    setLoading(true);
    try {
      const data = documentoId
        ? await listDocumentoTrazabilidad(documentoId)
        : await listExpedienteTrazabilidad(expedienteId);
      setHistorial(data.map(mapTraceItem));
    } catch (err) {
      Alert.alert('No se pudo cargar trazabilidad', err.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [documentoId, expedienteId]);

  useEffect(() => {
    loadHistorial();
  }, [loadHistorial]);

  const subtitle = documentoId
    ? documentoNombre || `Documento #${documentoId}`
    : `Exp. #${expedienteId}`;

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title="Trazabilidad" subtitle={subtitle} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={globalStyles.screenContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadHistorial} />}
      >
        {historial.length === 0 ? (
          <EmptyState icon="LOG" title="Sin historial" message="Aun no hay movimientos registrados." />
        ) : (
          <View style={styles.timelineWrap}>
            {historial.map((item, idx) => (
              <TimelineItem key={item.id} item={item} isLast={idx === historial.length - 1} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function mapTraceItem(item) {
  return {
    id: String(item.id),
    actor: `${item.usuarioNombre || 'Sistema'} (${item.rol || 'sin rol'})`,
    accion: formatAction(item),
    fecha: item.fecha || '-',
    tipo: traceType(item.accion),
  };
}

function formatAction(item) {
  const base = String(item.accion || 'accion').replace(/_/g, ' ');
  const extra = item.detalle ? ` - ${item.detalle}` : '';
  return `${base}${extra}`;
}

function traceType(action = '') {
  if (action.includes('firma')) return 'firma';
  if (action.includes('aprobar')) return 'aprobacion';
  if (action.includes('rechazar')) return 'rechazo';
  if (action.includes('crear')) return 'creacion';
  return 'subida';
}

const styles = StyleSheet.create({
  timelineWrap: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
});
