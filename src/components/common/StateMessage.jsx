import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { colors, typography } from '../../styles/tokens.js'

const ICONS = {
  empty: <InboxOutlinedIcon sx={{ fontSize: 36, color: colors.text.muted }} />,
  error: <ErrorOutlineRoundedIcon sx={{ fontSize: 36, color: colors.danger.main }} />,
  loading: <CircularProgress size={28} />,
}

// Loading / empty / error placeholder for lists and pages.
export default function StateMessage({ variant = 'empty', title, description, action, sx }) {
  return (
    <Stack spacing={1.25} role={variant === 'error' ? 'alert' : 'status'} sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 8, px: 3, ...sx }}>
      {ICONS[variant]}
      {title && <Typography sx={{ fontWeight: typography.weight.semibold, fontSize: typography.size.md }}>{title}</Typography>}
      {description && (
        <Typography sx={{ color: 'text.secondary', fontSize: typography.size.sm, maxWidth: 420 }}>{description}</Typography>
      )}
      {action && <Box sx={{ pt: 0.5 }}>{action}</Box>}
    </Stack>
  )
}
