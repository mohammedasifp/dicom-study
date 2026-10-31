import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { getStagePatients } from '../../api/backend.js'
import { errorMessageKey } from '../../api/errors.js'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatDuration, formatTime } from '../../i18n/format.js'
import StateMessage from '../common/StateMessage.jsx'
import Pill from '../common/Pill.jsx'
import { colors, priorityColors, severityColors, shadows, table, typography } from '../../styles/tokens.js'

const minutesSince = (from, now) => (now - new Date(from)) / 60000

export default function StagePatients({ stage, now, refreshKey, onClose, onOpenStudy }) {
  const { t, intlLocale } = useI18n()
  const [state, setState] = useState({ status: 'loading', stage, patients: [], error: null })

  useEffect(() => {
    let cancelled = false
    getStagePatients(stage)
      .then((data) => !cancelled && setState({ status: 'ready', stage, patients: data.patients, error: null }))
      .catch((error) => !cancelled && setState((s) => ({ ...s, status: 'error', stage, error })))
    return () => {
      cancelled = true
    }
  }, [stage, refreshKey])

  const head = { bgcolor: table.headerBg, color: table.headerText, fontSize: typography.size.xs, fontWeight: typography.weight.semibold, whiteSpace: 'nowrap', py: 1 }
  const cell = { fontSize: typography.size.sm, py: 0.75 }
  const loading = state.status === 'loading' || state.stage !== stage

  return (
    <Paper sx={{ border: 1, borderColor: 'divider', boxShadow: shadows.card, overflow: 'clip' }}>
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography sx={{ flex: 1, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
          {t('ops.stagePatients.title', { stage: t(`ops.stage.${stage}`), count: loading ? '…' : state.patients.length })}
        </Typography>
        <IconButton size="small" aria-label={t('ops.stagePatients.close')} onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
      {loading && <StateMessage variant="loading" sx={{ py: 4 }} />}
      {!loading && state.status === 'error' && <StateMessage variant="error" title={t(errorMessageKey(state.error))} sx={{ py: 4 }} />}
      {!loading && state.status === 'ready' && !state.patients.length && <StateMessage title={t('ops.stagePatients.empty')} sx={{ py: 4 }} />}
      {!loading && state.status === 'ready' && state.patients.length > 0 && (
        <TableContainer sx={{ maxHeight: 420, overflow: 'auto' }}>
          <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={head}>{t('ops.columns.patient')}</TableCell>
                <TableCell sx={head}>{t('ops.stagePatients.study')}</TableCell>
                <TableCell sx={head}>{t('ops.stagePatients.priority')}</TableCell>
                <TableCell sx={head}>{t('ops.stagePatients.since')}</TableCell>
                <TableCell sx={head}>{t('ops.stagePatients.problem')}</TableCell>
                <TableCell sx={{ ...head, width: 120 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {state.patients.map((p) => (
                <TableRow key={`${p.ref.kind}:${p.ref.id}`} hover>
                  <TableCell sx={cell}>
                    <Typography sx={{ fontSize: typography.size.sm }}>{p.patient.name}</Typography>
                    <Typography sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
                      {p.patient.patientId} · {p.accessionNumber}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cell}>
                    {p.description} · {p.modality}
                  </TableCell>
                  <TableCell sx={cell}>
                    <Pill tone={priorityColors[p.priority] || priorityColors.ROUTINE}>{t(`priority.${p.priority}`)}</Pill>
                  </TableCell>
                  <TableCell sx={{ ...cell, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {p.since && (
                      <Tooltip title={formatTime(p.since, intlLocale)}>
                        <span>{formatDuration(minutesSince(p.since, now), t)}</span>
                      </Tooltip>
                    )}
                    {p.scheduledAt && (
                      <Typography sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
                        {t('ops.stagePatients.booked', { time: formatTime(p.scheduledAt, intlLocale) })}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={cell}>
                    {p.exception ? (
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <Pill tone={severityColors[p.exception.severity]}>{t(`ops.severity.${p.exception.severity}`)}</Pill>
                        <Box component="span">{t(`ops.type.${p.exception.type}`)}</Box>
                      </Stack>
                    ) : (
                      <Typography component="span" sx={{ fontSize: typography.size.sm, color: colors.text.muted }}>
                        {t('ops.stagePatients.noProblem')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ ...cell, textAlign: 'right' }}>
                    {p.ref.kind === 'study' && (
                      <Button size="small" variant="outlined" onClick={() => onOpenStudy(p.ref.id)}>
                        {t('ops.detail.openStudy')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}
