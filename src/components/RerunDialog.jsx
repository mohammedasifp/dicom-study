import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { listModels, retryAnalysis } from '../api/backend.js'

export default function RerunDialog({ open, uid, modality, currentModelId, replacesDraft, onClose, onStarted }) {
  const [models, setModels] = useState(null)
  const [model, setModel] = useState('')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    let alive = true
    listModels()
      .then((list) => {
        if (!alive) return
        const usable = list.filter((m) => !m.modalities || m.modalities.includes(modality))
        setModels(usable)
        setModel(usable.some((m) => m.id === currentModelId) ? currentModelId : (usable[0] || {}).id || '')
      })
      .catch((err) => alive && setError(`Could not load the model list: ${err.message}`))
    return () => {
      alive = false
    }
  }, [open, modality, currentModelId])

  const start = async () => {
    setBusy(true)
    setError(null)
    try {
      await retryAnalysis(uid, { model: model || undefined, prompt: prompt.trim() || undefined })
      onStarted()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Run the AI analysis again</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {replacesDraft && (
            <Alert severity="warning" variant="outlined" sx={{ fontSize: '0.78rem', py: 0 }}>
              Run the AI now? When it completes, its draft replaces the current draft, including your edits and review decisions. You can roll back to the current draft once.
            </Alert>
          )}
          <TextField
            select
            size="small"
            label="Model from the model zoo"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!models || !models.length}
            helperText={models && !models.length ? `No model supports ${modality}` : ' '}
          >
            {(models || []).map((m) => (
              <MenuItem key={m.id} value={m.id}>
                <Stack>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>{m.name}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {m.id} · v{m.version}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Extra instruction (optional)"
            placeholder="e.g. Focus on the left frontal lobe."
            multiline
            minRows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 2000))}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={start} disabled={busy || (models && !models.length)}>
          {busy ? 'Starting…' : 'Run AI'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
