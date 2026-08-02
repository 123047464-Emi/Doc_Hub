// components/BottomTabBar.js
// Barra de navegación inferior simulada (sin librerías de navegación externas).
// Los tabs visibles varían según el rol (ej. Testigo no tiene tab de Documentos).

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import fonts from '../theme/fonts';

const ALL_TABS = [
  { key: 'inicio', label: 'Inicio', icon: '⌂' },
  { key: 'documentos', label: 'Docs', icon: '▤' },
  { key: 'firma', label: 'Firma', icon: '✎' },
  { key: 'avisos', label: 'Avisos', icon: '◔' },
];

export default function BottomTabBar({ activeTab, onChangeTab, badges = {}, visibleTabs = null }) {
  const tabs = visibleTabs ? ALL_TABS.filter((t) => visibleTabs.includes(t.key)) : ALL_TABS;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const badgeCount = badges[tab.key];
        return (
          <Pressable key={tab.key} style={styles.tabItem} onPress={() => onChangeTab(tab.key)}>
            <View>
              <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
              {badgeCount ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 18,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  iconActive: {
    color: colors.primary,
  },
  label: {
    fontSize: fonts.size.xs,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: fonts.weight.medium,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: fonts.weight.bold,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 999,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
});
