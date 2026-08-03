import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, SafeAreaView, Text, TextInput, View, StyleSheet, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { Ionicons } from "@expo/vector-icons";

const FILTERS = ['Todos', 'Activo', 'Pendiente', 'Cerrado'];

const getTodayDateString = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

// Convierte un string dd/mm/yyyy a objeto Date. Si no es válido, regresa hoy.
const parseDateString = (value) => {
  if (!value) return new Date();
  const parts = value.split('/');
  if (parts.length !== 3) return new Date();
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return new Date();
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? new Date() : date;
};

// Convierte un objeto Date a string dd/mm/yyyy
const formatDateObject = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getInitialForm = () => ({ id: '', tipo: '', juzgado: '', fechaInicio: getTodayDateString(), descripcion: '' });

export default function ExpedientesListScreen({ navigation, user }) {
  const permisos = { ...(ROLE_PERMISSIONS[user.role] || {}), ...(user.permissions || {}) };
  const [filter, setFilter] = useState('Todos');
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(getInitialForm);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const toggleForm = () => {
    setShowForm((prev) => {
      const next = !prev;
      if (next) {
        // Al abrir el formulario, siempre arrancamos con la fecha de hoy.
        setForm(getInitialForm());
      }
      return next;
    });
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'dismissed') return;
    }
    if (selectedDate) {
      setForm((prev) => ({ ...prev, fechaInicio: formatDateObject(selectedDate) }));
    }
  };

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
        fechaInicio: form.fechaInicio.trim() || getTodayDateString(),
        descripcion: form.descripcion.trim(),
      });
      setForm(getInitialForm());
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
        rightIcon={permisos.puedeAdministrarExpedientes ? 'add' : null}
        onRightPress={toggleForm}
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

              <View style={globalStyles.inputGroup}>
                <Text style={globalStyles.inputLabel}>Fecha de inicio</Text>
                <Pressable
                  style={[globalStyles.input, styles.dateInput]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateInputText}>{form.fechaInicio || getTodayDateString()}</Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                </Pressable>
              </View>

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

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade" visible={showDatePicker}>
          <Pressable style={styles.datePickerOverlay} onPress={() => setShowDatePicker(false)}>
            <Pressable style={styles.datePickerCard} onPress={() => {}}>
              <DateTimePicker
                value={parseDateString(form.fechaInicio)}
                mode="date"
                display="inline"
                maximumDate={new Date()}
                onChange={handleDateChange}
              />
              <AppButton label="Listo" onPress={() => setShowDatePicker(false)} />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {showDatePicker && Platform.OS !== 'ios' && (
        <DateTimePicker
          value={parseDateString(form.fechaInicio)}
          mode="date"
          display="calendar"
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: fonts.size.md,
    color: colors.textPrimary,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    width: '90%',
  },
});