// components/ScreenHeader.js
// Encabezado azul reutilizable, con botón de regreso opcional y acción a la derecha.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import globalStyles from '../theme/globalStyles';

export default function ScreenHeader({ title, subtitle, onBack, rightIcon, onRightPress }) {
  return (
    <View style={globalStyles.header}>
      <View style={[globalStyles.headerRow, { justifyContent: 'space-between' }]}>
        <View style={globalStyles.headerRow}>
          {onBack ? (
            <Pressable style={globalStyles.headerBackBtn} onPress={onBack}>
              <Text style={globalStyles.headerBackText}>‹</Text>
            </Pressable>
          ) : null}
          <View>
            <Text style={globalStyles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={globalStyles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {rightIcon ? (
          <Pressable style={globalStyles.headerBackBtn} onPress={onRightPress}>
            <Text style={{ fontSize: 16 }}>{rightIcon}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
