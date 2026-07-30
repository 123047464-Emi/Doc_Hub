// screens/NotificacionesScreen.js
// Pantalla 12: Notificaciones, separadas por "Hoy" y "Ayer".

import React, { useState } from 'react';
import { SafeAreaView, SectionList, View, Text, Pressable, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import IconCircle from '../components/IconCircle';
import EmptyState from '../components/EmptyState';
import { NOTIFICACIONES } from '../data/mockData';
import { Ionicons } from "@expo/vector-icons";

const TIPO_ICON = {
  firma: { icon: 'create-outline', bg: colors.purpleBg, fg: colors.purple },
  documento: { icon: 'document-text-outline', bg: colors.infoBg, fg: colors.info },
  recordatorio: { icon: 'time-outline', bg: colors.warningBg, fg: colors.warning },
  comentario: { icon: 'chatbubble-outline', bg: colors.successBg, fg: colors.success },
};

function buildSections(items) {
  const groups = {};
  items.forEach((n) => {
    if (!groups[n.grupo]) groups[n.grupo] = [];
    groups[n.grupo].push(n);
  });
  return Object.keys(groups).map((title) => ({ title, data: groups[title] }));
}

export default function NotificacionesScreen({ navigation }) {
  const [items, setItems] = useState(NOTIFICACIONES);

  const markAsRead = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, leido: true } : n)));
  };

  const sections = buildSections(items);

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title="Notificaciones" subtitle={`${items.filter((n) => !n.leido).length} sin leer`} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={globalStyles.screenContent}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="Sin notificaciones" />}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => {
          const iconInfo = TIPO_ICON[item.tipo] || TIPO_ICON.documento;
          return (
            <Pressable style={[styles.notifCard, !item.leido && styles.notifCardUnread]} onPress={() => markAsRead(item.id)}>
              <View style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: iconInfo.bg,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ionicons name={iconInfo.icon} size={20} color="#010235" />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={globalStyles.cardRow}>
                  <Text style={styles.notifTitle}>{item.titulo}</Text>
                  <Text style={styles.notifHora}>{item.hora}</Text>
                </View>
                <Text style={styles.notifMensaje}>{item.mensaje}</Text>
              </View>
              {!item.leido && <View style={styles.unreadDot} />}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  notifCardUnread: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  notifTitle: { fontSize: fonts.size.sm, fontWeight: fonts.weight.bold, color: colors.textPrimary, flex: 1 },
  notifHora: { fontSize: fonts.size.xs, color: colors.textMuted },
  notifMensaje: { fontSize: fonts.size.sm, color: colors.textSecondary, marginTop: 4, lineHeight: fonts.lineHeight.normal },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginLeft: spacing.sm, marginTop: 4 },
});
