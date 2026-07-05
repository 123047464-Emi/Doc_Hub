// screens/TrazabilidadScreen.js
// Pantalla 11: Trazabilidad. Historial de acciones (timeline) de un expediente.

import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from '../components/ScreenHeader';
import TimelineItem from '../components/TimelineItem';
import EmptyState from '../components/EmptyState';
import { TRAZABILIDAD } from '../data/mockData';

export default function TrazabilidadScreen({ route, navigation }) {
  const { expedienteId } = route.params;
  const historial = TRAZABILIDAD[expedienteId] || [];

  return (
    <SafeAreaView style={globalStyles.screen}>
      <ScreenHeader title="Trazabilidad" subtitle={`Exp. #${expedienteId}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={globalStyles.screenContent}>
        {historial.length === 0 ? (
          <EmptyState icon="🕓" title="Sin historial" message="Este expediente aún no tiene movimientos registrados." />
        ) : (
          <View style={styles.timelineWrap}>
            {historial.map((item, idx) => (
              <TimelineItem key={item.id} item={item} isLast={idx === historial.length - 1} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  timelineWrap: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
});
