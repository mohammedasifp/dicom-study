import { createTheme } from '@mui/material/styles'
import { brand, breakpoints, colors, radius, shadows, typography } from './styles/tokens.js'

export const authorColors = {
  ai: { main: colors.ai.main, bar: '#8b5cf6', tint: colors.ai.light, soft: '#c4b5fd' },
  reviewer: { main: '#047857', bar: '#34d399', tint: '#d1fae5', text: '#065f46' },
}

export const chrome = {
  bg: brand.deepOceanTeal,
  surface: '#053F3B',
  border: 'rgba(153,246,228,0.16)',
  text: colors.text.inverse,
  muted: colors.text.inverseMuted,
  accent: brand.lightTeal,
  control: brand.oceanTeal,
  controlHover: brand.softAqua,
  selected: 'rgba(94,234,212,0.16)',
  hover: 'rgba(94,234,212,0.08)',
  cta: brand.softAqua,
  ctaHover: brand.lightTeal,
  ctaText: brand.deepOceanTeal,
  disabledBg: 'rgba(255,255,255,0.08)',
}

export const theme = createTheme({
  breakpoints: { values: breakpoints },
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: { main: authorColors.ai.main },
    success: { main: colors.success.main, dark: colors.success.dark, light: colors.success.light },
    warning: { main: colors.warning.main, light: colors.warning.light },
    error: { main: colors.danger.main, light: colors.danger.light },
    info: { main: colors.info.main, light: colors.info.light },
    background: { default: colors.background.app, paper: colors.background.paper },
    text: { primary: colors.text.primary, secondary: colors.text.secondary },
    divider: colors.border.default,
  },
  shape: { borderRadius: radius.md },
  typography: {
    fontFamily: typography.fontFamily,
    fontSize: typography.baseFontSize,
    h1: { fontWeight: 700 },
    h6: { fontWeight: 650, fontSize: '0.95rem' },
    subtitle2: { fontWeight: 600 },
    overline: { fontWeight: 700, letterSpacing: '0.09em', lineHeight: 1.6, fontSize: '0.68rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { sizeSmall: { height: 32, borderRadius: radius.md, paddingInline: 12 } },
    },
    MuiIconButton: { styleOverrides: { sizeSmall: { width: 32, height: 32, borderRadius: radius.md } } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 300 },
      styleOverrides: { tooltip: { fontSize: '0.72rem', backgroundColor: colors.text.primary }, arrow: { color: colors.text.primary } },
    },
    MuiMenu: {
      styleOverrides: { paper: { boxShadow: shadows.menu, border: `1px solid ${colors.border.default}` } },
    },
  },
})
