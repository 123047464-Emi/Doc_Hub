import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import IconCircle from '../components/IconCircle';
import ProgressBar from '../components/ProgressBar';
import AppButton from '../components/AppButton';
import { updateDocumento, uploadDocumento } from '../services/api';

export default function CargaDocumentoScreen({ route, navigation }) {
  const expedienteId = route?.params?.expedienteId || 'GENERAL';
  const documento = route?.params?.documento || null;
  const onUploaded = route?.params?.onUploaded;
  const [queue, setQueue] = useState([]);
  const [saving, setSaving] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        multiple: !documento,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const files = result.assets.map((asset) => ({
        id: `${asset.name}_${Date.now()}_${Math.random()}`,
        name: asset.name,
        size: asset.size || 0,
        uri: asset.uri,
        mimeType: asset.mimeType,
        file: asset.file,
        status: 'Listo',
        progress: 0,
      }));

      setQueue((prev) => (documento ? files.slice(0, 1) : [...prev, ...files]));
    } catch (err) {
      Alert.alert('No se pudo seleccionar archivo', err.message || 'Intenta de nuevo.');
    }
  };

  const removeFile = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const finishUpload = async () => {
    if (queue.length === 0) {
      Alert.alert('Sin archivos', 'Agrega al menos un archivo antes de continuar.');
      return;
    }

    setSaving(true);
    try {
      for (const file of queue) {
        setQueue((prev) => prev.map((item) => (item.id === file.id ? { ...item, status: 'Subiendo', progress: 50 } : item)));
        if (documento?.id) {
          await updateDocumento(documento.id, {
            expedienteId,
            nombre: file.name,
            archivo: file,
          });
        } else {
          await uploadDocumento({
            expedienteId,
            nombre: file.name,
            archivo: file,
          });
        }
        setQueue((prev) => prev.map((item) => (item.id === file.id ? { ...item, status: 'Subido', progress: 100 } : item)));
      }

      if (onUploaded) await onUploaded();

      Alert.alert(documento ? 'Correccion enviada' : 'Documentos agregados', documento ? 'El archivo corregido quedo pendiente para revision del juez.' : 'Los archivos se guardaron correctamente en la API.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('No se pudo subir', err.message || 'Revisa la conexion con la API.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title={documento ? 'Subir correccion' : 'Subir documento'} subtitle={`Exp. #${expedienteId}`} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <Pressable style={styles.dropZone} onPress={pickFile}>
          <IconCircle symbol="+" bg={colors.primaryLight} fg={colors.primary} size={48} />
          <Text style={styles.dropTitle}>Agregar documentos</Text>
          <Text style={styles.dropSubtitle}>Selecciona archivos PDF, DOC o DOCX</Text>
          <View style={styles.tagsRow}>
            {['PDF', 'DOC', 'DOCX'].map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.addBtn}>
            <Text style={styles.addBtnText}>Seleccionar archivo</Text>
          </View>
        </Pressable>

        <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>
          Archivos en cola ({queue.length})
        </Text>

        {queue.length === 0 && <Text style={styles.emptyQueue}>Aun no has agregado archivos.</Text>}

        {queue.map((file) => (
          <Card key={file.id}>
            <View style={globalStyles.cardRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <IconCircle
                  symbol={file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                  bg={colors.infoBg}
                  fg={colors.info}
                  size={36}
                />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileMeta}>{formatBytes(file.size)} - {file.status}</Text>
                </View>
              </View>
              {file.status === 'Subido' ? (
                <Text style={styles.checkIcon}>OK</Text>
              ) : (
                <Pressable onPress={() => removeFile(file.id)} disabled={saving}>
                  <Text style={styles.removeIcon}>Quitar</Text>
                </Pressable>
              )}
            </View>
            {file.status === 'Subiendo' && (
              <View style={{ marginTop: spacing.sm }}>
                <ProgressBar progress={file.progress / 100} />
              </View>
            )}
          </Card>
        ))}

        <AppButton
          label={documento ? 'Enviar correccion' : 'Guardar en el expediente'}
          onPress={finishUpload}
          loading={saving}
          disabled={queue.length === 0}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
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
  checkIcon: { color: colors.success, fontSize: fonts.size.xs, fontWeight: '700' },
  removeIcon: { color: colors.danger, fontSize: fonts.size.xs, fontWeight: '700' },
});





