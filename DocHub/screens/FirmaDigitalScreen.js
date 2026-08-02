import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, TextInput, Alert, StyleSheet, PanResponder } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import IconCircle from '../components/IconCircle';
import AppButton from '../components/AppButton';
import { firmarSolicitud, getDocumento, rechazarSolicitudFirma } from '../services/api';

const METODOS = [
  { key: 'trazar', label: 'Dibujar', icon: 'create-outline' },
  { key: 'archivo', label: 'Subir archivo', icon: 'image-outline' },
  { key: 'escribir', label: 'Escribir', icon: 'text-outline' },
];

export default function FirmaDigitalScreen({ route, navigation }) {
  const { documento, expedienteId, solicitud, onSigned } = route.params;
  const [metodo, setMetodo] = useState('trazar');
  const [points, setPoints] = useState([]);
  const [nombreEscrito, setNombreEscrito] = useState('');
  const [firmaArchivo, setFirmaArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const strokeRef = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => metodo === 'trazar',
        onMoveShouldSetPanResponder: () => metodo === 'trazar',
        onPanResponderGrant: (event) => {
          strokeRef.current += 1;
          addPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderMove: (event) => {
          addPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
      }),
    [metodo]
  );

  const puedeConfirmar =
    (metodo === 'trazar' && points.length > 5) ||
    (metodo === 'archivo' && firmaArchivo) ||
    (metodo === 'escribir' && nombreEscrito.trim().length > 2);

  function addPoint(x, y) {
    setPoints((prev) => [...prev, { x, y, stroke: strokeRef.current }].slice(-450));
  }

  const pickFirmaArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/png', 'image/jpeg', 'application/pdf'],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setFirmaArchivo({
        name: asset.name,
        size: asset.size || 0,
        uri: asset.uri,
        mimeType: asset.mimeType,
        file: asset.file,
      });
    } catch (err) {
      Alert.alert('No se pudo seleccionar firma', err.message || 'Intenta de nuevo.');
    }
  };


  const abrirDocumento = async () => {
    if (!solicitud?.documentoId) {
      Alert.alert('Documento no disponible', 'La solicitud no tiene un documento asociado.');
      return;
    }

    try {
      const documentoApi = await getDocumento(solicitud.documentoId);
      navigation.navigate('VisorDocumento', { documento: documentoApi });
    } catch (err) {
      Alert.alert('No se pudo abrir documento', err.message || 'Intenta de nuevo.');
    }
  };
  const handleFirmar = async () => {
    if (!solicitud?.id) {
      Alert.alert('Solicitud no disponible', 'Esta pantalla necesita una solicitud de firma creada en la API.');
      return;
    }

    setLoading(true);
    try {
      const payload =
        metodo === 'trazar'
          ? { firmaTipo: 'dibujo', firmaValor: JSON.stringify(points) }
          : metodo === 'archivo'
            ? { firmaTipo: 'archivo', firmaArchivo }
            : { firmaTipo: 'texto', firmaValor: nombreEscrito.trim() };

      await firmarSolicitud(solicitud.id, payload);
      if (onSigned) await onSigned();

      Alert.alert('Firma registrada', 'El documento fue firmado correctamente con sello de tiempo.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('No se pudo firmar', err.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = () => {
    if (!solicitud?.id) {
      navigation.goBack();
      return;
    }

    Alert.alert('Rechazar documento', 'Confirmas que deseas rechazar este documento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          try {
            await rechazarSolicitudFirma(solicitud.id, 'Rechazado desde Doc Hub');
            if (onSigned) await onSigned();
            navigation.goBack();
          } catch (err) {
            Alert.alert('No se pudo rechazar', err.message || 'Intenta de nuevo.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title="Firma digital" subtitle={documento.documento || documento.nombre} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <View style={styles.docCard}>
          <IconCircle symbol="SIG" bg={colors.dangerBg} fg={colors.danger} size={40} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={styles.docName}>{documento.documento || documento.nombre}</Text>
            <Text style={styles.docMeta}>Exp. #{expedienteId} - {documento.version || 'v1.0'}</Text>
          </View>
        </View>


        <AppButton
          label="Ver documento"
          variant="outline"
          onPress={abrirDocumento}
          disabled={!solicitud?.documentoId}
          style={{ marginTop: spacing.md }}
        />
        <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>Metodo de firma</Text>
        <View style={styles.metodoRow}>
          {METODOS.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.metodoBtn, metodo === item.key && styles.metodoBtnActive]}
              onPress={() => setMetodo(item.key)}
            >
              <Ionicons
                name={item.icon}
                size={24}
                color={metodo === item.key ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.metodoLabel, metodo === item.key && styles.metodoLabelActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {metodo === 'trazar' && (
          <View style={styles.traceBox} {...panResponder.panHandlers}>
            {points.length === 0 ? (
              <>
                <Ionicons name="create-outline" size={32} color={colors.textMuted} />
                <Text style={styles.traceText}>Dibuja tu firma aqui</Text>
                <Text style={styles.traceSubtext}>Usa mouse, dedo o lapiz tactil</Text>
              </>
            ) : (
              points.map((point, index) => (
                <View
                  key={`${point.stroke}_${index}`}
                  style={[styles.signaturePoint, { left: point.x, top: point.y }]}
                />
              ))
            )}
          </View>
        )}

        {metodo === 'archivo' && (
          <Pressable style={[styles.traceBox, firmaArchivo && styles.traceBoxDone]} onPress={pickFirmaArchivo}>
            <Ionicons
              name={firmaArchivo ? "checkmark-circle-outline" : "cloud-upload-outline"}
              size={32}
              color={firmaArchivo ? colors.success : colors.textMuted}
            />
            <Text style={styles.traceText}>{firmaArchivo ? firmaArchivo.name : 'Subir firma como archivo'}</Text>
            <Text style={styles.traceSubtext}>PNG, JPG o PDF</Text>
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

        {metodo === 'trazar' && points.length > 0 && (
          <AppButton label="Limpiar firma" variant="outline" onPress={() => setPoints([])} style={{ marginTop: spacing.md }} />
        )}

        <View style={styles.noticeBox}>
          <Text style={styles.noticeIcon}>OK</Text>
          <Text style={styles.noticeText}>
            La firma se registra en la API con usuario, metodo y sello de tiempo. Puedes dibujarla o subirla como archivo.
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
  metodoIcon: { fontSize: fonts.size.xs, marginBottom: 4, color: colors.textSecondary, fontWeight: fonts.weight.bold },
  metodoLabel: { fontSize: fonts.size.xs, color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  metodoLabelActive: { color: colors.primary },
  traceBox: {
    marginTop: spacing.lg,
    height: 200,
    borderRadius: spacing.radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  traceBoxDone: { borderStyle: 'solid', borderColor: colors.success, backgroundColor: colors.successBg },
  traceIcon: { fontSize: fonts.size.sm, color: colors.textMuted, marginBottom: 8, fontWeight: fonts.weight.bold },
  traceText: { fontSize: fonts.size.md, color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  traceSubtext: { fontSize: fonts.size.xs, color: colors.textMuted, marginTop: 4 },
  signaturePoint: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primaryDark,
  },
  signatureInput: { fontStyle: 'italic', fontSize: fonts.size.lg },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoBg,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  noticeIcon: { fontSize: fonts.size.xs, marginRight: spacing.sm, color: colors.info, fontWeight: fonts.weight.bold },
  noticeText: { flex: 1, fontSize: fonts.size.xs, color: colors.textSecondary, lineHeight: fonts.lineHeight.normal },
});

