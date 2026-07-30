// screens/auth/LoginScreen.js
// Pantalla 1: Inicio de sesión (simulado con datos mock, sin backend real).

import React, { useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import colors from '../../theme/colors';
import fonts from '../../theme/fonts';
import spacing from '../../theme/spacing';
import globalStyles from '../../theme/globalStyles';
import AppButton from '../../components/AppButton';
import IconCircle from '../../components/IconCircle';
import { USERS, ROLE_LABELS } from '../../data/mockData';

export default function LoginScreen({ onLoginSuccess, onGoToRecover }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Ingresa tu usuario y contraseña para continuar.');
      return;
    }
    setLoading(true);
    // Simulación de autenticación contra datos mock
    setTimeout(() => {
      setLoading(false);
      const found = USERS.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
      );
      if (found) {
        onLoginSuccess(found);
      } else {
        Alert.alert('Credenciales inválidas', 'Usuario o contraseña incorrectos.');
      }
    }, 900);
  };

  const quickLogin = (role) => {
    const found = USERS.find((u) => u.role === role);
    setUsername(found.username);
    setPassword(found.password);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandBlock}>
            <Image source={require('../../assets/logo.png')} style={{ width: 90, height: 90, resizeMode: 'contain' }}
            />
            <Text style={styles.appName}>Sistema Integral de Gestión{'\n'}y Control Documental</Text>
            <Text style={styles.appTagline}>Doc_Hub</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={globalStyles.sectionTitle}>Iniciar sesión</Text>

            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.inputLabel}>Usuario</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="usuario123"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.inputLabel}>Contraseña</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[globalStyles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable onPress={onGoToRecover} style={{ alignSelf: 'flex-end', marginBottom: spacing.lg }}>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            <AppButton label="Ingresar" onPress={handleLogin} loading={loading} />

            <Text style={styles.demoTitle}>Acceso rápido de demostración</Text>
            <View style={styles.roleChipsRow}>
              {Object.keys(ROLE_LABELS).map((role) => (
                <Pressable key={role} style={styles.roleChip} onPress={() => quickLogin(role)}>
                  <Text style={styles.roleChipText}>{ROLE_LABELS[role]}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.footerText}>Contraseña de prueba para todos los roles: 1234</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  brandBlock: { alignItems: 'center', marginBottom: spacing.xxl },
  appName: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.primaryDark,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  appTagline: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1 },
  eyeBtn: { position: 'absolute', right: spacing.md },
  link: { color: colors.accent, fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold },
  demoTitle: {
    marginTop: spacing.xl,
    fontSize: fonts.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  roleChipsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.radius.full,
    backgroundColor: colors.primaryLight,
    marginRight: 8,
    marginBottom: 8,
  },
  roleChipText: { color: colors.primary, fontSize: fonts.size.xs, fontWeight: fonts.weight.bold },
  footerText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fonts.size.xs,
    marginTop: spacing.xl,
  },
});
