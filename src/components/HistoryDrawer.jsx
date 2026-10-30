import { Box, CircularProgress, Drawer, IconButton, Stack, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { authorColors } from '../theme.js'
import { formatDateTime } from '../report/format.js'

const LABELS = {
  STUDY_RECEIVED: 'Study received from the image server',
  STUDY_REJECTED: 'Study rejected',
  AI_REQUESTED: 'AI analysis requested',
  AI_STREAM_CHUNK: 'AI streamed a result',
  AI_CHUNK_SENT: 'Images sent to the AI',
  AI_COMPLETED: 'AI draft ready',
  AI_FAILED: 'AI analysis failed',
  REPORT_PENDING: 'Waiting for the radiologist',
  SCAN_VIEWED: 'Images opened',
  SCAN_NOT_VIEWED: 'Images not opened in time',
  SUGGESTION_ACCEPTED: 'Accepted',
  SUGGESTION_EDITED: 'Edited',
  SUGGESTION_DISCARDED: 'Discarded',
  SUGGESTION_RESET: 'Moved back to pending',
  REPORT_SAVED: 'Report saved',
  REPORT_FINALISED: 'Finalised',
  REPORT_REOPENED: 'Reopened',
  REPORT_EXPORTED: 'Exported',
  SLA_SET: 'Report deadline set',
  REPORT_OVERDUE: 'Report overdue',
  RADIOLOGIST_ASSIGNED: 'Radiologist assigned',
  RADIOLOGIST_UNASSIGNED: 'Radiologist unassigned',
  REPORT_IMAGE_ADDED: 'Image added to the report',
  AI_ROLLED_BACK: 'Previous AI draft restored',
}

const NOISY = ['AI_STREAM_CHUNK', 'AI_CHUNK_SENT', 'REPORT_SAVED']

const ACTOR_COLOR = { ai: authorColors.ai.main, reviewer: authorColors.reviewer.main }

function detail(event, byId) {
  const p = event.payload || {}
  if (p.observationId && byId[p.observationId]) return `#${byId[p.observationId].index} ${byId[p.observationId].observation}`
  if (event.tag === 'AI_COMPLETED' && p.model) return `${p.model.name || p.model.id} · ${p.observations} observations`
  if (event.tag === 'AI_FAILED') return p.error
  if (event.tag === 'SLA_SET') return `${p.minutes} min, due ${formatDateTime(p.dueAt)}`
  if (event.tag === 'REPORT_FINALISED') return p.reviewer
  if (event.tag === 'RADIOLOGIST_ASSIGNED') return [p.name, p.assignedBy && `by ${p.assignedBy}`].filter(Boolean).join(' ')
  if (event.tag === 'REPORT_REOPENED') return [p.reviewer, p.reason].filter(Boolean).join(' · ')
  if (event.tag === 'AI_ROLLED_BACK') return p.restoredModel && `${p.restoredModel.name || p.restoredModel.id}`
  return null
}

export default function HistoryDrawer({ open, onClose, events, suggestions }) {
  const byId = Object.fromEntries(suggestions.map((s) => [s.id, s]))
  const visible = (events || []).filter((e) => !NOISY.includes(e.tag))
  const saves = (events || []).filter((e) => e.tag === 'REPORT_SAVED').length

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: 380 } } }}>
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Audit trail</Typography>
          {saves > 0 && (
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
              {saves} autosave{saves > 1 ? 's' : ''} not listed
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {!events && (
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress size={22} />
          </Stack>
        )}
        {events && !visible.length && <Typography sx={{ color: 'text.secondary', fontSize: '0.84rem' }}>No events yet.</Typography>}
        {[...visible].reverse().map((e, i, arr) => {
          const color = ACTOR_COLOR[e.actor] || '#64748b'
          const text = detail(e, byId)
          return (
            <Stack key={e._id} direction="row" spacing={1.5}>
              <Stack sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, mt: 0.6 }} />
                {i < arr.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5 }} />}
              </Stack>
              <Box sx={{ pb: 2, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {LABELS[e.tag] || e.tag}
                </Typography>
                {text && (
                  <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.25, wordBreak: 'break-word' }}>
                    {text}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color, fontWeight: 600, textTransform: 'capitalize' }}>
                  {e.actor}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {' '}
                  · {formatDateTime(e.createdAt)}
                </Typography>
              </Box>
            </Stack>
          )
        })}
      </Box>
    </Drawer>
  )
}
