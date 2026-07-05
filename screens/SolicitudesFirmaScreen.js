// screens/SolicitudesFirmaScreen.js
// Pantalla 9: Solicitudes de firma pendientes y firmadas.
// RF-09 + actividad 8: el Abogado puede además crear nuevas solicitudes de firma.

import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable, Modal, TextInput, Alert, StyleSheet } from 'react-native';
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
import { SOLICITUDES_FIRMA, EXPEDIENTES} from '../data/mockData';
import { ROLE_PERMISSIONS } from '../navigation/roleConfig';

const TABS = ['Pendientes', 'Firmadas'];

export default function SolicitudesFirmaScreen({ navigation, user }) {
  const permisos = ROLE_PERMISSIONS[user.role];
  const [tab, setTab] = useState('Pendientes');
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_FIRMA);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreDoc, setNombreDoc] = useState('');
  const [expedienteSel, setExpedienteSel] = useState(EXPEDIENTES[0].id);

  const data = solicitudes.filter((f) =>
    tab === 'Pendientes' ? f.estado === 'Pendiente' : f.estado === 'Firmado'
  );

  const crearSolicitud = () => {
    if (!nombreDoc.trim()) {
      Alert.alert('Falta información', 'Escribe el nombre del documento a firmar.');
      return;
    }
    const nueva = {
      id: `f_${Date.now()}`,
      documento: nombreDoc.trim(),
      expedienteId: expedienteSel,
      version: 'v1.0',
      solicitante: user.name,
      fecha: new Date().toLocaleDateString('es-MX'),
      estado: 'Pendiente',
      paginas: 1,
      tamano: '—',
    };
    setSolicitudes((prev) => [nueva, ...prev]);
    setNombreDoc('');
    setModalVisible(false);
    Alert.alert('Solicitud creada', 'La solicitud de firma fue enviada.');
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title="Solicitudes de firma"
        subtitle={
          permisos.soloSolicitudesFirma
            ? 'Documentos asignados para tu firma'
            : 'Documentos que requieren firma digital'
        }
        // Solo el Abogado puede generar nuevas solicitudes de firma.
        rightIcon={permisos.puedeSolicitarFirma ? '+' : null}
        onRightPress={() => setModalVisible(true)}
      />

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable key={t} style={styles.tabBtn} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={globalStyles.screenContent}
        ListEmptyComponent={
          <EmptyState icon="✎" title="Sin solicitudes" message={`No tienes documentos ${tab.toLowerCase()}.`} />
        }
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              item.estado === 'Pendiente'
                ? navigation.navigate('FirmaDigital', { documento: item, expedienteId: item.expedienteId })
                : navigation.navigate('VisorDocumento', {
                    documento: { nombre: item.documento, version: item.version, estado: item.estado, tamano: item.tamano, paginas: item.paginas },
                  })
            }
          >
            <View style={globalStyles.cardRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <IconCircle symbol="📄" bg={colors.dangerBg} fg={colors.danger} size={40} />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={styles.docName} numberOfLines={1}>{item.documento}</Text>
                  <Text style={styles.docMeta}>Exp. #{item.expedienteId} · {item.version}</Text>
                </View>
              </View>
              <StatusBadge status={item.estado} />
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Solicitado por: {item.solicitante}</Text>
              <Text style={styles.footerText}>{item.fecha}</Text>
            </View>
          </Card>
        )}
      />

      {/* Modal: nueva solicitud de firma (exclusivo del rol Abogado) */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nueva solicitud de firma</Text>

            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.inputLabel}>Documento</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Ej. Poder notarial.pdf"
                placeholderTextColor={colors.textMuted}
                value={nombreDoc}
                onChangeText={setNombreDoc}
              />
            </View>

            <Text style={globalStyles.inputLabel}>Expediente</Text>
            <View style={styles.expChipsRow}>
              {EXPEDIENTES.map((e) => (
                <Pressable
                  key={e.id}
                  style={[styles.expChip, expedienteSel === e.id && styles.expChipActive]}
                  onPress={() => setExpedienteSel(e.id)}
                >
                  <Text style={[styles.expChipText, expedienteSel === e.id && styles.expChipTextActive]}>
                    {e.id}
                  </Text>
                </Pressable>
              ))}
            </View>

            <AppButton label="Enviar solicitud" onPress={crearSolicitud} style={{ marginTop: spacing.lg }} />
            <AppButton label="Cancelar" variant="outline" onPress={() => setModalVisible(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  modalCard: { backgroundColor: colors.surface, borderRadius: spacing.radius.xl, padding: spacing.xl },
  modalTitle: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  expChipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  expChip: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, marginRight: spacing.sm, marginBottom: spacing.sm },
  expChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  expChipText: { fontSize: fonts.size.xs, color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  expChipTextActive: { color: colors.white },
});
