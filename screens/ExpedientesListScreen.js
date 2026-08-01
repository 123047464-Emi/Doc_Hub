import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, SafeAreaView, Text, TextInput, View, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import AppButton from '../components/AppButton';
import { ROLE_PERMISSIONS } from '../navigation/roleConfig';
import { createExpediente, listExpedientes } from '../services/api';

const FILTERS = ['Todos', 'Activo', 'Pendiente', 'Cerrado'];
const initialForm = { id: '', tipo: '', juzgado: '', fechaInicio: '', descripcion: '' };

export default function ExpedientesListScreen({ navigation, user }) {
  const permisos = { ...(ROLE_PERMISSIONS[user.role] || {}), ...(user.permissions || {}) };
  const [filter, setFilter] = useState('Todos');
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadExpedientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listExpedientes();
      setExpedientes(data);
    } catch (err) {
      Alert.alert('No se pudieron cargar expedientes', err.message || 'Revisa la conexion con la API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpedientes();
  }, [loadExpedientes]);

  const data = expedientes.filter((e) => filter === 'Todos' || e.estado === filter);

  const submitExpediente = async () => {
    if (!form.id.trim() || !form.tipo.trim()) {
      Alert.alert('Datos requeridos', 'Captura el numero de expediente y el tipo de proceso.');
      return;
    }

    setSaving(true);
    try {
      const created = await createExpediente({
        id: form.id.trim(),
        tipo: form.tipo.trim(),
        juzgado: form.juzgado.trim(),
        fechaInicio: form.fechaInicio.trim() || undefined,
        descripcion: form.descripcion.trim(),
      });
      setForm(initialForm);
      setShowForm(false);
      setExpedientes((prev) => [created, ...prev]);
      Alert.alert('Expediente creado', 'El expediente se registro correctamente.');
    } catch (err) {
      Alert.alert('No se pudo crear', err.message || 'Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title="Expedientes"
        subtitle={`${expedientes.length} expedientes registrados`}
        onBack={() => navigation.goHome?.()}
        rightIcon={permisos.puedeAdministrarExpedientes ? '+' : null}
        onRightPress={() => setShowForm((value) => !value)}
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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadExpedientes} />}
        contentContainerStyle={globalStyles.screenContent}
        ListHeaderComponent={
          showForm ? (
            <Card>
              <Text style={globalStyles.sectionTitle}>Nuevo expediente</Text>
              <FormField label="Numero de expediente" value={form.id} onChangeText={(id) => setForm((prev) => ({ ...prev, id }))} placeholder="DV-2026-0001" />
              <FormField label="Tipo de proceso" value={form.tipo} onChangeText={(tipo) => setForm((prev) => ({ ...prev, tipo }))} placeholder="Divorcio voluntario" />
              <FormField label="Juzgado" value={form.juzgado} onChangeText={(juzgado) => setForm((prev) => ({ ...prev, juzgado }))} placeholder="Juzgado 3 Familiar" />
              <FormField label="Fecha de inicio" value={form.fechaInicio} onChangeText={(fechaInicio) => setForm((prev) => ({ ...prev, fechaInicio }))} placeholder="2026-07-31" />
              <FormField label="Descripcion" value={form.descripcion} onChangeText={(descripcion) => setForm((prev) => ({ ...prev, descripcion }))} placeholder="Notas del caso" multiline />
              <AppButton label="Crear expediente" onPress={submitExpediente} loading={saving} />
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="EXP"
            title={loading ? 'Cargando expedientes' : 'Sin expedientes'}
            message={loading ? 'Consultando la API...' : 'No hay expedientes con este filtro.'}
          />
        }
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('ExpedienteDetalle', { id: item.id, onChanged: loadExpedientes })}>
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
                <Text style={styles.progressLabel}>{Math.round((item.progreso || 0) * 100)}%</Text>
              </View>
              <ProgressBar progress={item.progreso || 0} />
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{item.juzgado || 'Sin juzgado'}</Text>
              <Text style={styles.footerText}>{item.docsFirmados}/{item.docsTotal} docs autorizados</Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

function FormField({ label, value, onChangeText, placeholder, multiline = false }) {
  return (
    <View style={globalStyles.inputGroup}>
      <Text style={globalStyles.inputLabel}>{label}</Text>
      <TextInput
        style={[globalStyles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
      />
    </View>
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
    gap: spacing.sm,
  },
  footerText: { fontSize: fonts.size.xs, color: colors.textMuted, flex: 1 },
  multilineInput: { minHeight: 76, textAlignVertical: 'top' },
});



