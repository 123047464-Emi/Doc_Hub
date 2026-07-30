// components/DashboardBase.js

import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from './ScreenHeader';
import Card from './Card';
import IconCircle from './IconCircle';
import { RESUMEN_DASHBOARD, ACTIVIDAD_RECIENTE } from '../data/mockData';

export default function DashboardBase({ user, navigation, onLogout, quickActions = [] }) {
  return (
  <SafeAreaView style={globalStyles.screen}>
    <ScreenHeader
    title={`Hola, ${user.name.split(' ')[0]}`}
    subtitle={user.cargo}
    rightIcon={<Ionicons name="person-circle-outline" size={26} color="#ece9e9" />}
    onRightPress={() => navigation.navigate('Perfil')}
    />
    <ScrollView contentContainerStyle={globalStyles.screenContent}>
        {/* Resumen */}
        <Text style={globalStyles.sectionTitle}>Resumen</Text>
        <View style={styles.summaryRow}>
          <SummaryItem
            icon="folder-outline"
            value={RESUMEN_DASHBOARD.expedientesActivos}
            label="Expedientes activos"
            bg={colors.infoBg}
            fg={colors.info}
          />
          <SummaryItem
            icon="checkmark-done-outline"
            value={RESUMEN_DASHBOARD.docsFirmados}
            label="Docs. firmados"
            bg={colors.successBg}
            fg={colors.success}
          />
          <SummaryItem
            icon="alert-circle-outline"
            value={RESUMEN_DASHBOARD.pendientes}
            label="Pendientes"
            bg={colors.warningBg}
            fg={colors.warning}
          />
        </View>

        {/* Accesos rápidos por rol */}
        {quickActions.length > 0 && (
          <>
            <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>Accesos rápidos</Text>
            <View style={styles.quickRow}>
              {quickActions.map((action) => (
                <Card key={action.label} onPress={action.onPress} style={styles.quickCard}>
                  
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: action.bg, 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Ionicons name={action.icon} size={20} color="#010235" />
                  </View>

                  <Text style={styles.quickLabel}>{action.label}</Text>
                </Card>
              ))}
            </View>
          </>
        )}

        {/* Actividad reciente */}
        <Text style={[globalStyles.sectionTitle, { marginTop: spacing.lg }]}>Actividad reciente</Text>
        {ACTIVIDAD_RECIENTE.map((item) => (
          <Card key={item.id} style={styles.activityCard}>
            <View style={styles.activityDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>{item.texto}</Text>
              <Text style={styles.activityTime}>{item.hora}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ icon, value, label, bg, fg }) {
  return (
    <View style={styles.summaryItem}>
      <View style={{ 
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        backgroundColor: bg, 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Ionicons name={icon} size={18} color="#010235" />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: 4,
  },
  summaryValue: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontSize: fonts.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap' },
  quickCard: {
    width: '47%',
    marginRight: '3%',
    alignItems: 'flex-start',
  },
  quickLabel: {
    marginTop: spacing.sm,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semibold,
    color: colors.textPrimary,
  },
  activityCard: { flexDirection: 'row', alignItems: 'flex-start' },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  activityText: { fontSize: fonts.size.sm, color: colors.textPrimary },
  activityTime: { fontSize: fonts.size.xs, color: colors.textMuted, marginTop: 2 },
});