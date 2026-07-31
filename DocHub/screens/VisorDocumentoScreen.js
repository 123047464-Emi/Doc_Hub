// screens/VisorDocumentoScreen.js
// Pantalla 8: Visor de documentos. Solo vista previa simulada, sin opción de descarga.

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, ImageBackground, Pressable, Alert, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import StatusBadge from '../components/StatusBadge';

const PLACEHOLDER_IMG = { uri: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=60' };

export default function VisorDocumentoScreen({ route, navigation }) {
  const { documento } = route.params;
  const totalPaginas = documento.paginas || 1;
  const [pagina, setPagina] = useState(1);

  const blockDownload = () => {
    Alert.alert('Vista protegida', 'Este documento es de solo lectura. La descarga no está disponible.');
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader
        title={documento.nombre}
        subtitle={`${documento.version} · Página ${pagina} de ${totalPaginas}`}
        onBack={() => navigation.goBack()}
        rightIcon="⋮"
        onRightPress={blockDownload}
      />

      <ScrollView contentContainerStyle={styles.viewerContent}>
        <View style={styles.pageWrap}>
          <ImageBackground
            source={PLACEHOLDER_IMG}
            style={styles.page}
            imageStyle={{ borderRadius: spacing.radius.md, opacity: 0.15 }}
          >
            <View style={styles.watermark}>
              <Text style={styles.watermarkText}>SOLO LECTURA</Text>
            </View>
            <Text style={styles.pageBody}>
              {documento.nombre}{'\n\n'}
              Documento simulado para vista previa. Este contenido representa el cuerpo del
              archivo "{documento.nombre}" dentro del expediente. La descarga y la impresión
              están deshabilitadas por política de confidencialidad del proceso.
            </Text>
          </ImageBackground>
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text style={globalStyles.label}>Estado</Text>
            <StatusBadge status={documento.estado} style={{ marginTop: 4 }} />
          </View>
          <View>
            <Text style={globalStyles.label}>Tamaño</Text>
            <Text style={globalStyles.value}>{documento.tamano}</Text>
          </View>
          <View>
            <Text style={globalStyles.label}>Versión</Text>
            <Text style={globalStyles.value}>{documento.version}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.pagerBar}>
        <Pressable
          style={[styles.pagerBtn, pagina === 1 && styles.pagerBtnDisabled]}
          onPress={() => setPagina((p) => Math.max(1, p - 1))}
        >
          <Text style={styles.pagerBtnText}>‹ Anterior</Text>
        </Pressable>
        <Text style={styles.pagerCount}>{pagina} / {totalPaginas}</Text>
        <Pressable
          style={[styles.pagerBtn, pagina === totalPaginas && styles.pagerBtnDisabled]}
          onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
        >
          <Text style={styles.pagerBtnText}>Siguiente ›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  viewerContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  pageWrap: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  page: {
    minHeight: 380,
    borderRadius: spacing.radius.md,
    overflow: 'hidden',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  watermark: { alignSelf: 'center', marginBottom: spacing.lg, opacity: 0.5 },
  watermarkText: { fontSize: fonts.size.xxl, fontWeight: fonts.weight.bold, color: colors.textMuted, letterSpacing: 2 },
  pageBody: { fontSize: fonts.size.sm, color: colors.textSecondary, lineHeight: fonts.lineHeight.relaxed },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pagerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  pagerBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  pagerBtnDisabled: { opacity: 0.3 },
  pagerBtnText: { color: colors.primary, fontWeight: fonts.weight.bold },
  pagerCount: { color: colors.textSecondary, fontWeight: fonts.weight.semibold },
});
