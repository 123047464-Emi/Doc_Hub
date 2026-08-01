// theme/globalStyles.js
// Estilos globales reutilizados en toda la app para mantener consistencia visual

import { StyleSheet } from 'react-native';
import colors from './colors';
import fonts from './fonts';
import spacing from './spacing';

export default StyleSheet.create({
  // Contenedores
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header de pantalla (barra superior azul)
  header: {
    backgroundColor: colors.primaryDark,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackBtn: {
    width: 34,
    height: 34,
    borderRadius: spacing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: spacing.sm,
  },
  headerBackText: {
    color: colors.white,
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
  },
  headerTitle: {
    color: colors.white,
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: fonts.size.sm,
    marginTop: 2,
  },

  // Tarjetas
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Textos
  title: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fonts.size.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fonts.size.sm,
    color: colors.textMuted,
    fontWeight: fonts.weight.medium,
  },
  value: {
    fontSize: fonts.size.md,
    color: colors.textPrimary,
    fontWeight: fonts.weight.semibold,
  },
  bodyText: {
    fontSize: fonts.size.md,
    color: colors.textSecondary,
    lineHeight: fonts.lineHeight.relaxed,
  },

  // Inputs
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fonts.size.sm,
    color: colors.textSecondary,
    fontWeight: fonts.weight.semibold,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fonts.size.md,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.accent,
  },

  // Botones
  button: {
    borderRadius: spacing.radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonTextPrimary: {
    color: colors.white,
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
  },
  buttonTextOutline: {
    color: colors.primary,
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
  },

  // Badges de estado
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
  },

  // Divisores
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },

  // Sombra sutil para tarjetas destacadas
  shadowSoft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
});
