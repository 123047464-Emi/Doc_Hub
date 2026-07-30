// screens/CargaDocumentoScreen.js
// Pantalla 7: Carga de documentos. Simula selección desde cámara, galería o
// explorador de archivos, con cola de subida y progreso (sin backend real).

import React, { useState, useRef } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, Modal, Switch, Alert, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import IconCircle from '../components/IconCircle';
import ProgressBar from '../components/ProgressBar';
import AppButton from '../components/AppButton';

const MOCK_FILES = [
  { name: 'declaracion_bienes.pdf', size: '3.2 MB' },
  { name: 'acta_nacimiento_escaneada.jpg', size: '1.8 MB' },
  { name: 'identificacion_oficial.jpg', size: '900 KB' },
];

let fileCounter = 0;

export default function CargaDocumentoScreen({ route, navigation }) {
  const expedienteId = route?.params?.expedienteId || 'DV-2024-0817';
  const [menuVisible, setMenuVisible] = useState(false);
  const [queue, setQueue] = useState([]);
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const intervalsRef = useRef({});

  const addFile = (source) => {
    setMenuVisible(false);
    const mock = MOCK_FILES[fileCounter % MOCK_FILES.length];
    fileCounter += 1;
    const id = `f_${Date.now()}_${fileCounter}`;
    const newFile = { id, name: mock.name, size: mock.size, progress: 0, status: 'Subiendo', source };
    setQueue((prev) => [...prev, newFile]);

    // Simulación de progreso de subida
    const interval = setInterval(() => {
      setQueue((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const next = Math.min(100, f.progress + Math.round(10 + Math.random() * 20));
          return {
            ...f,
            progress: next,
            status: next >= 100 ? 'Subido' : 'Subiendo',
          };
        })
      );
    }, 400);
    intervalsRef.current[id] = interval;

    setTimeout(() => {
      clearInterval(intervalsRef.current[id]);
    }, 3500);
  };

  const removeFile = (id) => {
    clearInterval(intervalsRef.current[id]);
    setQueue((prev) => prev.filter((f) => f.id !== id));
  };

  const finishUpload = () => {
    const pending = queue.filter((f) => f.status !== 'Subido');
    if (queue.length === 0) {
      Alert.alert('Sin archivos', 'Agrega al menos un archivo antes de continuar.');
      return;
    }
    if (pending.length > 0) {
      Alert.alert('Subida en curso', 'Espera a que todos los archivos terminen de subirse.');
      return;
    }
    Alert.alert('Documentos agregados', 'Los archivos se agregaron correctamente al expediente.', [
      { text: 'Aceptar', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title="Subir documento" subtitle={`Exp. #${expedienteId}`} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <Pressable style={styles.dropZone} onPress={() => setMenuVisible(true)}>
          <IconCircle symbol="⬆" bg={colors.primaryLight} fg={colors.primary} size={48} />
          <Text style={styles.dropTitle}>Agregar más archivos</Text>
          <Text style={styles.dropSubtitle}>Galería, cámara o explorador</Text>
          <View style={styles.tagsRow}>
            {['PDF', 'JPG', 'PNG', 'DOCX', 'Escaneo'].map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Añadir archivo</Text>
          </View>
        </Pressable>

        <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>
          Archivos en cola ({queue.length})
        </Text>

        {queue.length === 0 && (
          <Text style={styles.emptyQueue}>Aún no has agregado archivos.</Text>
        )}

        {queue.map((file) => (
          <Card key={file.id}>
            <View style={globalStyles.cardRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <IconCircle
                  symbol={file.name.endsWith('.jpg') ? '🖼' : '📄'}
                  bg={colors.infoBg}
                  fg={colors.info}
                  size={36}
                />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileMeta}>
                    {file.size} · {file.status === 'Subido' ? 'Subido' : `Subiendo... ${file.progress}%`}
                  </Text>
                </View>
              </View>
              {file.status === 'Subido' ? (
                <Text style={styles.checkIcon}>✓</Text>
              ) : (
                <Pressable onPress={() => removeFile(file.id)}>
                  <Text style={styles.removeIcon}>✕</Text>
                </Pressable>
              )}
            </View>
            {file.status !== 'Subido' && (
              <View style={{ marginTop: spacing.sm }}>
                <ProgressBar progress={file.progress / 100} />
              </View>
            )}
          </Card>
        ))}

        <Card style={styles.ocrCard}>
          <IconCircle symbol="⌗" bg={colors.purpleBg} fg={colors.purple} size={36} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.ocrTitle}>Procesar con OCR automático</Text>
            <Text style={styles.ocrSubtitle}>Extrae texto de imágenes y manuscritos</Text>
          </View>
          <Switch
            value={ocrEnabled}
            onValueChange={setOcrEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={ocrEnabled ? colors.primary : colors.textMuted}
          />
        </Card>

        <AppButton label="Guardar en el expediente" onPress={finishUpload} style={{ marginTop: spacing.lg }} />
      </ScrollView>

      {/* Modal - menú de origen del archivo (cámara / galería / explorador) */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Agregar documento</Text>
            <SourceOption icon="🖼" color={colors.success} label="Desde galería" onPress={() => addFile('galeria')} />
            <SourceOption icon="📷" color={colors.info} label="Tomar foto / escanear" onPress={() => addFile('camara')} />
            <SourceOption icon="📂" color={colors.purple} label="Desde archivos" onPress={() => addFile('archivos')} />
            <Pressable style={styles.modalCancel} onPress={() => setMenuVisible(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function SourceOption({ icon, color, label, onPress }) {
  return (
    <Pressable style={styles.sourceOption} onPress={onPress}>
      <IconCircle symbol={icon} bg={`${color}22`} fg={color} size={38} />
      <Text style={styles.sourceLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dropZone: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: spacing.radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  dropTitle: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.textPrimary, marginTop: spacing.sm },
  dropSubtitle: { fontSize: fonts.size.sm, color: colors.textSecondary, marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.md },
  tag: { backgroundColor: colors.primaryLight, borderRadius: spacing.radius.full, paddingHorizontal: 10, paddingVertical: 4, margin: 3 },
  tagText: { fontSize: fonts.size.xs, color: colors.primary, fontWeight: fonts.weight.semibold },
  addBtn: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: spacing.radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  addBtnText: { color: colors.textSecondary, fontWeight: fonts.weight.semibold },
  emptyQueue: { color: colors.textMuted, fontSize: fonts.size.sm, marginBottom: spacing.sm },
  fileName: { fontSize: fonts.size.md, fontWeight: fonts.weight.semibold, color: colors.textPrimary },
  fileMeta: { fontSize: fonts.size.xs, color: colors.textMuted, marginTop: 2 },
  checkIcon: { color: colors.success, fontSize: 18, fontWeight: '700' },
  removeIcon: { color: colors.danger, fontSize: 16, fontWeight: '700' },
  ocrCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.purpleBg, borderColor: colors.purpleBg, marginTop: spacing.lg },
  ocrTitle: { fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.textPrimary },
  ocrSubtitle: { fontSize: fonts.size.xs, color: colors.textSecondary, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: spacing.radius.xl, borderTopRightRadius: spacing.radius.xl, padding: spacing.xl },
  modalTitle: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  sourceOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  sourceLabel: { marginLeft: spacing.md, fontSize: fonts.size.md, fontWeight: fonts.weight.semibold, color: colors.textPrimary },
  modalCancel: { marginTop: spacing.sm, alignItems: 'center', paddingVertical: spacing.md },
  modalCancelText: { color: colors.danger, fontWeight: fonts.weight.bold },
});
