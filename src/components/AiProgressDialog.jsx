import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'

export default function AiProgressDialog({ open, phase, ai, onClose, onRerun }) {
  const declined = phase === 'failed' && ai && ai.failureReason === 'OUT_OF_SCOPE'
  return (
    <Dialog open={open} maxWidth="xs" fullWidth onClose={phase === 'failed' ? onClose : undefined}>
      <DialogContent>
        {phase === 'processing' ? (
          <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 2 }}>
            <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={56} thickness={2.5} sx={{ color: '#8b5cf6' }} />
              <AutoAwesomeRoundedIcon sx={{ position: 'absolute', color: '#7c3aed' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>The AI is analysing this study</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>
              {ai && ai.requestedModel ? `Model: ${ai.requestedModel}. ` : ''}
              The draft loads here when it is ready. If the AI fails, you can report manually.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', pt: 2 }}>
            {declined ? <BlockRoundedIcon sx={{ fontSize: 44, color: 'warning.main' }} /> : <ErrorOutlineRoundedIcon sx={{ fontSize: 44, color: 'error.main' }} />}
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
              {declined ? 'The AI declined this instruction' : 'The AI analysis failed'}
            </Typography>
            {ai && ai.error && (
              <Alert severity={declined ? 'warning' : 'error'} variant="outlined" sx={{ textAlign: 'left', width: '100%' }}>
                {ai.error}
              </Alert>
            )}
            <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>Your current draft is unchanged. You can report manually.</Typography>
          </Stack>
        )}
      </DialogContent>
      {phase === 'failed' && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={onRerun}>
            Run the AI again
          </Button>
          <Button variant="contained" onClick={onClose}>
            Report manually
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
