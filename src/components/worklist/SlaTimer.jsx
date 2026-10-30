import { Stack, Tooltip, Typography } from '@mui/material'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatDuration } from '../../i18n/format.js'
import { slaInfo } from '../../worklist/sla.js'
import { SLA_STATE } from '../../constants/study.js'
import { slaColors, typography } from '../../styles/tokens.js'

// Time since acquisition for open studies (coloured against the SLA target); final turnaround for completed ones.
export default function SlaTimer({ study, now }) {
  const { t } = useI18n()
  const sla = slaInfo(study, now)
  const target = formatDuration(sla.targetMinutes, t)

  let hint
  if (sla.state === SLA_STATE.DONE) hint = t(sla.metTarget ? 'sla.doneWithin' : 'sla.doneOver', { target })
  else if (sla.state === SLA_STATE.BREACHED) hint = t('sla.breached', { over: formatDuration(-sla.remainingMinutes, t), target })
  else hint = t('sla.remaining', { remaining: formatDuration(sla.remainingMinutes, t), target })

  const urgent = sla.state === SLA_STATE.BREACHED || sla.state === SLA_STATE.AT_RISK
  return (
    <Tooltip title={hint}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: slaColors[sla.state], width: 'fit-content' }}>
        {sla.state === SLA_STATE.BREACHED ? <WarningAmberRoundedIcon sx={{ fontSize: 15 }} /> : <ScheduleRoundedIcon sx={{ fontSize: 15 }} />}
        <Typography
          component="span"
          sx={{ fontSize: typography.size.sm, fontWeight: urgent ? typography.weight.bold : typography.weight.medium, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
        >
          {sla.state === SLA_STATE.DONE ? t('sla.tat', { duration: formatDuration(sla.elapsedMinutes, t) }) : formatDuration(sla.elapsedMinutes, t)}
        </Typography>
      </Stack>
    </Tooltip>
  )
}
