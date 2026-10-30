import { Box, CircularProgress, Stack, Tooltip, Typography } from '@mui/material'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import Pill from '../common/Pill.jsx'
import { useI18n } from '../../i18n/I18nContext.js'
import { AI_DRAFT_STATUS, PRIORITY } from '../../constants/study.js'
import { aiDraftColors, brand, colors, priorityColors, radius, statusColors, typography } from '../../styles/tokens.js'

export function PriorityBadge({ priority }) {
  const { t } = useI18n()
  return (
    <Pill tone={priorityColors[priority]} solid={priority === PRIORITY.STAT} icon={priority === PRIORITY.STAT ? <BoltRoundedIcon /> : null}>
      {t(`priority.${priority}`)}
    </Pill>
  )
}

export function StatusBadge({ status }) {
  const { t } = useI18n()
  return (
    <Pill tone={statusColors[status]} title={t(`statusHint.${status}`)}>
      {t(`status.${status}`)}
    </Pill>
  )
}

export function ModalityBadge({ modality }) {
  const { t } = useI18n()
  return (
    <Tooltip title={t(`modality.${modality}`)}>
      <Box
        component="span"
        sx={{
          display: 'inline-grid',
          placeItems: 'center',
          minWidth: 34,
          height: 22,
          px: 0.75,
          borderRadius: `${radius.sm}px`,
          bgcolor: brand.mintWhite,
          border: `1px solid ${brand.lightTeal}`,
          color: brand.deepOceanTeal,
          fontSize: typography.size.xs,
          fontWeight: typography.weight.bold,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        {t(`modalityShort.${modality}`)}
      </Box>
    </Tooltip>
  )
}

const AI_ICONS = {
  [AI_DRAFT_STATUS.READY]: <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />,
  [AI_DRAFT_STATUS.PROCESSING]: <CircularProgress size={11} thickness={6} sx={{ color: aiDraftColors.PROCESSING }} />,
  [AI_DRAFT_STATUS.FAILED]: <ErrorOutlineRoundedIcon sx={{ fontSize: 15 }} />,
  [AI_DRAFT_STATUS.NOT_AVAILABLE]: null,
}

// iconOnly: compact table form; the tooltip carries the full wording.
export function AiDraftIndicator({ status, iconOnly = false }) {
  const { t } = useI18n()
  if (iconOnly) {
    return (
      <Tooltip title={`${t(`aiDraft.${status}`)} · ${t(`aiDraftHint.${status}`)}`}>
        <Box component="span" aria-label={t(`aiDraft.${status}`)} sx={{ display: 'inline-flex', color: aiDraftColors[status], fontSize: typography.size.sm }}>
          {AI_ICONS[status] || '—'}
        </Box>
      </Tooltip>
    )
  }
  return (
    <Tooltip title={t(`aiDraftHint.${status}`)}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: aiDraftColors[status], width: 'fit-content' }}>
        {AI_ICONS[status]}
        <Typography
          component="span"
          sx={{
            fontSize: typography.size.xs,
            fontWeight: status === AI_DRAFT_STATUS.READY ? typography.weight.semibold : typography.weight.regular,
            color: status === AI_DRAFT_STATUS.NOT_AVAILABLE ? colors.text.muted : 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {t(`aiDraft.${status}`)}
        </Typography>
      </Stack>
    </Tooltip>
  )
}
