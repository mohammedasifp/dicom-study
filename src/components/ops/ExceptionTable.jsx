import { Fragment, useState } from 'react'
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatDuration, formatTime } from '../../i18n/format.js'
import Pill from '../common/Pill.jsx'
import { colors, exceptionStatusColors, severityColors, table, typography } from '../../styles/tokens.js'

const minutesBetween = (from, to) => (new Date(to) - new Date(from)) / 60000

function AssignButton({ exception, radiologists, currentUserId, disabled, onAssign }) {
  const { t } = useI18n()
  const [anchor, setAnchor] = useState(null)
  const choose = (id) => {
    setAnchor(null)
    onAssign(exception.id, id)
  }
  return (
    <>
      <Button size="small" variant="outlined" disabled={disabled} onClick={(e) => setAnchor(e.currentTarget)}>
        {t('ops.action.assign')}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {currentUserId && (
          <MenuItem dense onClick={() => choose(currentUserId)}>
            {t('ops.action.assignToMe')}
          </MenuItem>
        )}
        {currentUserId && <Divider />}
        {radiologists
          .filter((r) => r.id !== currentUserId)
          .map((r) => (
            <MenuItem key={r.id} dense selected={exception.assignee?.id === r.id} onClick={() => choose(r.id)}>
              {r.name}
            </MenuItem>
          ))}
      </Menu>
    </>
  )
}

function ExceptionDetail({ exception, onOpenStudy }) {
  const { t, intlLocale } = useI18n()
  const heading = { fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1.2fr 1fr' }, p: 2, bgcolor: colors.background.subtle }}>
      <Box>
        <Typography sx={heading}>{t('ops.detail.whatWentWrong')}</Typography>
        <Typography sx={{ fontSize: typography.size.sm }}>{exception.detail}</Typography>
        {exception.clearedAt && exception.status !== 'RESOLVED' && (
          <Typography sx={{ mt: 1, fontSize: typography.size.xs, color: colors.success.dark }}>{t('ops.detail.cleared')}</Typography>
        )}
        {exception.ref.kind === 'study' && (
          <Link component="button" type="button" onClick={() => onOpenStudy(exception.ref.id)} sx={{ mt: 1, fontSize: typography.size.sm }}>
            {t('ops.detail.openStudy')}
          </Link>
        )}
        {exception.resolutionNote && (
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={heading}>{t('ops.detail.resolution')}</Typography>
            <Typography sx={{ fontSize: typography.size.sm }}>{exception.resolutionNote}</Typography>
          </Box>
        )}
      </Box>
      <Box>
        <Typography sx={heading}>{t('ops.detail.suggested')}</Typography>
        <Box component="ol" sx={{ m: 0, pl: 2.5, fontSize: typography.size.sm, '& li': { mb: 0.5 } }}>
          {exception.actions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </Box>
      </Box>
      <Box>
        <Typography sx={heading}>{t('ops.detail.history')}</Typography>
        <Stack spacing={0.5}>
          {exception.history.map((h) => (
            <Typography key={`${h.action}-${h.at}`} sx={{ fontSize: typography.size.xs }}>
              <Box component="span" sx={{ color: colors.text.muted, fontVariantNumeric: 'tabular-nums', mr: 1 }}>
                {formatTime(h.at, intlLocale)}
              </Box>
              {t(`ops.history.${h.action}`, { by: h.by, note: h.note })}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

export default function ExceptionTable({ exceptions, now, radiologists, currentUserId, busy, onAcknowledge, onAssign, onResolve, onOpenStudy }) {
  const { t, intlLocale } = useI18n()
  const [expanded, setExpanded] = useState(null)
  const head = { bgcolor: table.headerBg, color: table.headerText, fontSize: typography.size.xs, fontWeight: typography.weight.semibold, whiteSpace: 'nowrap', py: 1 }
  const cell = { fontSize: typography.size.sm, py: 1, verticalAlign: 'middle' }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 1100 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...head, width: 40 }} />
            <TableCell sx={head}>{t('ops.columns.severity')}</TableCell>
            <TableCell sx={head}>{t('ops.columns.problem')}</TableCell>
            <TableCell sx={head}>{t('ops.columns.patient')}</TableCell>
            <TableCell sx={head}>{t('ops.columns.stage')}</TableCell>
            <TableCell sx={head}>{t('ops.columns.elapsed')}</TableCell>
            <TableCell sx={head}>{t('ops.columns.status')}</TableCell>
            <TableCell sx={head}>{t('ops.columns.owner')}</TableCell>
            <TableCell sx={{ ...head, textAlign: 'right' }}>{t('ops.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {exceptions.map((e) => {
            const open = expanded === e.id
            const resolved = e.status === 'RESOLVED'
            const rowBusy = busy === e.id
            return (
              <Fragment key={e.id}>
                <TableRow
                  hover
                  sx={{
                    '& > td': { borderBottom: open ? 0 : undefined },
                    boxShadow: `inset 3px 0 0 ${resolved ? 'transparent' : severityColors[e.severity].bar}`,
                    opacity: resolved ? 0.75 : 1,
                  }}
                >
                  <TableCell sx={cell}>
                    <IconButton size="small" aria-label={t(open ? 'ops.detail.collapse' : 'ops.detail.expand')} onClick={() => setExpanded(open ? null : e.id)}>
                      {open ? <KeyboardArrowUpRoundedIcon fontSize="small" /> : <KeyboardArrowDownRoundedIcon fontSize="small" />}
                    </IconButton>
                  </TableCell>
                  <TableCell sx={cell}>
                    <Pill tone={severityColors[e.severity]} solid={e.severity === 'CRITICAL' && !resolved}>
                      {t(`ops.severity.${e.severity}`)}
                    </Pill>
                  </TableCell>
                  <TableCell sx={cell}>
                    <Typography sx={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>{t(`ops.type.${e.type}`)}</Typography>
                    <Typography sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
                      {e.description} · {e.modality} · {e.priority}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cell}>
                    <Typography sx={{ fontSize: typography.size.sm }}>{e.patient.name}</Typography>
                    <Typography sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
                      {e.patient.patientId} · {e.accessionNumber}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...cell, whiteSpace: 'nowrap' }}>{t(`ops.workflowStage.${e.stage}`)}</TableCell>
                  <TableCell sx={{ ...cell, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {resolved ? (
                      <Typography sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
                        {t('ops.resolvedIn', { duration: formatDuration(minutesBetween(e.detectedAt, e.resolvedAt), t) })}
                      </Typography>
                    ) : (
                      <Tooltip title={t('ops.elapsedSince', { time: formatTime(e.startedAt, intlLocale) })}>
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                          {formatDuration(minutesBetween(e.startedAt, now), t)}
                          <InfoOutlinedIcon sx={{ fontSize: 14, color: colors.text.muted }} />
                        </Box>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell sx={cell}>
                    <Pill tone={exceptionStatusColors[e.status]}>{t(`ops.status.${e.status}`)}</Pill>
                  </TableCell>
                  <TableCell sx={{ ...cell, whiteSpace: 'nowrap' }}>
                    {e.assignee?.name || (
                      <Typography component="span" sx={{ fontSize: typography.size.sm, color: colors.text.muted }}>
                        {t('ops.action.unassigned')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ ...cell, textAlign: 'right' }}>
                    {!resolved && (
                      <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'flex-end' }}>
                        {e.status === 'OPEN' && (
                          <Button size="small" variant="outlined" disabled={rowBusy} onClick={() => onAcknowledge(e.id)}>
                            {t('ops.action.acknowledge')}
                          </Button>
                        )}
                        <AssignButton exception={e} radiologists={radiologists} currentUserId={currentUserId} disabled={rowBusy} onAssign={onAssign} />
                        <Button size="small" variant="contained" disabled={rowBusy} onClick={() => onResolve(e)}>
                          {t('ops.action.resolve')}
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={9} sx={{ p: 0, borderBottom: open ? undefined : 0 }}>
                    <Collapse in={open} unmountOnExit>
                      <ExceptionDetail exception={e} onOpenStudy={onOpenStudy} />
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
