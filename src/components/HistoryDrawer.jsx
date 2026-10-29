import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { authorColors } from '../theme.js'
import { formatDateTime } from '../report/format.js'

export default function HistoryDrawer({ open, onClose, history, suggestions }) {
  const byId = Object.fromEntries(suggestions.map((s, i) => [s.id, { ...s, index: i + 1 }]))

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: 380 } } }}>
      <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Audit trail
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {[...history].reverse().map((e, i, arr) => {
          const color = e.actor === 'AI' ? authorColors.ai.main : authorColors.reviewer.main
          const s = e.suggestionId ? byId[e.suggestionId] : null
          return (
            <Stack key={e.id} direction="row" spacing={1.5}>
              <Stack sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, mt: 0.6 }} />
                {i < arr.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5 }} />}
              </Stack>
              <Box sx={{ pb: 2, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {e.action}
                  {s && (
                    <Typography component="span" variant="body2" color="text.secondary">
                      {' '}
                      · #{s.index} {s.observation}
                    </Typography>
                  )}
                </Typography>
                {e.detail && (
                  <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.25, wordBreak: 'break-word' }}>
                    {e.detail}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
                  {e.actor}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {' '}
                  · {formatDateTime(e.at)}
                </Typography>
              </Box>
            </Stack>
          )
        })}
      </Box>
    </Drawer>
  )
}
