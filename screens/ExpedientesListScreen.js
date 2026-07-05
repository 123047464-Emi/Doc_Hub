// screens/ExpedientesListScreen.js
// Pantalla 4: Lista de expedientes (FlatList con estado por expediente).
// RF-04 + RNF-01: cada usuario solo ve los expedientes que le corresponden según su rol.

import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { EXPEDIENTES } from '../data/mockData';
import { ROLE_PERMISSIONS } from '../navigation/roleConfig';

const FILTERS = ['Todos', 'Activo', 'Pendiente', 'Cerrado'];

export default function ExpedientesListScreen({ navigation, user }) {
  const [filter, setFilter] = useState('Todos');
  const permisos = ROLE_PERMISSIONS[user.role];

  // RF-04: si el rol no ve todos los expedientes, se filtra solo a los que participa.
  const expedientesDelUsuario = permisos.verTodosExpedientes
    ? EXPEDIENTES
    : EXPEDIENTES.filter((e) => e.participantes.some((p) => p.nombre === user.name));

  const data = expedientesDelUsuario.filter((e) => filter === 'Todos' || e.estado === filter);

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title="Expedientes"
        subtitle={
          permisos.verTodosExpedientes
            ? `${expedientesDelUsuario.length} expedientes registrados`
            : `${expedientesDelUsuario.length} expediente(s) asociado(s) a ti`
        }
      />

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={globalStyles.screenContent}
        ListEmptyComponent={
          <EmptyState
            icon="📁"
            title="Sin expedientes"
            message={
              permisos.verTodosExpedientes
                ? 'No hay expedientes con este filtro.'
                : 'No tienes expedientes asociados con este filtro.'
            }
          />
        }
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('ExpedienteDetalle', { id: item.id })}>
            <View style={globalStyles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.expId}>{item.id}</Text>
                <Text style={styles.expTipo}>{item.tipo}</Text>
              </View>
              <StatusBadge status={item.estado} />
            </View>
            <View style={{ marginTop: spacing.md }}>
              <View style={[globalStyles.cardRow, { marginBottom: 6 }]}>
                <Text style={styles.progressLabel}>Progreso</Text>
                <Text style={styles.progressLabel}>{Math.round(item.progreso * 100)}%</Text>
              </View>
              <ProgressBar progress={item.progreso} />
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{item.juzgado}</Text>
              <Text style={styles.footerText}>{item.docsFirmados}/{item.docsTotal} docs firmados</Text>
            </View>
          </Card>
        )}
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
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold,
  },
  filterChipTextActive: { color: colors.white },
  expId: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.textPrimary },
  expTipo: { fontSize: fonts.size.sm, color: colors.textSecondary, marginTop: 2 },
  progressLabel: { fontSize: fonts.size.xs, color: colors.textMuted },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerText: { fontSize: fonts.size.xs, color: colors.textMuted },
});
