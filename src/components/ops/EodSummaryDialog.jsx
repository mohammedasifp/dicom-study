import { useEffect, useState } from 'react'
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import { getOpsSummary } from '../../api/backend.js'
import { errorMessageKey } from '../../api/errors.js'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatDuration, formatTime } from '../../i18n/format.js'
import { useNotify } from '../../hooks/useNotify.js'
import StateMessage from '../common/StateMessage.jsx'
import Pill from '../common/Pill.jsx'
import { colors, radius, severityColors, typography } from '../../styles/tokens.js'

function Metric({ label, value }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: `${radius.md}px`, border: 1, borderColor: 'divider' }}>
      <Typography sx={{ fontSize: typography.size.xl, fontWeight: typography.weight.bold, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      <Typography sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>{label}</Typography>
    </Box>
  )
}

const heading = { fontSize: typography.size.sm, fontWeight: typography.weight.bold, mb: 0.75 }

function summaryText(s, t) {
  const line = (label, value) => `${label}: ${value}`
  const time = (m) => (m === null ? t('ops.summary.none') : formatDuration(m, t))
  return [
    t('ops.summary.title'),
    '',
    line(t('ops.summary.raised'), s.exceptions.raised),
    line(t('ops.summary.resolved'), s.exceptions.resolved),
    line(t('ops.summary.stillOpen'), s.exceptions.open),
    line(t('ops.summary.toAcknowledge'), time(s.exceptions.averageMinutesToAcknowledge)),
    line(t('ops.summary.toResolve'), time(s.exceptions.averageMinutesToResolve)),
    line(t('ops.summary.reported'), s.throughput.reported),
    line(t('ops.summary.delivered'), s.throughput.delivered),
    line(t('ops.summary.sla'), s.sla.percent === null ? t('ops.summary.none') : `${s.sla.percent}%`),
    '',
    `${t('ops.summary.insights')}:`,
    ...s.insights.map((i) => `- ${i}`),
    '',
    `${t('ops.summary.carryOver')}:`,
    ...s.carryOver.map((e) => `- [${t(`ops.severity.${e.severity}`)}] ${t(`ops.type.${e.type}`)}: ${e.patient.name} (${e.assignee?.name || t('ops.action.unassigned')})`),
    '',
    s.disclaimer,
  ].join('\n')
}

export default function EodSummaryDialog({ onClose }) {
  const { t, intlLocale } = useI18n()
  const notify = useNotify()
  const [state, setState] = useState({ status: 'loading', summary: null, error: null })

  useEffect(() => {
    let cancelled = false
    getOpsSummary()
      .then((summary) => !cancelled && setState({ status: 'ready', summary, error: null }))
      .catch((error) => !cancelled && setState({ status: 'error', summary: null, error }))
    return () => {
      cancelled = true
    }
  }, [])

  const s = state.summary
  const time = (m) => (m === null ? t('ops.summary.none') : formatDuration(m, t))
  const copy = async () => {
    await navigator.clipboard.writeText(summaryText(s, t))
    notify({ severity: 'success', message: t('ops.summary.copied') })
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth aria-labelledby="eod-title">
      <DialogTitle id="eod-title" sx={{ pb: 0.5 }}>
        {t('ops.summary.title')}
        {s && (
          <Typography sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
            {t('ops.summary.generated', { time: formatTime(s.generatedAt, intlLocale) })}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {state.status === 'loading' && <StateMessage variant="loading" />}
        {state.status === 'error' && <StateMessage variant="error" title={t(errorMessageKey(state.error))} />}
        {s && (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(5, 1fr)' } }}>
              <Metric label={t('ops.summary.raised')} value={s.exceptions.raised} />
              <Metric label={t('ops.summary.resolved')} value={s.exceptions.resolved} />
              <Metric label={t('ops.summary.stillOpen')} value={s.exceptions.open} />
              <Metric label={t('ops.summary.toAcknowledge')} value={time(s.exceptions.averageMinutesToAcknowledge)} />
              <Metric label={t('ops.summary.toResolve')} value={time(s.exceptions.averageMinutesToResolve)} />
              <Metric label={t('ops.summary.reported')} value={s.throughput.reported} />
              <Metric label={t('ops.summary.delivered')} value={s.throughput.delivered} />
              <Metric label={t('ops.summary.tat')} value={time(s.throughput.averageTatMinutes)} />
              <Metric label={t('ops.summary.sla')} value={s.sla.percent === null ? t('ops.summary.none') : `${s.sla.percent}%`} />
            </Box>

            <Box>
              <Typography sx={heading}>{t('ops.summary.insights')}</Typography>
              {s.insights.length ? (
                <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: typography.size.sm, '& li': { mb: 0.5 } }}>
                  {s.insights.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ fontSize: typography.size.sm, color: colors.text.muted }}>{t('ops.summary.noInsights')}</Typography>
              )}
            </Box>

            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1.6fr' } }}>
              <Box>
                <Typography sx={heading}>{t('ops.summary.byType')}</Typography>
                <Stack spacing={0.5}>
                  {Object.entries(s.exceptions.byType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => (
                      <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.size.sm }}>
                        <span>{t(`ops.type.${type}`)}</span>
                        <Box component="span" sx={{ fontWeight: typography.weight.semibold, fontVariantNumeric: 'tabular-nums' }}>
                          {count}
                        </Box>
                      </Box>
                    ))}
                </Stack>
              </Box>
              <Box>
                <Typography sx={heading}>{t('ops.summary.carryOver')}</Typography>
                {!s.carryOver.length && <Typography sx={{ fontSize: typography.size.sm, color: colors.text.muted }}>{t('ops.summary.noCarryOver')}</Typography>}
                <Stack spacing={0.75}>
                  {s.carryOver.map((e) => (
                    <Box key={e.id} sx={{ display: 'flex', gap: 1, alignItems: 'center', fontSize: typography.size.sm }}>
                      <Pill tone={severityColors[e.severity]}>{t(`ops.severity.${e.severity}`)}</Pill>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {t(`ops.type.${e.type}`)} · {e.patient.name}
                      </Box>
                      <Box component="span" sx={{ color: colors.text.secondary, whiteSpace: 'nowrap' }}>
                        {e.assignee?.name || t('ops.action.unassigned')}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>

            <Box>
              <Typography sx={heading}>{t('ops.summary.centre')}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {s.stages.map((st) => (
                  <Pill key={st.stage} tone={{ fg: colors.text.primary, bg: colors.background.subtle, border: colors.border.default }}>
                    {t(`ops.stage.${st.stage}`)}: {st.count}
                  </Pill>
                ))}
              </Box>
            </Box>

            <Alert severity="info" sx={{ fontSize: typography.size.xs }}>
              {s.disclaimer}
            </Alert>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button startIcon={<ContentCopyRoundedIcon />} disabled={!s} onClick={copy}>
          {t('ops.summary.copy')}
        </Button>
        <Button variant="contained" onClick={onClose}>
          {t('ops.summary.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
