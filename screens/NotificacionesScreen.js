import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, SafeAreaView, SectionList, View, Text, Pressable, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import IconCircle from '../components/IconCircle';
import EmptyState from '../components/EmptyState';
import { getDocumento, getExpediente, listNotificaciones, markNotificacionLeida } from '../services/api';

const TIPO_ICON = {
  firma: { symbol: 'SIG', bg: colors.purpleBg, fg: colors.purple },
  documento: { symbol: 'DOC', bg: colors.infoBg, fg: colors.info },
  recordatorio: { symbol: '!', bg: colors.warningBg, fg: colors.warning },
  comentario: { symbol: 'MSG', bg: colors.successBg, fg: colors.success },
};

function buildSections(items) {
  const unread = items.filter((item) => !item.leida);
  const read = items.filter((item) => item.leida);
  return [
    unread.length ? { title: 'No leidas', data: unread } : null,
    read.length ? { title: 'Leidas', data: read } : null,
  ].filter(Boolean);
}

export default function NotificacionesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listNotificaciones();
      setItems(data);
    } catch (err) {
      Alert.alert('No se pudieron cargar notificaciones', err.message || 'Revisa la conexion con la API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const sections = useMemo(() => buildSections(items), [items]);
  const unreadCount = items.filter((n) => !n.leida).length;

  const openNotification = async (item) => {
    try {
      if (!item.leida) {
        const updated = await markNotificacionLeida(item.id);
        setItems((prev) => prev.map((n) => (n.id === item.id ? updated : n)));
      }

      if (item.accion === 'firmar_documento' || item.accion === 'ver_solicitud_firma') {
        navigation.navigate('SolicitudesFirma');
        return;
      }

      if (item.documentoId) {
        const documento = await getDocumento(item.documentoId);
        navigation.navigate('VisorDocumento', { documento });
        return;
      }

      if (item.expedienteId) {
        const expediente = await getExpediente(item.expedienteId);
        navigation.navigate('ExpedienteDetalle', { id: expediente.id });
      }
    } catch (err) {
      Alert.alert('No se pudo abrir', err.message || 'Intenta de nuevo.');
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title="Notificaciones" subtitle={`${unreadCount} sin leer`} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={globalStyles.screenContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadItems} />}
        ListEmptyComponent={
          <EmptyState
            icon="OK"
            title={loading ? 'Cargando notificaciones' : 'Sin notificaciones'}
            message={loading ? 'Consultando la API...' : 'No tienes avisos pendientes.'}
          />
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => {
          const iconInfo = TIPO_ICON[item.tipo] || TIPO_ICON.documento;
          return (
            <Pressable style={[styles.notifCard, !item.leida && styles.notifCardUnread]} onPress={() => openNotification(item)}>
              <IconCircle symbol={iconInfo.symbol} bg={iconInfo.bg} fg={iconInfo.fg} size={38} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={globalStyles.cardRow}>
                  <Text style={styles.notifTitle}>{item.titulo || item.tipo}</Text>
                  <Text style={styles.notifHora}>{formatDate(item.fecha)}</Text>
                </View>
                <Text style={styles.notifMensaje}>{item.mensaje}</Text>
              </View>
              {!item.leida && <View style={styles.unreadDot} />}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

function formatDate(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  notifCardUnread: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  notifTitle: { fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.textPrimary, flex: 1 },
  notifHora: { fontSize: fonts.size.xs, color: colors.textMuted },
  notifMensaje: { fontSize: fonts.size.sm, color: colors.textSecondary, marginTop: 4, lineHeight: fonts.lineHeight.normal },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginLeft: spacing.sm, marginTop: 4 },
});


