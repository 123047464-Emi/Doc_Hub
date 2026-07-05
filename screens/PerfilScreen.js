// screens/PerfilScreen.js
// Pantalla 13: Perfil de usuario.
// RF-13: permite consultar y actualizar la información personal autorizada del usuario.

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Switch, Alert, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import IconCircle from '../components/IconCircle';
import AppButton from '../components/AppButton';
import { ROLE_LABELS } from '../data/mockData';

export default function PerfilScreen({ user, navigation, onLogout }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(user.name);
  const [cargo, setCargo] = useState(user.cargo);
  const [notifPush, setNotifPush] = useState(true);
  const [notifCorreo, setNotifCorreo] = useState(true);
  const [biometrico, setBiometrico] = useState(false);

  const guardarCambios = () => {
    if (!nombre.trim() || !cargo.trim()) {
      Alert.alert('Datos incompletos', 'El nombre y el cargo no pueden quedar vacíos.');
      return;
    }
    setEditando(false);
    Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.');
  };

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title="Mi perfil"
        subtitle="Información de la cuenta"
        onBack={() => navigation.goBack()}
        rightIcon={editando ? '✕' : '✎'}
        onRightPress={() => setEditando((v) => !v)}
      />
      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <View style={styles.profileHeader}>
          <IconCircle symbol={nombre.charAt(0)} bg={colors.primaryLight} fg={colors.primary} size={72} />
          {!editando ? (
            <>
              <Text style={styles.userName}>{nombre}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{ROLE_LABELS[user.role]}</Text>
              </View>
              <Text style={styles.userCargo}>{cargo}</Text>
            </>
          ) : (
            <View style={{ width: '100%', marginTop: spacing.md }}>
              <View style={globalStyles.inputGroup}>
                <Text style={globalStyles.inputLabel}>Nombre completo</Text>
                <TextInput style={globalStyles.input} value={nombre} onChangeText={setNombre} />
              </View>
              <View style={globalStyles.inputGroup}>
                <Text style={globalStyles.inputLabel}>Cargo</Text>
                <TextInput style={globalStyles.input} value={cargo} onChangeText={setCargo} />
              </View>
              <AppButton label="Guardar cambios" onPress={guardarCambios} />
            </View>
          )}
        </View>

        <Text style={globalStyles.sectionTitle}>Información de la cuenta</Text>
        <Card>
          <InfoRow label="Usuario" value={user.username} />
          <InfoRow label="Rol" value={ROLE_LABELS[user.role]} />
          <InfoRow label="Cargo" value={cargo} last />
        </Card>

        <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>Preferencias</Text>
        <Card>
          <PreferenceRow label="Notificaciones push" value={notifPush} onChange={setNotifPush} />
          <PreferenceRow label="Notificaciones por correo" value={notifCorreo} onChange={setNotifCorreo} />
          <PreferenceRow label="Acceso biométrico" value={biometrico} onChange={setBiometrico} last />
        </Card>

        <AppButton label="Cerrar sesión" variant="danger" onPress={confirmLogout} style={{ marginTop: spacing.xl }} />

        <Text style={styles.versionText}>Sistema Integral de Gestión y Control Documental · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider]}>
      <Text style={globalStyles.label}>{label}</Text>
      <Text style={globalStyles.value}>{value}</Text>
    </View>
  );
}

function PreferenceRow({ label, value, onChange, last }) {
  return (
    <View style={[styles.prefRow, !last && styles.infoRowDivider]}>
      <Text style={styles.prefLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', marginBottom: spacing.xl },
  userName: { fontSize: fonts.size.xl, fontWeight: fonts.weight.bold, color: colors.textPrimary, marginTop: spacing.md },
  roleTag: { backgroundColor: colors.primaryLight, borderRadius: spacing.radius.full, paddingHorizontal: spacing.md, paddingVertical: 4, marginTop: spacing.xs },
  roleTagText: { color: colors.primary, fontWeight: fonts.weight.bold, fontSize: fonts.size.xs },
  userCargo: { fontSize: fonts.size.sm, color: colors.textSecondary, marginTop: spacing.xs },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  infoRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  prefLabel: { fontSize: fonts.size.md, color: colors.textPrimary, fontWeight: fonts.weight.medium },
  versionText: { textAlign: 'center', fontSize: fonts.size.xs, color: colors.textMuted, marginTop: spacing.xl },
});
