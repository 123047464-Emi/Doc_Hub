// components/AppButton.js
// Botón reutilizable con variantes: primary, outline, danger.
// Implementado con Pressable + ActivityIndicator (sin librerías externas).

import React from 'react';
import { Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Pressable } from 'react-native';
import globalStyles from '../theme/globalStyles';
import colors from '../theme/colors';

export default function AppButton({
  label,
  onPress,
  variant = 'primary', // primary | outline | danger
  disabled = false,
  loading = false,
  icon = null,
  style,
}) {
  const variantStyle =
    variant === 'outline' ? globalStyles.buttonOutline :
    variant === 'danger' ? globalStyles.buttonDanger :
    globalStyles.buttonPrimary;

  const textStyle = variant === 'outline' ? globalStyles.buttonTextOutline : globalStyles.buttonTextPrimary;

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        globalStyles.button,
        variantStyle,
        disabled && globalStyles.buttonDisabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <>
          {icon}
          <Text style={[textStyle, icon && { marginLeft: 8 }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
});
