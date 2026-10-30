// Single source of truth for design values. Components read these through the MUI theme
// (palette / typography / shape) or import the semantic maps below directly.

export const brand = {
  deepOceanTeal: '#064E4A',
  oceanTeal: '#0D9488',
  softAqua: '#5EEAD4',
  lightTeal: '#99F6E4',
  mintWhite: '#F0FDFA',
  pureWhite: '#FFFFFF',
  darkSlate: '#1E293B',
}

export const colors = {
  primary: { main: brand.oceanTeal, dark: brand.deepOceanTeal, light: brand.mintWhite, contrastText: brand.pureWhite },
  accent: { main: brand.softAqua, light: brand.lightTeal },
  background: { app: '#F4F8F8', paper: brand.pureWhite, subtle: brand.mintWhite, hover: '#E6FAF6', selected: '#CCF5EC' },
  text: { primary: brand.darkSlate, secondary: '#5B6B7F', muted: '#8A98A8', inverse: brand.pureWhite, inverseMuted: '#A7D8D2' },
  border: { default: '#DCE7E6', strong: '#B9CFCD', focus: brand.oceanTeal },
  // Clinical signal colours: used only where urgency or risk must stand out.
  danger: { main: '#DC2626', dark: '#B91C1C', light: '#FEF2F2', border: '#FECACA' },
  warning: { main: '#D97706', dark: '#B45309', light: '#FFFBEB', border: '#FDE68A' },
  success: { main: '#16A34A', dark: '#15803D', light: '#F0FDF4', border: '#BBF7D0' },
  info: { main: '#0284C7', dark: '#0369A1', light: '#F0F9FF', border: '#BAE6FD' },
  neutral: { main: '#64748B', dark: '#475569', light: '#F1F5F9', border: '#E2E8F0' },
  ai: { main: '#7C3AED', light: '#F5F3FF', border: '#DDD6FE' },
}

export const typography = {
  fontFamily: '"Inter Variable", "Segoe UI", system-ui, -apple-system, sans-serif',
  baseFontSize: 13,
  size: {
    xxs: '0.66rem',
    xs: '0.72rem',
    sm: '0.8rem',
    md: '0.875rem',
    lg: '1rem',
    xl: '1.25rem',
    xxl: '1.6rem',
  },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
}

// Multipliers of the MUI 8px spacing unit.
export const spacing = { xxs: 0.5, xs: 1, sm: 1.5, md: 2, lg: 3, xl: 4 }

export const radius = { sm: 4, md: 8, lg: 12, pill: 999 }

export const shadows = {
  card: '0 1px 2px rgba(30,41,59,0.06)',
  raised: '0 4px 16px rgba(30,41,59,0.10)',
  menu: '0 12px 32px rgba(30,41,59,0.16)',
}

export const breakpoints = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }

export const layout = {
  appBarHeight: 56,
  sidebarWidth: 216,
  // Narrowest viewport that shows the full worklist table (all columns, no horizontal scroll); cards below it.
  worklistTableMinWidth: 1280,
}

// Data table (worklist). Row and header heights are fixed so rows line up and scan evenly.
export const table = {
  headerHeight: 40,
  rowHeight: 52,
  cellPaddingX: 1, // spacing units
  headerBg: brand.deepOceanTeal,
  headerText: brand.pureWhite,
  headerMuted: brand.lightTeal,
  gridLine: '#C2D4D2',
  headerGridLine: 'rgba(255,255,255,0.28)',
  rowBg: brand.pureWhite,
  rowStripeBg: '#FAFDFC',
  rowHoverBg: '#E6FAF6',
  statRowBg: '#FFF5F5',
  statRowHoverBg: '#FDECEC',
}

// Semantic maps keyed by the enum values in constants/study.js.
export const priorityColors = {
  STAT: { fg: colors.danger.dark, bg: colors.danger.light, border: colors.danger.border, bar: colors.danger.main },
  URGENT: { fg: colors.warning.dark, bg: colors.warning.light, border: colors.warning.border, bar: colors.warning.main },
  ROUTINE: { fg: colors.neutral.dark, bg: colors.neutral.light, border: colors.neutral.border, bar: 'transparent' },
}

export const reviewStatusColors = {
  PENDING_REVIEW: { fg: colors.info.dark, bg: colors.info.light, border: colors.info.border },
  UNDER_REVIEW: { fg: colors.warning.dark, bg: colors.warning.light, border: colors.warning.border },
  REVIEWED: { fg: brand.deepOceanTeal, bg: brand.mintWhite, border: brand.softAqua },
  FINALIZED: { fg: colors.success.dark, bg: colors.success.light, border: colors.success.border },
}

export const slaColors = {
  OK: colors.text.secondary,
  AT_RISK: colors.warning.dark,
  BREACHED: colors.danger.main,
  DONE: colors.text.muted,
}

export const severityColors = {
  CRITICAL: { fg: colors.danger.dark, bg: colors.danger.light, border: colors.danger.border, bar: colors.danger.main },
  HIGH: { fg: colors.warning.dark, bg: colors.warning.light, border: colors.warning.border, bar: colors.warning.main },
  MEDIUM: { fg: colors.info.dark, bg: colors.info.light, border: colors.info.border, bar: colors.info.main },
  LOW: { fg: colors.neutral.dark, bg: colors.neutral.light, border: colors.neutral.border, bar: colors.neutral.main },
}

export const exceptionStatusColors = {
  OPEN: { fg: colors.danger.dark, bg: colors.danger.light, border: colors.danger.border },
  ACKNOWLEDGED: { fg: colors.warning.dark, bg: colors.warning.light, border: colors.warning.border },
  RESOLVED: { fg: colors.success.dark, bg: colors.success.light, border: colors.success.border },
}

export const aiReportColors = {
  READY: { fg: colors.ai.main, bg: colors.ai.light, border: colors.ai.border },
  NOT_READY: { fg: colors.neutral.dark, bg: colors.neutral.light, border: colors.neutral.border },
}

// Coloured icon buttons in the worklist Actions column (images viewer, report PDF). Disabled buttons stay grey.
export const actionIconTones = {
  images: { fg: brand.oceanTeal, bg: brand.mintWhite, border: brand.softAqua, hoverBg: brand.lightTeal, hoverFg: brand.deepOceanTeal },
  // Info blue: distinct from the teal images button, and not red (red means danger / error in this app).
  pdf: { fg: colors.info.dark, bg: colors.info.light, border: colors.info.border, hoverBg: '#E0F2FE', hoverFg: '#075985' },
}

export const actionIconSx = (tone) => ({
  color: tone.fg,
  bgcolor: tone.bg,
  border: `1px solid ${tone.border}`,
  transition: 'background-color 120ms, color 120ms, border-color 120ms',
  '&:hover, &:focus-visible': { bgcolor: tone.hoverBg, color: tone.hoverFg, borderColor: tone.fg },
  '&.Mui-disabled': { color: colors.text.muted, bgcolor: colors.neutral.light, borderColor: colors.border.default },
})
