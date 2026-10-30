import { useState } from 'react'
import { Box, Button, IconButton, ListItemText, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'

export default function ReviewNavigator({ counts, discarded, readOnly, onPrev, onNext, onRestore, onFinalize }) {
  const [anchor, setAnchor] = useState(null)

  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      {discarded.length > 0 && (
        <>
          <Tooltip title="Discarded suggestions">
            <Button
              size="small"
              color="inherit"
              startIcon={<DeleteSweepOutlinedIcon />}
              onClick={(e) => setAnchor(e.currentTarget)}
              sx={{ color: 'text.secondary', height: 30, px: 1 }}
            >
              {discarded.length}
            </Button>
          </Tooltip>
          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { mt: 0.5, width: 340 } } }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ px: 2, display: 'block' }}>
              Discarded suggestions
            </Typography>
            {discarded.map(({ suggestion, index }) => (
              <MenuItem key={suggestion.id} disabled={readOnly} sx={{ alignItems: 'flex-start', gap: 1.5, whiteSpace: 'normal' }}>
                <ListItemText
                  primary={`${index}. ${suggestion.observation}`}
                  secondary={suggestion.text}
                  slotProps={{
                    primary: { sx: { fontSize: '0.8rem', fontWeight: 600 } },
                    secondary: { sx: { fontSize: '0.74rem', textDecoration: 'line-through' } },
                  }}
                />
                <Button
                  size="small"
                  startIcon={<ReplayRoundedIcon />}
                  onClick={() => {
                    onRestore(suggestion)
                    setAnchor(null)
                  }}
                  sx={{ flexShrink: 0, height: 28 }}
                >
                  Restore
                </Button>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {counts.pending > 0 ? (
        <Stack
          direction="row"
          sx={{ alignItems: 'center', height: 30, pl: 1.25, borderRadius: 2, bgcolor: '#f5f3ff', border: '1px solid #ddd6fe' }}
        >
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#8b5cf6', mr: 0.75 }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 650, color: '#5b21b6', mr: 0.5, whiteSpace: 'nowrap' }}>
            {counts.pending} to review
          </Typography>
          <Tooltip title="Previous (Alt+↑)">
            <IconButton size="small" onClick={onPrev} sx={{ width: 26, height: 26, color: '#6d28d9' }}>
              <KeyboardArrowUpRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Next (Alt+↓)">
            <IconButton size="small" onClick={onNext} sx={{ width: 26, height: 26, color: '#6d28d9', mr: 0.25 }}>
              <KeyboardArrowDownRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : readOnly ? (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', height: 30, px: 1.25, borderRadius: 2, bgcolor: 'success.light', border: '1px solid #bbf7d0' }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 650, color: 'success.dark', whiteSpace: 'nowrap' }}>
            Finalized
          </Typography>
        </Stack>
      ) : (
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<CheckCircleRoundedIcon />}
          onClick={onFinalize}
          sx={{ height: 30, whiteSpace: 'nowrap' }}
        >
          All reviewed · Finalize
        </Button>
      )}
    </Stack>
  )
}
