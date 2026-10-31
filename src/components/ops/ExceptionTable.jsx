import { Fragment, useState } from 'react'
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
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
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatDuration, formatTime } from '../../i18n/format.js'
import Pill from '../common/Pill.jsx'
import { brand, colors, exceptionStatusColors, radius, severityColors, table, typography } from '../../styles/tokens.js'

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

// One titled card in the expanded detail panel.
function DetailCard({ icon, title, accent, children }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${table.gridLine}`,
        borderLeft: accent ? `4px solid ${accent}` : `1px solid ${table.gridLine}`,
        borderRadius: `${radius.md}px`,
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 1.5, py: 1, bgcolor: colors.background.subtle, borderBottom: `1px solid ${table.gridLine}` }}>
        <Box sx={{ display: 'inline-flex', color: accent || colors.text.secondary, '& svg': { fontSize: 18 } }}>{icon}</Box>
        <Typography sx={{ fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ p: 1.5 }}>{children}</Box>
    </Box>
  )
}

function ExceptionDetail({ exception, onOpenStudy }) {
  const { t, intlLocale } = useI18n()
  const body = { fontSize: typography.size.sm, lineHeight: 1.55 }
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.2fr) minmax(0, 1.3fr) minmax(0, 0.9fr)' },
        alignItems: 'start',
        p: 2,
        pl: { lg: 7 },
        bgcolor: colors.background.app,
        boxShadow: `inset 3px 0 0 ${severityColors[exception.severity].bar}`,
      }}
    >
      <DetailCard icon={<ReportProblemOutlinedIcon />} title={t('ops.detail.whatWentWrong')} accent={severityColors[exception.severity].bar}>
        <Typography sx={body}>{exception.detail}</Typography>
        {exception.clearedAt && exception.status !== 'RESOLVED' && (
          <Typography sx={{ mt: 1, fontSize: typography.size.xs, color: colors.success.dark }}>{t('ops.detail.cleared')}</Typography>
        )}
        {exception.resolutionNote && (
          <Box sx={{ mt: 1.5, p: 1, borderRadius: `${radius.sm}px`, bgcolor: colors.success.light, border: `1px solid ${colors.success.border}` }}>
            <Typography sx={{ fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.success.dark, mb: 0.25 }}>{t('ops.detail.resolution')}</Typography>
            <Typography sx={body}>{exception.resolutionNote}</Typography>
          </Box>
        )}
        {exception.ref.kind === 'study' && (
          <Button size="small" variant="outlined" startIcon={<OpenInNewRoundedIcon />} onClick={() => onOpenStudy(exception.ref.id)} sx={{ mt: 1.5 }}>
            {t('ops.detail.openStudy')}
          </Button>
        )}
      </DetailCard>

      <DetailCard icon={<ChecklistRoundedIcon />} title={t('ops.detail.suggested')}>
        <Stack component="ol" spacing={1} sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {exception.actions.map((a, i) => (
            <Stack component="li" key={a} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
              <Box
                sx={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  mt: '1px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.bold,
                  color: brand.deepOceanTeal,
                  bgcolor: brand.mintWhite,
                  border: `1px solid ${brand.softAqua}`,
                }}
              >
                {i + 1}
              </Box>
              <Typography sx={body}>{a}</Typography>
            </Stack>
          ))}
        </Stack>
      </DetailCard>

      <DetailCard icon={<HistoryRoundedIcon />} title={t('ops.detail.history')}>
        <Stack spacing={0}>
          {exception.history.map((h, i) => (
            <Stack key={`${h.action}-${h.at}`} direction="row" spacing={1.25} sx={{ alignItems: 'stretch' }}>
              <Stack sx={{ alignItems: 'center', pt: '6px' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === exception.history.length - 1 ? brand.oceanTeal : colors.border.strong, flexShrink: 0 }} />
                {i < exception.history.length - 1 && <Box sx={{ flex: 1, width: '1px', bgcolor: table.gridLine, my: 0.5 }} />}
              </Stack>
              <Box sx={{ pb: i < exception.history.length - 1 ? 1.25 : 0, minWidth: 0 }}>
                <Typography sx={{ fontSize: typography.size.xs, color: colors.text.muted, fontVariantNumeric: 'tabular-nums' }}>{formatTime(h.at, intlLocale)}</Typography>
                <Typography sx={{ fontSize: typography.size.sm }}>{t(`ops.history.${h.action}`, { by: h.by, note: h.note })}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </DetailCard>
    </Box>
  )
}

export default function ExceptionTable({ exceptions, now, radiologists, currentUserId, busy, onAcknowledge, onAssign, onResolve, onOpenStudy }) {
  const { t, intlLocale } = useI18n()
  const [expanded, setExpanded] = useState(null)
  // Grid lines match the worklist table (styles/tokens.js `table`): row and column separators, none after the last column.
  const head = {
    bgcolor: table.headerBg,
    color: table.headerText,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    whiteSpace: 'nowrap',
    py: 1,
    borderBottom: 0,
    borderRight: `1px solid ${table.headerGridLine}`,
    '&:last-of-type': { borderRight: 0 },
  }
  const cell = {
    fontSize: typography.size.sm,
    py: 1,
    verticalAlign: 'middle',
    borderBottom: `1px solid ${table.gridLine}`,
    borderRight: `1px solid ${table.gridLine}`,
    '&:last-of-type': { borderRight: 0 },
  }

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
                  sx={{
                    '& > td': { borderBottom: open ? 0 : undefined },
                    '&:hover': { bgcolor: table.rowHoverBg },
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
                  <TableCell colSpan={9} sx={{ p: 0, borderBottom: open ? `1px solid ${table.gridLine}` : 0 }}>
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
