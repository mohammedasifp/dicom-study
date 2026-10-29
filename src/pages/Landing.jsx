import { Box, Button, Stack, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'

export default function Landing({ onStart }) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        px: 3,
        background:
          'radial-gradient(1200px 600px at 50% -10%, #dfe8fb 0%, rgba(223,232,251,0) 60%), #f3f5f9',
      }}
    >
      <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 520 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #1d5fd1, #6d4bd8)',
            boxShadow: '0 10px 30px rgba(29,95,209,0.25)',
          }}
        >
          <AutoAwesomeRoundedIcon />
        </Box>
        <Stack spacing={1}>
          <Typography variant="h1" sx={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
            Radiology Report Co-Pilot
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1rem' }}>
            Review the AI-prepared draft next to the images, then sign off your own report.
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={onStart}
          sx={{ px: 4, py: 1.4, fontSize: '1rem', borderRadius: 2.5 }}
        >
          Start Reporting
        </Button>
        <Typography variant="caption" color="text.secondary">
          AI output is a draft for clinician review and is not a diagnosis.
        </Typography>
      </Stack>
    </Box>
  )
}
