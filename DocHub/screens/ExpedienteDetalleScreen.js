import React, { useCallback, useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import EmptyState from '../components/EmptyState';
import { ROLE_PERMISSIONS } from '../navigation/roleConfig';
import {
  createParticipante,
  deleteExpediente,
  deleteParticipante,
  getExpediente,
  listParticipantes,
  listUsuarios,
  updateExpediente,
  updateExpedienteEstado,
  updateParticipante,
} from '../services/api';
import { Ionicons } from "@expo/vector-icons";

const emptyParticipant = { usuarioId: '', nombre: '', rol: '', categoria: '', email: '', telefono: '' };

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

export default function ExpedienteDetalleScreen({ route, navigation, user }) {
  const { id, onChanged } = route.params;
  const permisos = { ...(ROLE_PERMISSIONS[user.role] || {}), ...(user.permissions || {}) };
  const canAdminExpediente = Boolean(permisos.puedeAdministrarExpedientes);
  const canAdminParticipantes = Boolean(permisos.puedeAdministrarParticipantes);
  const [expediente, setExpediente] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(null);
  const [participantForm, setParticipantForm] = useState(emptyParticipant);
  const [editingParticipantId, setEditingParticipantId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('Todos');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [exp, parts, users] = await Promise.all([getExpediente(id), listParticipantes(id), listUsuarios()]);
      setExpediente(exp);
      setForm(toForm(exp));
      setParticipantes(parts);
      setUsuarios(users);
    } catch (err) {
      Alert.alert('No se pudo cargar expediente', err.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveExpediente = async () => {
    if (!form.tipo.trim()) {
      Alert.alert('Tipo requerido', 'El expediente necesita un tipo de proceso.');
      return;
    }

    const fechaInicioValue = (form.fechaInicio || '').trim() || getTodayDateString();

    setForm((prev) => ({ ...prev, fechaInicio: fechaInicioValue }));

    setSaving(true);
    try {
      const updated = await updateExpediente(id, {
        tipo: form.tipo.trim(),
        juzgado: form.juzgado.trim(),
        fechaInicio: fechaInicioValue,
        progreso: Number(form.progreso || 0) / 100,
        descripcion: form.descripcion.trim(),
      });
      setExpediente(updated);
      setForm(toForm(updated));
      onChanged?.();
      Alert.alert('Expediente actualizado', 'Los cambios se guardaron correctamente.');
    } catch (err) {
      Alert.alert('No se pudo guardar', err.message || 'Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const changeEstado = (estado) => {
    Alert.alert('Cambiar estado', `Quieres marcar este expediente como ${estado}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          setSaving(true);
          try {
            const updated = await updateExpedienteEstado(id, estado, `Cambio realizado desde Doc Hub a ${estado}`);
            setExpediente(updated);
            setForm(toForm(updated));
            onChanged?.();
          } catch (err) {
            Alert.alert('No se pudo cambiar estado', err.message || 'Intenta de nuevo.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const removeExpediente = () => {
    Alert.alert('Eliminar expediente', 'Se realizara una eliminacion logica. Deseas continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteExpediente(id, 'Eliminado desde Doc Hub');
            onChanged?.();
            navigation.goBack();
          } catch (err) {
            Alert.alert('No se pudo eliminar', err.message || 'Intenta de nuevo.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const saveParticipante = async () => {
    if (!participantForm.nombre.trim() || !participantForm.rol.trim()) {
      Alert.alert('Datos requeridos', 'Captura nombre y rol del participante.');
      return;
    }

    setSaving(true);
    try {
      if (!participantForm.usuarioId) {
        Alert.alert('Usuario requerido', 'Selecciona un usuario existente para asignarlo al expediente.');
        return;
      }
      const payload = cleanParticipant(participantForm);
      if (editingParticipantId) {
        const updated = await updateParticipante(id, editingParticipantId, payload);
        setParticipantes((prev) => prev.map((item) => (item.id === editingParticipantId ? updated : item)));
      } else {
        const created = await createParticipante(id, payload);
        setParticipantes((prev) => [created, ...prev]);
      }
      setParticipantForm(emptyParticipant);
      setEditingParticipantId(null);
      onChanged?.();
    } catch (err) {
      Alert.alert('No se pudo guardar participante', err.message || 'Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const editParticipante = (participante) => {
    setEditingParticipantId(participante.id);
    setParticipantForm({
      usuarioId: participante.usuarioId || '',
      nombre: participante.nombre || '',
      rol: participante.rol || '',
      categoria: participante.categoria || '',
      email: participante.email || '',
      telefono: participante.telefono || '',
    });
  };

  const removeParticipante = (participante) => {
    Alert.alert('Eliminar participante', `Quitar a ${participante.nombre} del expediente?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteParticipante(id, participante.id);
            setParticipantes((prev) => prev.filter((item) => item.id !== participante.id));
            onChanged?.();
          } catch (err) {
            Alert.alert('No se pudo eliminar participante', err.message || 'Intenta de nuevo.');
          }
        },
      },
    ]);
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

  const userRoles = ['Todos', ...Array.from(new Set(usuarios.map((u) => u.categoria).filter(Boolean)))];

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch = !userSearch.trim() || (usuario.nombre || '').toLowerCase().includes(userSearch.trim().toLowerCase());
    const matchesRole = userRoleFilter === 'Todos' || usuario.categoria === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (!expediente || !form) {
    return (
      <SafeAreaView style={globalStyles.screen}>
        <ScreenHeader title="Expediente" subtitle={loading ? 'Cargando...' : id} onBack={() => navigation.goBack()} />
        <View style={globalStyles.screenContent}>
          <EmptyState icon="EXP" title={loading ? 'Cargando expediente' : 'Sin datos'} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title={expediente.id} subtitle={expediente.tipo} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <Card>
          <View style={globalStyles.cardRow}>
            <Text style={globalStyles.sectionTitle}>Informacion del caso</Text>
            <StatusBadge status={expediente.estado} />
          </View>
          {canAdminExpediente ? (
            <>
              <FormField label="Tipo de proceso" value={form.tipo} onChangeText={(tipo) => setForm((prev) => ({ ...prev, tipo }))} />
              <FormField label="Juzgado" value={form.juzgado} onChangeText={(juzgado) => setForm((prev) => ({ ...prev, juzgado }))} />

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

              <FormField label="Progreso (%)" value={form.progreso} onChangeText={(progreso) => setForm((prev) => ({ ...prev, progreso }))} keyboardType="numeric" />
              <FormField label="Descripcion" value={form.descripcion} onChangeText={(descripcion) => setForm((prev) => ({ ...prev, descripcion }))} multiline />
              <AppButton label="Guardar expediente" onPress={saveExpediente} loading={saving} />
            </>
          ) : (
            <>
              <InfoRow label="Tipo de proceso" value={expediente.tipo} />
              <InfoRow label="Juzgado" value={expediente.juzgado || '-'} />
              <InfoRow label="Fecha de inicio" value={expediente.fechaInicio} />
            </>
          )}
          <View style={{ marginTop: spacing.md }}>
            <View style={[globalStyles.cardRow, { marginBottom: 6 }]}>
              <Text style={styles.progressLabel}>Progreso del proceso</Text>
              <Text style={styles.progressLabel}>{Math.round((expediente.progreso || 0) * 100)}%</Text>
            </View>
            <ProgressBar progress={expediente.progreso || 0} />
          </View>
        </Card>

        {canAdminExpediente && (
          <View style={styles.actionGrid}>
            <AppButton label="Activo" variant="outline" onPress={() => changeEstado('Activo')} style={styles.actionButton} />
            <AppButton label="Pendiente" variant="outline" onPress={() => changeEstado('Pendiente')} style={styles.actionButton} />
            <AppButton label="Cerrar" variant="outline" onPress={() => changeEstado('Cerrado')} style={styles.actionButton} />
            <AppButton label="Eliminar" variant="danger" onPress={removeExpediente} style={styles.actionButton} />
          </View>
        )}

        <Text style={globalStyles.sectionTitle}>Participantes</Text>
        {canAdminParticipantes && (
          <Card>
            <Text style={styles.formTitle}>{editingParticipantId ? 'Editar participante' : 'Nuevo participante'}</Text>
            <Text style={globalStyles.inputLabel}>Usuario existente</Text>

            <TextInput
              style={globalStyles.input}
              value={userSearch}
              onChangeText={setUserSearch}
              placeholder="Buscar usuario por nombre..."
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.roleFilterRow}>
              {userRoles.map((role) => (
                <Pressable
                  key={role}
                  style={[styles.roleChip, userRoleFilter === role && styles.roleChipActive]}
                  onPress={() => setUserRoleFilter(role)}
                >
                  <Text style={[styles.roleChipText, userRoleFilter === role && styles.roleChipTextActive]}>{role}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.userChipsRow}>
              {filteredUsuarios.length === 0 ? (
                <Text style={styles.noResultsText}>No hay usuarios que coincidan con la busqueda.</Text>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <Pressable
                    key={usuario.id}
                    style={[styles.userChip, participantForm.usuarioId === usuario.id && styles.userChipActive]}
                    onPress={() => setParticipantForm((prev) => ({
                      ...prev,
                      usuarioId: usuario.id,
                      nombre: usuario.nombre,
                      categoria: usuario.categoria,
                      rol: prev.rol || usuario.categoria,
                    }))}
                  >
                    <Text style={[styles.userChipText, participantForm.usuarioId === usuario.id && styles.userChipTextActive]}>
                      {usuario.nombre} ({usuario.categoria})
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
            <FormField label="Nombre" value={participantForm.nombre} onChangeText={() => {}} />
            <FormField label="Rol" value={participantForm.rol} onChangeText={(rol) => setParticipantForm((prev) => ({ ...prev, rol }))} placeholder="Parte solicitante, Abogado, Testigo..." />
            <FormField label="Categoria" value={participantForm.categoria} onChangeText={(categoria) => setParticipantForm((prev) => ({ ...prev, categoria }))} placeholder="Parte, Abogado, Testigo..." />
            <FormField label="Email" value={participantForm.email} onChangeText={(email) => setParticipantForm((prev) => ({ ...prev, email }))} keyboardType="email-address" />
            <FormField label="Telefono" value={participantForm.telefono} onChangeText={(telefono) => setParticipantForm((prev) => ({ ...prev, telefono }))} keyboardType="phone-pad" />
            <AppButton label={editingParticipantId ? 'Guardar participante' : 'Agregar participante'} onPress={saveParticipante} loading={saving} />
            {editingParticipantId && (
              <AppButton label="Cancelar edicion" variant="outline" onPress={() => { setEditingParticipantId(null); setParticipantForm(emptyParticipant); }} style={{ marginTop: spacing.sm }} />
            )}
          </Card>
        )}

        <Card>
          {participantes.length === 0 ? (
            <EmptyState icon="USR" title="Sin participantes" message="Aun no hay participantes asignados." />
          ) : (
            participantes.map((p, idx) => (
              <View key={p.id} style={[styles.participantRow, idx !== participantes.length - 1 && styles.participantDivider]}>
                <IconCircle symbol={(p.nombre || '?').charAt(0)} bg={colors.primaryLight} fg={colors.primary} size={36} />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={styles.participantName}>{p.nombre}</Text>
                  <Text style={styles.participantRole}>{p.rol}{p.categoria ? ` - ${p.categoria}` : ''}</Text>
                  {(p.email || p.telefono) && <Text style={styles.participantMeta}>{[p.email, p.telefono].filter(Boolean).join(' | ')}</Text>}
                </View>
                {canAdminParticipantes && (
                  <View style={styles.participantActions}>
                    <Pressable style={styles.smallAction} onPress={() => editParticipante(p)}>
                      <Text style={styles.smallActionText}>Editar</Text>
                    </Pressable>
                    <Pressable style={styles.smallDangerAction} onPress={() => removeParticipante(p)}>
                      <Text style={styles.smallDangerText}>Quitar</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))
          )}
        </Card>

        <Text style={globalStyles.sectionTitle}>Documentos</Text>
        <Card onPress={() => navigation.navigate('Documentos', { expedienteId: expediente.id })}>
          <View style={globalStyles.cardRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View 
                style={{
                  width:36,
                  height:36,
                  borderRadius:18,
                  backgroundColor: colors.infoBg,
                  justifyContent:'center',
                  alignItems:'center'
                }}
              >
                <Ionicons 
                  name="document-text-outline"
                  size={22}
                  color={colors.info}
                />
            </View>
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={styles.participantName}>Ver documentos del expediente</Text>
                <Text style={styles.participantRole}>{expediente.docsFirmados}/{expediente.docsTotal} autorizados</Text>
              </View>
            </View>
            <Ionicons 
              name="chevron-forward-outline"
              size={22}
              color={colors.textMuted}
            />
          </View>
        </Card>

      </ScrollView>

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

function toForm(expediente) {
  return {
    tipo: expediente.tipo || '',
    juzgado: expediente.juzgado || '',
    fechaInicio: expediente.fechaInicio || getTodayDateString(),
    progreso: String(Math.round((expediente.progreso || 0) * 100)),
    descripcion: expediente.descripcion || '',
  };
}

function cleanParticipant(participant) {
  return {
    usuarioId: participant.usuarioId,
    nombre: participant.nombre.trim(),
    rol: participant.rol.trim(),
    categoria: participant.categoria.trim() || null,
    email: participant.email.trim() || null,
    telefono: participant.telefono.trim() || null,
  };
}

function FormField({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }) {
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
        keyboardType={keyboardType}
      />
    </View>
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
    gap: spacing.md,
  },
  progressLabel: { fontSize: fonts.size.xs, color: colors.textMuted },
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: { flexBasis: '48%', minHeight: 42 },
  formTitle: { fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  participantRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  participantDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  participantName: { fontSize: fonts.size.md, fontWeight: fonts.weight.semibold, color: colors.textPrimary },
  participantRole: { fontSize: fonts.size.sm, color: colors.textSecondary, marginTop: 2 },
  participantMeta: { fontSize: fonts.size.xs, color: colors.textMuted, marginTop: 2 },
  participantActions: { alignItems: 'flex-end', gap: 6 },
  smallAction: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: spacing.radius.sm, backgroundColor: colors.infoBg },
  smallActionText: { color: colors.info, fontSize: fonts.size.xs, fontWeight: fonts.weight.bold },
  smallDangerAction: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: spacing.radius.sm, backgroundColor: colors.dangerBg },
  smallDangerText: { color: colors.danger, fontSize: fonts.size.xs, fontWeight: fonts.weight.bold },
  roleFilterRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, marginBottom: spacing.sm },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  roleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleChipText: { fontSize: fonts.size.sm, color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  roleChipTextActive: { color: colors.white },
  noResultsText: { fontSize: fonts.size.sm, color: colors.textMuted, marginBottom: spacing.md },
  userChipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  userChip: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, marginRight: spacing.sm, marginBottom: spacing.sm },
  userChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  userChipText: { fontSize: fonts.size.xs, color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  userChipTextActive: { color: colors.white },
  chevron: { fontSize: 22, color: colors.textMuted },
});