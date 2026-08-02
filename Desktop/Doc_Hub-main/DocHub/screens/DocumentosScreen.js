import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable, Alert, Modal, TextInput, StyleSheet, RefreshControl } from 'react-native';
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
import { listDocumentos, updateDocumentoEstado } from '../services/api';
import { Ionicons } from "@expo/vector-icons";


const FILTERS = [
  { key: 'Todos', label: 'Todos' },
  { key: 'Pendiente firma', label: 'Pendiente firma' },
  { key: 'Autorizado', label: 'Autorizados' },
  { key: 'Subido', label: 'Subidos' },
];

const TIPO_ICON = {
  pdf: { symbol: 'document-text-outline', bg: colors.dangerBg, fg: colors.danger },
  doc: { symbol: 'document-outline', bg: colors.infoBg, fg: colors.info },
  docx: { symbol: 'document-outline', bg: colors.infoBg, fg: colors.info },
};

export default function DocumentosScreen({ route, navigation, user }) {
  const { expedienteId } = route.params;
  const permisos = { ...(ROLE_PERMISSIONS[user.role] || {}), ...(user.permissions || {}) };
  const [filter, setFilter] = useState('Todos');
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rechazoDoc, setRechazoDoc] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const loadDocumentos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDocumentos(expedienteId);
      setDocumentos(data);
    } catch (err) {
      Alert.alert('No se pudieron cargar documentos', err.message || 'Revisa la conexion con la API.');
    } finally {
      setLoading(false);
    }
  }, [expedienteId]);

  useEffect(() => {
    loadDocumentos();
  }, [loadDocumentos]);

  const documentosVisibles = permisos.soloDocumentosAutorizados
    ? documentos.filter((item) => item.estado === 'Autorizado' || item.estado === 'Pendiente firma' || item.estado === 'Rechazado')
    : documentos;

  const filtered = documentosVisibles.filter((item) => filter === 'Todos' || item.estado === filter);

  const changeEstado = async (id, estado, motivo) => {
    try {
      const actualizado = await updateDocumentoEstado(id, estado, motivo);
      setDocumentos((prev) => prev.map((item) => (item.id === id ? actualizado : item)));
      Alert.alert('Documento actualizado', `El documento fue marcado como ${estado}.`);
    } catch (err) {
      Alert.alert('No se pudo actualizar', err.message || 'Intenta de nuevo.');
    }
  };

  const handleRechazar = (documento) => {
    setRechazoDoc(documento);
    setMotivoRechazo('');
  };

  const confirmarRechazo = async () => {
    const motivo = motivoRechazo.trim();
    if (!motivo) {
      Alert.alert('Motivo requerido', 'Escribe por que se rechaza el documento para que pueda corregirse.');
      return;
    }

    await changeEstado(rechazoDoc.id, 'Rechazado', motivo);
    setRechazoDoc(null);
    setMotivoRechazo('');
  };

  const handleOpen = (item) => {
    if (permisos.soloDocumentosAutorizados && item.estado !== 'Autorizado' && item.estado !== 'Pendiente firma' && item.estado !== 'Rechazado') {
      Alert.alert(
        'Documento en revision',
        'Este documento aun no ha sido autorizado, por lo que no puede visualizarse todavia.'
      );
      return;
    }

    if (item.estado === 'Pendiente firma' && permisos.puedeFirmar) {
      navigation.navigate('FirmaDigital', { documento: item, expedienteId });
    } else {
      navigation.navigate('VisorDocumento', { documento: item, onChanged: loadDocumentos });
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title="Documentos"
        subtitle={`Exp. #${expedienteId} - ${documentos.length} archivos`}
        onBack={() => navigation.goBack()}
        rightIcon={permisos.puedeCargarDocumentos ? 'add-outline' : null}
        onRightPress={() => navigation.navigate('CargaDocumento', { expedienteId, onUploaded: loadDocumentos })}
      />

      <View style={styles.filterRow}>
        {FILTERS.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterChipText, filter === item.key && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {permisos.soloDocumentosAutorizados && (
        <View style={styles.noticeBar}>
          <Text style={styles.noticeText}>Puedes ver autorizados, pendientes de firma y rechazados para enviar correcciones.</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDocumentos} />}
        contentContainerStyle={globalStyles.screenContent}
        ListEmptyComponent={
          <EmptyState
            icon="document-outline"
            title={loading ? 'Cargando documentos' : 'Sin documentos'}
            message={loading ? 'Consultando la API...' : 'No hay documentos con este filtro.'}
          />
        }
        renderItem={({ item }) => {
          const tipo = item.tipo || item.extension?.replace('.', '') || 'doc';
          const iconInfo = TIPO_ICON[tipo] || TIPO_ICON.doc;
          const puedeValidarEsteDoc =
            permisos.puedeAprobarRechazar && (item.estado === 'Subido' || item.estado === 'Procesando OCR');

          return (
            <Card onPress={() => handleOpen(item)}>
              <View style={globalStyles.cardRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <IconCircle symbol={iconInfo.symbol} bg={iconInfo.bg} fg={iconInfo.fg} size={40} />
                  <View style={{ marginLeft: spacing.md, flex: 1 }}>
                    <Text style={styles.docName} numberOfLines={1}>{item.nombre}</Text>
                    <Text style={styles.docMeta}>{item.version} - {item.tamanoTexto}</Text>
                  </View>
                </View>
                <StatusBadge status={item.estado} />
              </View>

              {puedeValidarEsteDoc && (
                <View style={styles.validationRow}>
                  <Pressable style={[styles.validationBtn, styles.approveBtn]} onPress={() => changeEstado(item.id, 'Autorizado')}>
                    <Text style={styles.approveBtnText}>Aprobar</Text>
                  </Pressable>
                  <Pressable style={[styles.validationBtn, styles.rejectBtn]} onPress={() => handleRechazar(item)}>
                    <Text style={styles.rejectBtnText}>Rechazar</Text>
                  </Pressable>
                </View>
              )}

              {item.estado === 'Rechazado' && (
                <View style={styles.rejectedBox}>
                  <Text style={styles.rejectedText}>Motivo: {item.rechazoMotivo || 'Sin motivo especificado'}</Text>
                  {permisos.puedeCargarDocumentos && (
                    <Pressable style={styles.fixBtn} onPress={() => navigation.navigate('CargaDocumento', { expedienteId, documento: item, onUploaded: loadDocumentos })}>
                      <Text style={styles.fixBtnText}>Subir correccion</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </Card>
          );
        }}
      />

      <Modal visible={Boolean(rechazoDoc)} transparent animationType='fade' onRequestClose={() => setRechazoDoc(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Motivo del rechazo</Text>
            <TextInput
              style={[globalStyles.input, styles.motivoInput]}
              value={motivoRechazo}
              onChangeText={setMotivoRechazo}
              placeholder='Explica que debe corregirse'
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <AppButton label='Rechazar documento' variant='danger' onPress={confirmarRechazo} />
            <AppButton label='Cancelar' variant='outline' onPress={() => setRechazoDoc(null)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: fonts.size.sm, color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  filterChipTextActive: { color: colors.white },
  docName: { fontSize: fonts.size.md, fontWeight: fonts.weight.semibold, color: colors.textPrimary },
  docMeta: { fontSize: fonts.size.xs, color: colors.textMuted, marginTop: 2 },
  noticeBar: {
    backgroundColor: colors.warningBg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: spacing.radius.md,
  },
  noticeText: { fontSize: fonts.size.xs, color: colors.warning, fontWeight: fonts.weight.semibold, textAlign: 'center' },
  validationRow: { flexDirection: 'row', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
  validationBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: spacing.radius.md, marginHorizontal: 4 },
  approveBtn: { backgroundColor: colors.successBg },
  approveBtnText: { color: colors.success, fontWeight: fonts.weight.bold, fontSize: fonts.size.sm },
  rejectBtn: { backgroundColor: colors.dangerBg },
  rejectBtnText: { color: colors.danger, fontWeight: fonts.weight.bold, fontSize: fonts.size.sm },
  rejectedBox: { marginTop: spacing.md, padding: spacing.sm, borderRadius: spacing.radius.md, backgroundColor: colors.dangerBg },
  rejectedText: { color: colors.danger, fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold },
  fixBtn: { marginTop: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: spacing.radius.md, backgroundColor: colors.surface },
  fixBtnText: { color: colors.danger, fontSize: fonts.size.xs, fontWeight: fonts.weight.bold },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.surface, borderRadius: spacing.radius.lg, padding: spacing.xl },
  modalTitle: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  motivoInput: { minHeight: 90, textAlignVertical: 'top', marginBottom: spacing.md },
});











