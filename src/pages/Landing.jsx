import { Box, Button, Stack, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { useI18n } from '../i18n/I18nContext.js'
import { brand } from '../styles/tokens.js'

export default function Landing({ onStart }) {
  const { t } = useI18n()
  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        px: 3,
        background:
          `radial-gradient(1200px 600px at 50% -10%, ${brand.lightTeal} 0%, rgba(153,246,228,0) 60%), ${brand.mintWhite}`,
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
            background: `linear-gradient(135deg, ${brand.oceanTeal}, ${brand.deepOceanTeal})`,
            boxShadow: '0 10px 30px rgba(6,78,74,0.25)',
          }}
        >
          <AutoAwesomeRoundedIcon />
        </Box>
        <Stack spacing={1}>
          <Typography variant="h1" sx={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>
            {t('landing.title')}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1rem' }}>
            {t('landing.subtitle')}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={onStart}
          sx={{ px: 4, py: 1.4, fontSize: '1rem', borderRadius: 2.5 }}
        >
          {t('landing.cta')}
        </Button>
        <Typography variant="caption" color="text.secondary">
          {t('landing.disclaimer')}
        </Typography>
      </Stack>
    </Box>
  )
}
