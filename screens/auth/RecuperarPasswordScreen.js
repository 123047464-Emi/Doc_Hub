// screens/auth/RecuperarPasswordScreen.js
// Pantalla 2: Recuperar contraseña (flujo simulado, sin envío real de correo).

import React, { useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import fonts from '../../theme/fonts';
import globalStyles from '../../theme/globalStyles';
import AppButton from '../../components/AppButton';
import ScreenHeader from '../../components/ScreenHeader';
import IconCircle from '../../components/IconCircle';

export default function RecuperarPasswordScreen({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Recuperar contraseña" subtitle="Te ayudamos a restablecer tu acceso" onBack={onBack} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={globalStyles.screenContent}>
          {!sent ? (
            <>
              <View style={styles.iconWrap}>
                <IconCircle symbol="🔑" bg={colors.primaryLight} fg={colors.primary} size={56} />
              </View>
              <Text style={styles.instructions}>
                Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un enlace para
                restablecer tu contraseña.
              </Text>

              <View style={globalStyles.inputGroup}>
                <Text style={globalStyles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="nombre@correo.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <AppButton label="Enviar enlace de recuperación" onPress={handleSend} loading={loading} />
              <AppButton label="Volver al inicio de sesión" onPress={onBack} variant="outline" style={{ marginTop: spacing.md }} />
            </>
          ) : (
            <View style={styles.successBox}>
              <IconCircle symbol="✓" bg={colors.successBg} fg={colors.success} size={64} />
              <Text style={styles.successTitle}>Enlace enviado</Text>
              <Text style={styles.instructions}>
                Revisa tu bandeja de entrada en {email}. Si no lo encuentras, revisa la carpeta de spam.
              </Text>
              <AppButton label="Volver al inicio de sesión" onPress={onBack} style={{ marginTop: spacing.lg }} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  iconWrap: { alignItems: 'center', marginVertical: spacing.xl },
  instructions: {
    fontSize: fonts.size.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fonts.lineHeight.relaxed,
    marginBottom: spacing.xl,
  },
  successBox: { alignItems: 'center', marginTop: spacing.xxl },
  successTitle: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
