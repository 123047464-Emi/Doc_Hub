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
import { changePassword } from '../services/api';

export default function PerfilScreen({ user, navigation, onLogout }) {
  const nombre = user.name;
  const cargo = user.cargo;
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [notifCorreo, setNotifCorreo] = useState(true);

  const roleLabel = ROLE_LABELS[user.role] || user.role || 'Usuario';

  const guardarPassword = async () => {
    if (!passwordActual || passwordNueva.length < 4) {
      Alert.alert('Datos incompletos', 'Captura tu contrasena actual y una nueva de al menos 4 caracteres.');
      return;
    }

    setGuardandoPassword(true);
    try {
      await changePassword(passwordActual, passwordNueva);
      setPasswordActual('');
      setPasswordNueva('');
      Alert.alert('Contrasena actualizada', 'Tu nueva contrasena quedo guardada.');
    } catch (err) {
      Alert.alert('No se pudo cambiar', err.message || 'Intenta de nuevo.');
    } finally {
      setGuardandoPassword(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert('Cerrar sesion', 'Seguro que deseas cerrar tu sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesion', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title="Mi perfil"
        subtitle="Informacion de la cuenta"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <View style={styles.profileHeader}>
          <IconCircle symbol={(nombre || '?').charAt(0)} bg={colors.primaryLight} fg={colors.primary} size={72} />
          <Text style={styles.userName}>{nombre}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{roleLabel}</Text>
          </View>
          <Text style={styles.userCargo}>{cargo}</Text>
        </View>

        <Text style={globalStyles.sectionTitle}>Informacion de la cuenta</Text>
        <Card>
          <InfoRow label="Usuario" value={user.username} />
          <InfoRow label="Rol" value={roleLabel} />
          <InfoRow label="Cargo" value={cargo} last />
        </Card>

        <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>Cambiar contrasena</Text>
        <Card>
          <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.inputLabel}>Contrasena actual</Text>
            <TextInput style={globalStyles.input} value={passwordActual} onChangeText={setPasswordActual} secureTextEntry />
          </View>
          <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.inputLabel}>Nueva contrasena</Text>
            <TextInput style={globalStyles.input} value={passwordNueva} onChangeText={setPasswordNueva} secureTextEntry />
          </View>
          <AppButton label="Actualizar contrasena" variant="outline" onPress={guardarPassword} loading={guardandoPassword} />
        </Card>

        <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>Preferencias</Text>
        <Card>
          <PreferenceRow label="Notificaciones push" value={notifPush} onChange={setNotifPush} />
          <PreferenceRow label="Notificaciones por correo" value={notifCorreo} onChange={setNotifCorreo} last />
        </Card>

        <AppButton label="Cerrar sesion" variant="danger" onPress={confirmLogout} style={{ marginTop: spacing.xl }} />

        <Text style={styles.versionText}>Sistema Integral de Gestion y Control Documental - v1.0.0</Text>
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
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, gap: spacing.md },
  infoRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  prefLabel: { fontSize: fonts.size.md, color: colors.textPrimary, fontWeight: fonts.weight.medium },
  versionText: { textAlign: 'center', fontSize: fonts.size.xs, color: colors.textMuted, marginTop: spacing.xl },
});