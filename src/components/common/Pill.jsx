import { Box } from '@mui/material'
import { colors, radius, typography } from '../../styles/tokens.js'

// Compact label used by status / priority / modality badges. `tone` = { fg, bg, border }.
export default function Pill({ tone, icon, children, solid = false, title, sx }) {
  return (
    <Box
      component="span"
      title={title}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        height: 22,
        px: 1,
        borderRadius: `${radius.pill}px`,
        border: '1px solid',
        borderColor: solid ? tone.bar || tone.fg : tone.border,
        bgcolor: solid ? tone.bar || tone.fg : tone.bg,
        color: solid ? colors.text.inverse : tone.fg,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.semibold,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        '& svg': { fontSize: 13 },
        ...sx,
      }}
    >
      {icon}
      {children}
    </Box>
  )
}
