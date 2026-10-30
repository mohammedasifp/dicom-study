import { Box, Tooltip } from '@mui/material'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import Pill from '../common/Pill.jsx'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatDateTime } from '../../i18n/format.js'
import { AI_READINESS, AI_REPORT_STATUS, PRIORITY } from '../../constants/study.js'
import { aiReportColors, brand, priorityColors, radius, reviewStatusColors, typography } from '../../styles/tokens.js'

export function PriorityBadge({ priority }) {
  const { t } = useI18n()
  return (
    <Pill tone={priorityColors[priority]} solid={priority === PRIORITY.STAT} icon={priority === PRIORITY.STAT ? <BoltRoundedIcon /> : null}>
      {t(`priority.${priority}`)}
    </Pill>
  )
}

// Radiologist review progress. Independent of the AI report status.
export function ReviewStatusBadge({ status }) {
  const { t } = useI18n()
  return (
    <Tooltip title={t(`reviewStatusHint.${status}`)}>
      <span>
        <Pill tone={reviewStatusColors[status]}>{t(`reviewStatus.${status}`)}</Pill>
      </span>
    </Tooltip>
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

// The worklist shows only whether the AI report is ready. The tooltip says why it is not
// (still being generated, or failed so the study is reported manually) and when the status last changed.
export function AiReportStatusBadge({ study }) {
  const { t, intlLocale } = useI18n()
  const status = study.aiReportStatus
  const ready = status === AI_REPORT_STATUS.READY
  const hint = [
    status !== AI_REPORT_STATUS.FAILED
      ? t(`aiReportHint.${status}`)
      : study.aiFailureMessage || (study.aiFailureReason ? t(`aiFailure.${study.aiFailureReason}`) : t(`aiReportHint.${status}`)),
    t(`aiReportTime.${status}`, { time: formatDateTime(study.aiReportUpdatedAt, intlLocale) }),
  ].join(' · ')
  return (
    <Tooltip title={hint}>
      <span>
        <Pill tone={ready ? aiReportColors.READY : aiReportColors.NOT_READY} icon={ready ? <AutoAwesomeRoundedIcon /> : <HourglassEmptyRoundedIcon />}>
          {t(`aiReport.${ready ? AI_READINESS.READY : AI_READINESS.NOT_READY}`)}
        </Pill>
      </span>
    </Tooltip>
  )
}
