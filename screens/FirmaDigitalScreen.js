// screens/FirmaDigitalScreen.js
// Pantalla 10: Firma digital. Flujo de aprobación simulado (firmar / rechazar).

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, TextInput, Alert, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import IconCircle from '../components/IconCircle';
import AppButton from '../components/AppButton';

const METODOS = [
  { key: 'trazar', label: 'Trazar firma', icon: '✎' },
  { key: 'escribir', label: 'Escribir', icon: '⌨' },
  { key: 'biometrica', label: 'Biométrica', icon: '☝' },
];

export default function FirmaDigitalScreen({ route, navigation }) {
  const { documento, expedienteId } = route.params;
  const [metodo, setMetodo] = useState('trazar');
  const [trazoHecho, setTrazoHecho] = useState(false);
  const [nombreEscrito, setNombreEscrito] = useState('');
  const [biometriaOk, setBiometriaOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const puedeConfirmar =
    (metodo === 'trazar' && trazoHecho) ||
    (metodo === 'escribir' && nombreEscrito.trim().length > 2) ||
    (metodo === 'biometrica' && biometriaOk);

  const handleFirmar = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Firma registrada', 'El documento fue firmado correctamente con sello de tiempo.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    }, 1000);
  };

  const handleRechazar = () => {
    Alert.alert(
      'Rechazar documento',
      '¿Confirmas que deseas rechazar este documento? Se notificará al solicitante.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Rechazar', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title="Firma digital" subtitle={documento.documento || documento.nombre} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <View style={styles.docCard}>
          <IconCircle symbol="📄" bg={colors.dangerBg} fg={colors.danger} size={40} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={styles.docName}>{documento.documento || documento.nombre}</Text>
            <Text style={styles.docMeta}>
              Exp. #{expedienteId} · {documento.version} · {documento.tamano} · {documento.paginas} páginas
            </Text>
          </View>
        </View>

        <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>Método de firma</Text>
        <View style={styles.metodoRow}>
          {METODOS.map((m) => (
            <Pressable
              key={m.key}
              style={[styles.metodoBtn, metodo === m.key && styles.metodoBtnActive]}
              onPress={() => setMetodo(m.key)}
            >
              <Text style={styles.metodoIcon}>{m.icon}</Text>
              <Text style={[styles.metodoLabel, metodo === m.key && styles.metodoLabelActive]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        {metodo === 'trazar' && (
          <Pressable
            style={[styles.traceBox, trazoHecho && styles.traceBoxDone]}
            onPress={() => setTrazoHecho(true)}
          >
            {trazoHecho ? (
              <Text style={styles.traceSignature}>✓ Firma trazada</Text>
            ) : (
              <>
                <Text style={styles.traceIcon}>✎</Text>
                <Text style={styles.traceText}>Trace su firma aquí</Text>
                <Text style={styles.traceSubtext}>Use su dedo o lápiz táctil</Text>
              </>
            )}
          </Pressable>
        )}

        {metodo === 'escribir' && (
          <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.inputLabel}>Escribe tu nombre completo</Text>
            <TextInput
              style={[globalStyles.input, styles.signatureInput]}
              placeholder="Nombre y apellidos"
              placeholderTextColor={colors.textMuted}
              value={nombreEscrito}
              onChangeText={setNombreEscrito}
            />
          </View>
        )}

        {metodo === 'biometrica' && (
          <Pressable
            style={[styles.traceBox, biometriaOk && styles.traceBoxDone]}
            onPress={() => setBiometriaOk(true)}
          >
            <Text style={styles.traceIcon}>{biometriaOk ? '✓' : '☝'}</Text>
            <Text style={styles.traceText}>{biometriaOk ? 'Identidad verificada' : 'Toque para verificar identidad'}</Text>
            {!biometriaOk && <Text style={styles.traceSubtext}>Simulación de autenticación biométrica</Text>}
          </Pressable>
        )}

        <View style={styles.noticeBox}>
          <Text style={styles.noticeIcon}>🛡</Text>
          <Text style={styles.noticeText}>
            La firma se registrará con sello de tiempo, IP y geolocalización según normativa vigente.
          </Text>
        </View>

        <AppButton
          label="Confirmar firma"
          onPress={handleFirmar}
          disabled={!puedeConfirmar}
          loading={loading}
          style={{ marginTop: spacing.lg }}
        />
        <AppButton label="Rechazar documento" onPress={handleRechazar} variant="outline" style={{ marginTop: spacing.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  docName: { fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.textPrimary },
  docMeta: { fontSize: fonts.size.xs, color: colors.textMuted, marginTop: 2 },
  metodoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metodoBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: 4,
    borderRadius: spacing.radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  metodoBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  metodoIcon: { fontSize: 20, marginBottom: 4 },
  metodoLabel: { fontSize: fonts.size.xs, color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  metodoLabelActive: { color: colors.primary },
  traceBox: {
    marginTop: spacing.lg,
    height: 180,
    borderRadius: spacing.radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  traceBoxDone: { borderStyle: 'solid', borderColor: colors.success, backgroundColor: colors.successBg },
  traceIcon: { fontSize: 28, color: colors.textMuted, marginBottom: 8 },
  traceText: { fontSize: fonts.size.md, color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  traceSubtext: { fontSize: fonts.size.xs, color: colors.textMuted, marginTop: 4 },
  traceSignature: { fontSize: fonts.size.xl, color: colors.success, fontWeight: fonts.weight.bold, fontStyle: 'italic' },
  signatureInput: { fontStyle: 'italic', fontSize: fonts.size.lg },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoBg,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  noticeIcon: { fontSize: 16, marginRight: spacing.sm },
  noticeText: { flex: 1, fontSize: fonts.size.xs, color: colors.textSecondary, lineHeight: fonts.lineHeight.normal },
});
