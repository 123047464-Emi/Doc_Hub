import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable, Modal, Alert, StyleSheet, RefreshControl } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import IconCircle from '../components/IconCircle';
import EmptyState from '../components/EmptyState';
import AppButton from '../components/AppButton';
import { ROLE_PERMISSIONS } from '../navigation/roleConfig';
import { createSolicitudFirma, listDocumentos, listExpedientes, listParticipantes, listSolicitudesFirma } from '../services/api';

const TABS = ['Pendientes', 'Firmadas', 'Rechazadas'];

export default function SolicitudesFirmaScreen({ navigation, user }) {
  const permisos = { ...(ROLE_PERMISSIONS[user.role] || {}), ...(user.permissions || {}) };
  const puedeSolicitarFirma = Boolean(permisos.puedeSolicitarFirma);
  const [tab, setTab] = useState('Pendientes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [expedientes, setExpedientes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [firmantes, setFirmantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [expedienteSel, setExpedienteSel] = useState('');
  const [documentoSel, setDocumentoSel] = useState('');
  const [firmanteSel, setFirmanteSel] = useState('');

  const loadSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSolicitudesFirma();
      setSolicitudes(data);
    } catch (err) {
      Alert.alert('No se pudieron cargar solicitudes', err.message || 'Revisa la conexion con la API.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExpedientes = useCallback(async () => {
    if (!puedeSolicitarFirma) return;

    try {
      const data = await listExpedientes();
      setExpedientes(data);
      setExpedienteSel((current) => current || data[0]?.id || '');
    } catch (err) {
      Alert.alert('No se pudieron cargar expedientes', err.message || 'Revisa la conexion con la API.');
    }
  }, [puedeSolicitarFirma]);

  const loadOpcionesFirma = useCallback(async () => {
    if (!puedeSolicitarFirma || !expedienteSel) return;

    try {
      const [docs, participantes] = await Promise.all([listDocumentos(expedienteSel), listParticipantes(expedienteSel)]);
      const docsFirmables = docs.filter((doc) => doc.estado !== 'Rechazado');
      const participantesConUsuario = participantes.filter((p) => p.usuarioId && String(p.usuarioId) !== String(user.id));
      setDocumentos(docsFirmables);
      setFirmantes(participantesConUsuario);
      setDocumentoSel((current) => docsFirmables.some((doc) => doc.id === current) ? current : docsFirmables[0]?.id || '');
      setFirmanteSel((current) => participantesConUsuario.some((p) => p.usuarioId === current) ? current : participantesConUsuario[0]?.usuarioId || '');
    } catch (err) {
      Alert.alert('No se pudieron cargar opciones', err.message || 'Revisa documentos y participantes del expediente.');
    }
  }, [expedienteSel, puedeSolicitarFirma, user.id]);

  useEffect(() => {
    loadSolicitudes();
    if (puedeSolicitarFirma) loadExpedientes();
  }, [loadSolicitudes, loadExpedientes, puedeSolicitarFirma]);

  useEffect(() => {
    loadOpcionesFirma();
  }, [loadOpcionesFirma]);

  const estadoObjetivo = tab === 'Pendientes' ? 'Pendiente' : tab === 'Firmadas' ? 'Firmado' : 'Rechazado';
  const data = solicitudes.filter((item) => item.estado === estadoObjetivo);

  const crearSolicitud = async () => {
    const documento = documentos.find((item) => item.id === documentoSel);

    if (!expedienteSel || !documento || !firmanteSel) {
      Alert.alert('Falta informacion', 'Selecciona expediente, documento existente y firmante relacionado.');
      return;
    }

    try {
      const nueva = await createSolicitudFirma({
        documento: documento.nombre,
        documentoId: documento.id,
        expedienteId: expedienteSel,
        version: documento.version,
        firmanteUsuarioId: firmanteSel,
      });
      setSolicitudes((prev) => [nueva, ...prev]);
      setModalVisible(false);
      Alert.alert('Solicitud creada', 'La solicitud de firma fue enviada.');
    } catch (err) {
      Alert.alert('No se pudo crear', err.message || 'Intenta de nuevo.');
    }
  };

  const handleOpen = (item) => {
    if (item.estado === 'Pendiente') {
      navigation.navigate('FirmaDigital', {
        solicitud: item,
        documento: item,
        expedienteId: item.expedienteId,
        onSigned: loadSolicitudes,
      });
      return;
    }

    if (item.documentoId) {
      navigation.navigate('VisorDocumento', { documento: { id: item.documentoId, nombre: item.documento, version: item.version, expedienteId: item.expedienteId } });
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title="Solicitudes de firma"
        subtitle={permisos.soloSolicitudesFirma ? 'Documentos asignados para tu firma' : 'Documentos que requieren firma digital'}
        onBack={() => navigation.goHome?.()}
        rightIcon={puedeSolicitarFirma ? '+' : null}
        onRightPress={() => puedeSolicitarFirma && setModalVisible(true)}
      />

      <View style={styles.tabRow}>
        {TABS.map((item) => (
          <Pressable key={item} style={styles.tabBtn} onPress={() => setTab(item)}>
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
            {tab === item && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSolicitudes} />}
        contentContainerStyle={globalStyles.screenContent}
        ListEmptyComponent={<EmptyState icon="SIG" title={loading ? 'Cargando solicitudes' : 'Sin solicitudes'} message={loading ? 'Consultando la API...' : `No tienes documentos ${tab.toLowerCase()}.`} />}
        renderItem={({ item }) => (
          <Card onPress={() => handleOpen(item)}>
            <View style={globalStyles.cardRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <IconCircle symbol="SIG" bg={colors.dangerBg} fg={colors.danger} size={40} />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={styles.docName} numberOfLines={1}>{item.documento}</Text>
                  <Text style={styles.docMeta}>Exp. #{item.expedienteId} - {item.version}</Text>
                </View>
              </View>
              <StatusBadge status={item.estado} />
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Solicitado por: {item.solicitante}</Text>
              <Text style={styles.footerText}>Firma: {item.firmanteNombre || item.firmanteCategoria}</Text>
            </View>
          </Card>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nueva solicitud de firma</Text>

            <Text style={globalStyles.inputLabel}>Expediente</Text>
            <View style={styles.expChipsRow}>
              {expedientes.map((item) => (
                <Chip key={item.id} active={expedienteSel === item.id} label={item.id} onPress={() => setExpedienteSel(item.id)} />
              ))}
            </View>

            <Text style={[globalStyles.inputLabel, { marginTop: spacing.md }]}>Documento existente</Text>
            <View style={styles.expChipsRow}>
              {documentos.map((item) => (
                <Chip key={item.id} active={documentoSel === item.id} label={`${item.nombre} (${item.version})`} onPress={() => setDocumentoSel(item.id)} />
              ))}
            </View>
            {documentos.length === 0 && <Text style={styles.emptyHint}>Este expediente no tiene documentos disponibles para firma.</Text>}

            <Text style={[globalStyles.inputLabel, { marginTop: spacing.md }]}>Firmante del expediente</Text>
            <View style={styles.expChipsRow}>
              {firmantes.map((item) => (
                <Chip key={item.id} active={firmanteSel === item.usuarioId} label={`${item.nombre} (${item.categoria || item.rol})`} onPress={() => setFirmanteSel(item.usuarioId)} />
              ))}
            </View>
            {firmantes.length === 0 && <Text style={styles.emptyHint}>Agrega participantes con usuario real antes de solicitar firma.</Text>}

            <AppButton label="Enviar solicitud" onPress={crearSolicitud} disabled={!documentoSel || !firmanteSel} style={{ marginTop: spacing.lg }} />
            <AppButton label="Cancelar" variant="outline" onPress={() => setModalVisible(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Chip({ active, label, onPress }) {
  return (
    <Pressable style={[styles.expChip, active && styles.expChipActive]} onPress={onPress}>
      <Text style={[styles.expChipText, active && styles.expChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tabBtn: { marginRight: spacing.xl, paddingVertical: spacing.md },
  tabText: { fontSize: fonts.size.md, color: colors.textMuted, fontWeight: fonts.weight.semibold },
  tabTextActive: { color: colors.primary },
  tabUnderline: { height: 3, backgroundColor: colors.primary, borderRadius: 2, marginTop: 6 },
  docName: { fontSize: fonts.size.md, fontWeight: fonts.weight.semibold, color: colors.textPrimary },
  docMeta: { fontSize: fonts.size.xs, color: colors.textMuted, marginTop: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider },
  footerText: { fontSize: fonts.size.xs, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.surface, borderRadius: spacing.radius.xl, padding: spacing.xl, maxHeight: '88%' },
  modalTitle: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  expChipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  expChip: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, marginRight: spacing.sm, marginBottom: spacing.sm },
  expChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  expChipText: { fontSize: fonts.size.xs, color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  expChipTextActive: { color: colors.white },
  emptyHint: { fontSize: fonts.size.xs, color: colors.textMuted, marginTop: 4 },
});
