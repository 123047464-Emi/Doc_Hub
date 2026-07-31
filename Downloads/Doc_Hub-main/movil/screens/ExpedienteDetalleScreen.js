// screens/ExpedienteDetalleScreen.js
// Pantalla 5: Detalle de expediente (información, participantes y progreso).

import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import IconCircle from '../components/IconCircle';
import AppButton from '../components/AppButton';
import { EXPEDIENTES } from '../data/mockData';

export default function ExpedienteDetalleScreen({ route, navigation }) {
  const { id } = route.params;
  const expediente = EXPEDIENTES.find((e) => e.id === id) || EXPEDIENTES[0];

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title={expediente.id} subtitle={expediente.tipo} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <Card>
          <View style={globalStyles.cardRow}>
            <Text style={globalStyles.sectionTitle}>Información del caso</Text>
            <StatusBadge status={expediente.estado} />
          </View>
          <InfoRow label="Tipo de proceso" value={expediente.tipo} />
          <InfoRow label="Juzgado" value={expediente.juzgado} />
          <InfoRow label="Fecha de inicio" value={expediente.fechaInicio} />
          <View style={{ marginTop: spacing.sm }}>
            <View style={[globalStyles.cardRow, { marginBottom: 6 }]}>
              <Text style={styles.progressLabel}>Progreso del proceso</Text>
              <Text style={styles.progressLabel}>{Math.round(expediente.progreso * 100)}%</Text>
            </View>
            <ProgressBar progress={expediente.progreso} />
          </View>
        </Card>

        <Text style={globalStyles.sectionTitle}>Participantes</Text>
        <Card>
          {expediente.participantes.map((p, idx) => (
            <View
              key={p.nombre}
              style={[
                styles.participantRow,
                idx !== expediente.participantes.length - 1 && styles.participantDivider,
              ]}
            >
              <IconCircle symbol={p.nombre.charAt(0)} bg={colors.primaryLight} fg={colors.primary} size={36} />
              <View style={{ marginLeft: spacing.md }}>
                <Text style={styles.participantName}>{p.nombre}</Text>
                <Text style={styles.participantRole}>{p.rol}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Text style={globalStyles.sectionTitle}>Documentos</Text>
        <Card onPress={() => navigation.navigate('Documentos', { expedienteId: expediente.id })}>
          <View style={globalStyles.cardRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconCircle symbol="▤" bg={colors.infoBg} fg={colors.info} size={36} />
              <View style={{ marginLeft: spacing.md }}>
                <Text style={styles.participantName}>Ver documentos del expediente</Text>
                <Text style={styles.participantRole}>
                  {expediente.docsFirmados}/{expediente.docsTotal} firmados
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </Card>

        <AppButton
          label="Ver trazabilidad completa"
          variant="outline"
          onPress={() => navigation.navigate('Trazabilidad', { expedienteId: expediente.id })}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={globalStyles.label}>{label}</Text>
      <Text style={globalStyles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  progressLabel: { fontSize: fonts.size.xs, color: colors.textMuted },
  participantRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  participantDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  participantName: { fontSize: fonts.size.md, fontWeight: fonts.weight.semibold, color: colors.textPrimary },
  participantRole: { fontSize: fonts.size.sm, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textMuted },
});
