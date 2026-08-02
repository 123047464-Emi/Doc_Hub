import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Linking, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import StatusBadge from '../components/StatusBadge';
import Card from '../components/Card';
import AppButton from '../components/AppButton';
import {
  getDocumentoOpenUrl,
  listDocumentoVersiones,
  restaurarDocumentoVersion,
  updateDocumento,
} from '../services/api';

export default function VisorDocumentoScreen({ route, navigation, user }) {
  const [documento, setDocumento] = useState(route.params.documento);
  const [nombre, setNombre] = useState(route.params.documento.nombre);
  const [archivo, setArchivo] = useState(null);
  const [versiones, setVersiones] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [saving, setSaving] = useState(false);
  const puedeRestaurar = Boolean(user?.actions?.includes('documentos.restaurar_version'));
  const puedeEditar = Boolean(user?.actions?.includes('documentos.editar'));

  const loadVersiones = useCallback(async () => {
    if (!documento?.id) return;
    setLoadingVersions(true);
    try {
      const data = await listDocumentoVersiones(documento.id);
      setVersiones(data);
    } catch (err) {
      Alert.alert('No se pudieron cargar versiones', err.message || 'Intenta de nuevo.');
    } finally {
      setLoadingVersions(false);
    }
  }, [documento?.id]);

  useEffect(() => {
    loadVersiones();
  }, [loadVersiones]);

  const openDocumento = async () => {
    const url = getDocumentoOpenUrl(documento);

    if (!url) {
      Alert.alert('Documento no disponible', 'No hay una URL valida para abrir este archivo.');
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('No se puede abrir', 'Tu dispositivo no tiene una aplicacion compatible para este archivo.');
      return;
    }

    await Linking.openURL(url);
  };

  const pickArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });

      if (result.canceled) return;
      const selected = result.assets?.[0];
      if (selected) setArchivo(selected);
    } catch (err) {
      Alert.alert('No se pudo seleccionar', err.message || 'Intenta de nuevo.');
    }
  };

  const saveNombre = async () => {
    if (!nombre.trim()) {
      Alert.alert('Nombre requerido', 'El documento necesita un nombre.');
      return;
    }

    setSaving(true);
    try {
      const actualizado = await updateDocumento(documento.id, {
        nombre: nombre.trim(),
        archivo,
      });
      setDocumento(actualizado);
      setNombre(actualizado.nombre);
      setArchivo(null);
      await loadVersiones();
      Alert.alert(
        'Documento actualizado',
        archivo ? 'Se guardo una nueva version del archivo.' : 'Los cambios se guardaron correctamente.'
      );
    } catch (err) {
      Alert.alert('No se pudo guardar', err.message || 'Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const restoreVersion = (version) => {
    Alert.alert('Restaurar version', `Quieres restaurar ${version.version}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Restaurar',
        onPress: async () => {
          setSaving(true);
          try {
            const actualizado = await restaurarDocumentoVersion(
              documento.id,
              version.id,
              `Restaurada desde Doc Hub a partir de ${version.version}`
            );
            setDocumento(actualizado);
            setNombre(actualizado.nombre);
            await loadVersiones();
            Alert.alert('Version restaurada', 'Se creo una nueva version activa del documento.');
          } catch (err) {
            Alert.alert('No se pudo restaurar', err.message || 'Intenta de nuevo.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const openTrazabilidad = () => {
    navigation.navigate('Trazabilidad', {
      documentoId: documento.id,
      documentoNombre: documento.nombre,
    });
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title={documento.nombre}
        subtitle={`${documento.version} - ${documento.tamanoTexto}`}
        onBack={() => navigation.goBack()}
        rightIcon="open-outline"
        onRightPress={openDocumento}
      />

      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        <Card>
          <Text style={globalStyles.sectionTitle}>Archivo</Text>
          <InfoRow label="Nombre original" value={documento.nombreArchivo || documento.nombre} />
          <InfoRow label="Tipo" value={(documento.extension || '').toUpperCase()} />
          <InfoRow label="Tamano" value={documento.tamanoTexto} />
          <InfoRow label="Version" value={documento.version} />
          <InfoRow label="Expediente" value={documento.expedienteId || 'GENERAL'} />
          <View style={{ marginTop: spacing.md }}>
            <Text style={globalStyles.label}>Estado</Text>
            <StatusBadge status={documento.estado} style={{ marginTop: 4 }} />
          </View>
        </Card>

        {puedeEditar && (
        <Card>
          <Text style={globalStyles.sectionTitle}>Editar datos</Text>
          <View style={globalStyles.inputGroup}>
            <Text style={globalStyles.inputLabel}>Nombre visible</Text>
            <TextInput
              style={globalStyles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre del documento"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.filePickerRow}>
            <View style={{ flex: 1 }}>
              <Text style={globalStyles.inputLabel}>Nueva version</Text>
              <Text style={styles.selectedFile} numberOfLines={1}>
                {archivo ? archivo.name : 'Sin archivo seleccionado'}
              </Text>
            </View>
            <AppButton label="Archivo" variant="outline" onPress={pickArchivo} style={styles.inlineButton} />
          </View>
          <AppButton label="Guardar cambios" onPress={saveNombre} loading={saving} />
        </Card>
        )}

        <Card>
          <View style={globalStyles.cardRow}>
            <Text style={globalStyles.sectionTitle}>Versiones</Text>
            <AppButton
              label="Actualizar"
              variant="outline"
              onPress={loadVersiones}
              loading={loadingVersions}
              style={styles.inlineButton}
            />
          </View>
          {versiones.length === 0 ? (
            <Text style={styles.emptyText}>Este documento aun no tiene versiones registradas.</Text>
          ) : (
            versiones.map((version) => (
              <View key={version.id} style={styles.versionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.versionTitle}>{version.version}</Text>
                  <Text style={styles.versionMeta}>{version.nombreArchivo || version.nombre}</Text>
                  <Text style={styles.versionDate}>{version.fecha}</Text>
                </View>
                {puedeRestaurar && (
                <AppButton
                  label="Restaurar"
                  variant="outline"
                  onPress={() => restoreVersion(version)}
                  disabled={saving}
                  style={styles.restoreButton}
                />
                )}
              </View>
            ))
          )}
        </Card>

        <AppButton label="Abrir archivo" variant="outline" onPress={openDocumento} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={globalStyles.label}>{label}</Text>
      <Text style={globalStyles.value}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  filePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  selectedFile: {
    color: colors.textSecondary,
    fontSize: fonts.size.sm,
    marginTop: 4,
  },
  inlineButton: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fonts.size.sm,
    marginTop: spacing.sm,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  versionTitle: {
    color: colors.textPrimary,
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
  },
  versionMeta: {
    color: colors.textSecondary,
    fontSize: fonts.size.sm,
    marginTop: 2,
  },
  versionDate: {
    color: colors.textMuted,
    fontSize: fonts.size.xs,
    marginTop: 2,
  },
  restoreButton: {
    minHeight: 34,
    paddingHorizontal: spacing.sm,
  },
});



