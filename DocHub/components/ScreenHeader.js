import React from 'react';
import { View, Text, Pressable } from 'react-native';
import globalStyles from '../theme/globalStyles';

const ICON_LABELS = {
  Perfil: '👤',
  Abrir: '↗',
  Editar: '✎',
  Cancelar: '×',
};

export default function ScreenHeader({ title, subtitle, onBack, rightIcon, onRightPress }) {
  const icon = ICON_LABELS[rightIcon] || rightIcon;

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
          <Pressable style={globalStyles.headerBackBtn} onPress={onRightPress} accessibilityLabel={String(rightIcon)}>
            <Text style={{ fontSize: 18 }}>{icon}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
