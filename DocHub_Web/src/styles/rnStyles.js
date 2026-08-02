// src/styles/rnStyles.js
// Estilos usando StyleSheet de React Native (React Native for Web)
import { StyleSheet } from 'react-native';

export const rnColors = {
  primary: '#1E4B8F',
  primaryDark: '#0F2A4A',
  primaryDarker: '#0A1E38',
  primaryLight: '#EAF1FB',
  accent: '#2F6FED',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F4F6F9',
  surface: '#FFFFFF',
  border: '#E3E8EF',
  divider: '#EDF1F5',
  textPrimary: '#152238',
  textSecondary: '#5B6B82',
  textMuted: '#94A3B8',
  success: '#1FA971',
  successBg: '#E1F7EE',
  warning: '#D98A11',
  warningBg: '#FCF0DA',
  danger: '#E5484D',
  dangerBg: '#FBE4E4',
  purple: '#7C5CFC',
  purpleBg: '#EFEAFE',
};

export const rnStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: rnColors.background,
  },
  card: {
    backgroundColor: rnColors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: rnColors.border,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: rnColors.textPrimary,
    fontFamily: 'Outfit, Inter, sans-serif',
  },
  subtitle: {
    fontSize: 14,
    color: rnColors.textSecondary,
    marginTop: 4,
    fontFamily: 'Inter, sans-serif',
  },
  button: {
    backgroundColor: rnColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: rnColors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});
