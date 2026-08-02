import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import globalStyles from '../theme/globalStyles';

const ICON_LABELS = {
  Perfil: 'person-outline',
  Abrir: 'open-outline',
  Editar: 'create-outline',
  Cancelar: 'close-outline',
};

export default function ScreenHeader({ title, subtitle, onBack, rightIcon, onRightPress }) {
  const icon = ICON_LABELS[rightIcon] || rightIcon;

  return (
    <View style={globalStyles.header}>
      <View style={[globalStyles.headerRow, { justifyContent: 'space-between' }]}>
        <View style={globalStyles.headerRow}>
          {onBack ? (
            <Pressable style={globalStyles.headerBackBtn} onPress={onBack}>
              <Ionicons
                name="chevron-back-outline"
                size={24}
                color="#f6f1f1"
              />
            </Pressable>
          ) : null}

          <View>
            <Text style={globalStyles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={globalStyles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        {rightIcon ? (
          <Pressable 
            style={globalStyles.headerBackBtn} 
            onPress={onRightPress} 
            accessibilityLabel={String(rightIcon)}
          >
            <Ionicons
              name={icon}
              size={22}
              color="#f6f1f1"
            />
          </Pressable>
        ) : null}

      </View>
    </View>
  );
}