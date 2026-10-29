import { createTheme } from '@mui/material/styles'

export const authorColors = {
  ai: { main: '#7c3aed', bar: '#8b5cf6', tint: '#f5f3ff', soft: '#c4b5fd' },
  reviewer: { main: '#047857', bar: '#34d399', tint: '#d1fae5', text: '#065f46' },
}

export const chrome = {
  bg: '#0b1220',
  surface: '#111a2d',
  border: '#1f2a40',
  text: '#e2e8f0',
  muted: '#8b97ad',
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb', dark: '#1d4ed8', light: '#eff6ff' },
    secondary: { main: authorColors.ai.main },
    success: { main: '#16a34a', dark: '#15803d', light: '#f0fdf4' },
    warning: { main: '#d97706', light: '#fffbeb' },
    error: { main: '#dc2626', light: '#fef2f2' },
    background: { default: '#eef1f6', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    divider: '#e2e8f0',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter Variable", "Segoe UI", system-ui, -apple-system, sans-serif',
    fontSize: 13,
    h1: { fontWeight: 700 },
    h6: { fontWeight: 650, fontSize: '0.95rem' },
    subtitle2: { fontWeight: 600 },
    overline: { fontWeight: 700, letterSpacing: '0.09em', lineHeight: 1.6, fontSize: '0.68rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { sizeSmall: { height: 32, borderRadius: 8, paddingInline: 12 } },
    },
    MuiIconButton: { styleOverrides: { sizeSmall: { width: 32, height: 32, borderRadius: 8 } } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 300 },
      styleOverrides: { tooltip: { fontSize: '0.72rem', backgroundColor: '#1e293b' }, arrow: { color: '#1e293b' } },
    },
    MuiMenu: {
      styleOverrides: { paper: { boxShadow: '0 12px 32px rgba(15,23,42,0.16)', border: '1px solid #e2e8f0' } },
    },
  },
})
