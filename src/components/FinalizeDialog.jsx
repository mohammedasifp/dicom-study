import { useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

function Stat({ value, label, color }) {
  return (
    <Stack sx={{ alignItems: 'center', flex: 1, py: 1, borderRadius: 2, bgcolor: 'background.default' }}>
      <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  )
}

export default function FinalizeDialog({ open, counts, defaultReviewer, onClose, onConfirm }) {
  const [reviewer, setReviewer] = useState(defaultReviewer || 'Dr. ')
  const [attested, setAttested] = useState(false)
  const valid = reviewer.trim().length > 4 && attested

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Finalize reviewed draft</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Stat value={counts.accepted} label="Accepted" color="success.main" />
            <Stat value={counts.edited} label="Edited" color="info.main" />
            <Stat value={counts.discarded} label="Discarded" color="text.secondary" />
          </Stack>
          <TextField
            label="Reviewing radiologist"
            size="small"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            autoFocus
            fullWidth
          />
          <FormControlLabel
            sx={{ alignItems: 'flex-start', m: 0 }}
            control={<Checkbox size="small" checked={attested} onChange={(e) => setAttested(e.target.checked)} sx={{ p: 0.25, mr: 1 }} />}
            label={
              <Typography variant="body2">
                I have reviewed the images and every AI suggestion, and I take clinical responsibility for this report.
              </Typography>
            }
          />
          <Alert severity="info" variant="outlined" sx={{ py: 0, fontSize: '0.78rem' }}>
            The report is locked once finalized. You can reopen it for editing.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="success" disabled={!valid} onClick={() => onConfirm(reviewer.trim())}>
          Finalize
        </Button>
      </DialogActions>
    </Dialog>
  )
}
