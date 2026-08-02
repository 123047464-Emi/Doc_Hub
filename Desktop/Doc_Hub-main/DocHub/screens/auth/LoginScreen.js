import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
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
import { listDemoUsers, login } from '../../services/api';

const FALLBACK_USERS = [
  { username: 'juez', password: '1234', categoria: 'Juez' },
  { username: 'notario', password: '1234', categoria: 'Notario' },
  { username: 'abogado', password: '1234', categoria: 'Abogado' },
  { username: 'parte', password: '1234', categoria: 'Parte' },
  { username: 'testigo', password: '1234', categoria: 'Testigo' },
];

export default function LoginScreen({ onLoginSuccess, onGoToRecover }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    let mounted = true;

    listDemoUsers()
      .then((users) => {
        if (mounted && Array.isArray(users)) {
          setDemoUsers(users.filter((user) => user.categoria !== 'Administrador'));
        }
      })
      .catch(() => {
        if (mounted) setDemoUsers([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Ingresa tu usuario y contrasena para continuar.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      if (user.role === 'administrador') {
        Alert.alert('Acceso web', 'Los administradores deben ingresar desde la aplicacion web.');
        return;
      }
      onLoginSuccess(user);
    } catch (err) {
      Alert.alert('No se pudo iniciar sesion', err.message || 'Usuario o contrasena incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password || '1234');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandBlock}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 90, height: 90, resizeMode: 'contain' }}
            />
            <Text style={styles.appName}>Sistema Integral de Gestion{'\n'}y Control Documental</Text>
            <Text style={styles.appTagline}>Doc Hub</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={globalStyles.sectionTitle}>Iniciar sesion</Text>

            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.inputLabel}>Usuario</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="juez"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={globalStyles.inputGroup}>
              <Text style={globalStyles.inputLabel}>Contrasena</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[globalStyles.input, styles.passwordInput]}
                  placeholder="1234"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((value) => !value)}>
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable onPress={onGoToRecover} style={{ alignSelf: 'flex-end', marginBottom: spacing.lg }}>
              <Text style={styles.link}>Olvidaste tu contrasena?</Text>
            </Pressable>

            <AppButton label="Ingresar" onPress={handleLogin} loading={loading} />

            <Text style={styles.demoTitle}>Acceso rapido de demostracion</Text>
            <View style={styles.roleChipsRow}>
              {demoUsers.map((user) => (
                <Pressable key={user.username} style={styles.roleChip} onPress={() => quickLogin(user)}>
                  <Text style={styles.roleChipText}>{user.categoria}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.footerText}>Contrasena de prueba para todos: 1234</Text>
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


