import React, { useCallback, useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import colors from '../theme/colors';
import fonts from '../theme/fonts';
import spacing from '../theme/spacing';
import globalStyles from '../theme/globalStyles';
import ScreenHeader from './ScreenHeader';
import Card from './Card';
import EmptyState from './EmptyState';
import { getDashboard } from '../services/api';

const EMPTY_RESUMEN = { 
  expedientesActivos: 0, 
  docsFirmados: 0, 
  pendientes: 0 
};

export default function DashboardBase({ user, navigation, quickActions = [] }) {
  const [resumen, setResumen] = useState(EMPTY_RESUMEN);
  const [actividad, setActividad] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getDashboard();
      setResumen(data.resumen || EMPTY_RESUMEN);
      setActividad(data.actividad || []);

    } catch (err) {
      Alert.alert(
        'No se pudo cargar resumen',
        err.message || 'Revisa la conexión con la API.'
      );

    } finally {
      setLoading(false);
    }

  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  return (
    <SafeAreaView style={globalStyles.screen}>

      <ScreenHeader
        title={`Hola, ${firstName(user.name || user.username)}`}
        subtitle={user.cargo}
        rightIcon="Perfil"
        onRightPress={() => navigation.navigate('Perfil')}
      />


      <ScrollView
        contentContainerStyle={globalStyles.screenContent}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={loadDashboard} 
          />
        }
      >

        <Text style={globalStyles.sectionTitle}>
          Resumen
        </Text>


        <View style={styles.summaryRow}>

          <SummaryItem
            icon="folder-outline"
            value={resumen.expedientesActivos}
            label="Expedientes activos"
            bg={colors.infoBg}
            fg={colors.info}
          />


          <SummaryItem
            icon="document-text-outline"
            value={resumen.docsFirmados}
            label="Docs. autorizados"
            bg={colors.successBg}
            fg={colors.success}
          />


          <SummaryItem
            icon="time-outline"
            value={resumen.pendientes}
            label="Pendientes"
            bg={colors.warningBg}
            fg={colors.warning}
          />

        </View>



        {quickActions.length > 0 && (
          <>

            <Text 
              style={[
                globalStyles.sectionTitle, 
                { marginTop: spacing.lg }
              ]}
            >
              Accesos rápidos
            </Text>


            <View style={styles.quickRow}>

              {quickActions.map((action) => (

                <Card 
                  key={action.label} 
                  onPress={action.onPress} 
                  style={styles.quickCard}
                >

                  <Ionicons
                    name={action.symbol}
                    size={30}
                    color={action.fg}
                  />
                  <Text style={styles.quickLabel}>
                    {action.label}
                  </Text>

                </Card>

              ))}

            </View>

          </>
        )}




        <Text 
          style={[
            globalStyles.sectionTitle, 
            { marginTop: spacing.lg }
          ]}
        >
          Actividad reciente
        </Text>



        {actividad.length === 0 ? (

          <EmptyState
            icon="list-outline"
            title={loading ? 'Cargando actividad' : 'Sin actividad'}
          />


        ) : (

          actividad.map((item) => (

            <Card 
              key={item.id} 
              style={styles.activityCard}
            >

              <View style={styles.activityDot} />


              <View style={{ flex: 1 }}>

                <Text style={styles.activityText}>
                  {formatAction(item)}
                </Text>


                <Text style={styles.activityTime}>
                  {item.fecha}
                </Text>

              </View>


            </Card>

          ))

        )}


      </ScrollView>

    </SafeAreaView>
  );
}



function firstName(name = '') {

  return String(name)
    .trim()
    .split(' ')[0] || 'Usuario';

}



function formatAction(item) {

  const action = String(item.accion || 'accion')
    .replace(/_/g, ' ');

  const actor = item.usuarioNombre || 'Sistema';

  const target = item.documentoId 
    ? ` documento #${item.documentoId}` 
    : item.expedienteId 
      ? ` expediente ${item.expedienteId}` 
      : '';

  return `${actor}: ${action}${target}`;

}



function SummaryItem({ icon, value, label, bg, fg }) {

  return (

    <View style={styles.summaryItem}>

      <View 
        style={[
          styles.iconCircle,
          { backgroundColor: bg }
        ]}
      >

        <Ionicons
          name={icon}
          size={22}
          color={fg}
        />

      </View>


      <Text style={styles.summaryValue}>
        {value}
      </Text>


      <Text style={styles.summaryLabel}>
        {label}
      </Text>


    </View>

  );

}



const styles = StyleSheet.create({

  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },


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


  iconCircle:{
    width:36,
    height:36,
    borderRadius:18,
    justifyContent:'center',
    alignItems:'center'
  },


  summaryValue: { 
    fontSize: fonts.size.xl, 
    fontWeight: fonts.weight.bold, 
    color: colors.textPrimary, 
    marginTop: spacing.xs 
  },


  summaryLabel: { 
    fontSize: fonts.size.xs, 
    color: colors.textMuted, 
    textAlign: 'center', 
    marginTop: 2, 
    paddingHorizontal: 4 
  },


  quickRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },


  quickCard: { 
    width: '47%', 
    marginRight: '3%', 
    alignItems: 'flex-start' 
  },


  quickLabel: { 
    marginTop: spacing.sm, 
    fontSize: fonts.size.sm, 
    fontWeight: fonts.weight.semibold, 
    color: colors.textPrimary 
  },


  activityCard: { 
    flexDirection: 'row', 
    alignItems: 'flex-start' 
  },


  activityDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: colors.accent, 
    marginTop: 6, 
    marginRight: spacing.sm 
  },


  activityText: { 
    fontSize: fonts.size.sm, 
    color: colors.textPrimary 
  },


  activityTime: { 
    fontSize: fonts.size.xs, 
    color: colors.textMuted, 
    marginTop: 2 
  },

});