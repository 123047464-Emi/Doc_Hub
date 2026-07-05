// screens/DocumentosScreen.js
// Pantalla 6: Documentos del expediente (lista con estado y versión).
// RF-06: los documentos y acciones disponibles varían según el rol del usuario.

import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import IconCircle from '../components/IconCircle';
import EmptyState from '../components/EmptyState';
import { DOCUMENTOS } from '../data/mockData';
import { ROLE_PERMISSIONS } from '../navigation/roleConfig';

const FILTERS = [
  { key: 'Todos', label: 'Todos' },
  { key: 'Pendiente firma', label: 'Pendiente firma' },
  { key: 'Autorizado', label: 'Autorizados' },
];

const TIPO_ICON = {
  pdf: { symbol: '📄', bg: colors.dangerBg, fg: colors.danger },
  img: { symbol: '🖼', bg: colors.successBg, fg: colors.success },
  doc: { symbol: '📝', bg: colors.infoBg, fg: colors.info },
};

export default function DocumentosScreen({ route, navigation, user }) {
  const { expedienteId } = route.params;
  const permisos = ROLE_PERMISSIONS[user.role];
  const [filter, setFilter] = useState('Todos');
  const [documentos, setDocumentos] = useState(DOCUMENTOS[expedienteId] || []);

  // RF-06: "Parte" solo puede visualizar documentación ya autorizada.
  const documentosVisibles = permisos.soloDocumentosAutorizados
    ? documentos // se muestran todos (para dar seguimiento), pero el acceso al visor se restringe al abrir
    : documentos;

  const filtered = documentosVisibles.filter((d) => filter === 'Todos' || d.estado === filter);

  const handleAprobar = (id) => {
    setDocumentos((prev) => prev.map((d) => (d.id === id ? { ...d, estado: 'Autorizado' } : d)));
    Alert.alert('Documento autorizado', 'El documento fue aprobado correctamente.');
  };

  const handleRechazar = (id) => {
    Alert.alert('Rechazar documento', '¿Confirmas que deseas rechazar este documento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: () => {
          setDocumentos((prev) => prev.map((d) => (d.id === id ? { ...d, estado: 'Rechazado' } : d)));
        },
      },
    ]);
  };

  const handleOpen = (item) => {
    // RF-06/08: "Parte" solo puede abrir el visor si el documento ya está autorizado.
    if (permisos.soloDocumentosAutorizados && item.estado !== 'Autorizado' && item.estado !== 'Pendiente firma') {
      Alert.alert(
        'Documento en revisión',
        'Este documento aún no ha sido autorizado, por lo que no puede visualizarse todavía.'
      );
      return;
    }
    if (item.estado === 'Pendiente firma' && permisos.puedeFirmar) {
      navigation.navigate('FirmaDigital', { documento: item, expedienteId });
    } else {
      navigation.navigate('VisorDocumento', { documento: item });
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title="Documentos"
        subtitle={`Exp. #${expedienteId} · ${documentos.length} archivos`}
        onBack={() => navigation.goBack()}
        // RF-07: el botón de carga solo se muestra a quien tiene permiso de subir (rol Parte).
        rightIcon={permisos.puedeCargarDocumentos ? '⬆' : null}
        onRightPress={() => navigation.navigate('CargaDocumento', { expedienteId })}
      />

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {permisos.soloDocumentosAutorizados && (
        <View style={styles.noticeBar}>
          <Text style={styles.noticeText}>
            Solo puedes visualizar por completo los documentos ya autorizados.
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={globalStyles.screenContent}
        ListEmptyComponent={<EmptyState icon="▤" title="Sin documentos" message="No hay documentos con este filtro." />}
        renderItem={({ item }) => {
          const iconInfo = TIPO_ICON[item.tipo] || TIPO_ICON.doc;
          // RF-07 (actividad 7): aprobar/rechazar solo para roles con ese permiso, y solo si aún no fue resuelto.
          const puedeValidarEsteDoc =
            permisos.puedeAprobarRechazar && (item.estado === 'Subido' || item.estado === 'Procesando OCR');
          return (
            <Card onPress={() => handleOpen(item)}>
              <View style={globalStyles.cardRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <IconCircle symbol={iconInfo.symbol} bg={iconInfo.bg} fg={iconInfo.fg} size={40} />
                  <View style={{ marginLeft: spacing.md, flex: 1 }}>
                    <Text style={styles.docName} numberOfLines={1}>{item.nombre}</Text>
                    <Text style={styles.docMeta}>{item.version} · {item.tamano}</Text>
                  </View>
                </View>
                <StatusBadge status={item.estado} />
              </View>

              {puedeValidarEsteDoc && (
                <View style={styles.validationRow}>
                  <Pressable style={[styles.validationBtn, styles.approveBtn]} onPress={() => handleAprobar(item.id)}>
                    <Text style={styles.approveBtnText}>✓ Aprobar</Text>
                  </Pressable>
                  <Pressable style={[styles.validationBtn, styles.rejectBtn]} onPress={() => handleRechazar(item.id)}>
                    <Text style={styles.rejectBtnText}>✕ Rechazar</Text>
                  </Pressable>
                </View>
              )}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
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
});
