import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useI18n } from '../i18n/I18nContext.js'
import { useAuth } from '../auth/AuthContext.js'
import { errorMessageKey } from '../api/errors.js'
import BrandMark from '../components/common/BrandMark.jsx'
import { brand, colors, typography } from '../styles/tokens.js'

const INVALID_CREDENTIAL_CODES = ['INVALID_CREDENTIALS', 'UNAUTHORIZED']

// Imaging-viewer reticle drawn behind the headline.
function Reticle({ sx }) {
  return (
    <Box component="svg" viewBox="0 0 640 640" fill="none" aria-hidden="true" sx={{ position: 'absolute', pointerEvents: 'none', ...sx }}>
      <g stroke={brand.softAqua}>
        <circle cx="320" cy="320" r="300" strokeOpacity=".10" />
        <circle cx="320" cy="320" r="230" strokeOpacity=".16" />
        <circle cx="320" cy="320" r="160" strokeOpacity=".24" strokeDasharray="4 10" />
        <circle cx="320" cy="320" r="90" strokeOpacity=".34" />
        <circle cx="320" cy="320" r="6" fill={brand.softAqua} fillOpacity=".6" stroke="none" />
        <path d="M320 10v120M320 510v120M10 320h120M510 320h120" strokeOpacity=".28" />
        <path d="M230 180h-50v50M410 180h50v50M230 460h-50v-50M410 460h50v-50" strokeOpacity=".5" strokeWidth="2" />
      </g>
    </Box>
  )
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 48,
    borderRadius: '10px',
    bgcolor: '#FBFDFD',
    fontSize: typography.size.md,
    '& fieldset': { borderWidth: 1.5, borderColor: colors.border.strong },
    '&.Mui-focused': { bgcolor: colors.background.paper, boxShadow: '0 0 0 4px rgba(13,148,136,0.14)' },
    '&.Mui-focused .MuiInputAdornment-positionStart': { color: brand.oceanTeal },
  },
  '& .MuiInputAdornment-positionStart': { color: colors.text.muted },
}

export default function LoginPage() {
  const { t } = useI18n()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const usernameMissing = touched && !username.trim()
  const passwordMissing = touched && !password

  const submit = async (e) => {
    e.preventDefault()
    setTouched(true)
    setError(null)
    if (!username.trim() || !password) return
    setSubmitting(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(INVALID_CREDENTIAL_CODES.includes(err?.code) ? 'login.invalid' : errorMessageKey(err))
      // The password is cleared for the retry; reset `touched` so the empty field isn't also flagged.
      setPassword('')
      setTouched(false)
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, gridTemplateRows: { xs: 'auto 1fr', md: '1fr' }, bgcolor: colors.background.paper }}>
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: colors.text.inverse,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 3, md: 8 },
          py: { xs: 3.5, md: 6 },
          background: `radial-gradient(circle at 78% 62%, rgba(94,234,212,0.16), transparent 42%),
            radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1.2px) 0 0 / 22px 22px,
            linear-gradient(160deg, ${brand.deepOceanTeal} 0%, #033B38 100%)`,
        }}
      >
        <Reticle sx={{ width: { xs: 340, md: 640 }, height: { xs: 340, md: 640 }, right: { xs: -110, md: -120 }, top: { xs: 0, md: '50%' }, transform: { md: 'translateY(-46%)' } }} />

        <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center', position: 'relative' }}>
          <BrandMark size={44} />
          <Box>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1.2 }}>{t('app.name')}</Typography>
            <Typography sx={{ fontSize: typography.size.sm, color: colors.text.inverseMuted }}>{t('worklist.title')}</Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: { xs: 5, md: 'auto' }, position: 'relative', maxWidth: 470 }}>
          <Box sx={{ width: { xs: 32, md: 44 }, height: 4, borderRadius: 4, bgcolor: brand.softAqua, mb: { xs: 1.75, md: 2.75 } }} />
          <Typography component="h1" sx={{ fontSize: { xs: '1.65rem', md: '2.5rem' }, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            {t('login.headlineStart')}{' '}
            <Box component="span" sx={{ color: brand.softAqua }}>
              {t('login.headlineEmphasis')}
            </Box>{' '}
            {t('login.headlineEnd')}
          </Typography>
        </Box>

        <Typography sx={{ display: { xs: 'none', md: 'block' }, mt: 6, fontSize: typography.size.xs, color: 'rgba(167,216,210,0.75)', position: 'relative' }}>
          {t('login.copyright', { year: new Date().getFullYear() })}
        </Typography>
      </Box>

      <Box component="main" sx={{ display: 'grid', placeItems: { xs: 'start center', md: 'center' }, p: { xs: 3, md: 4 } }}>
        <Stack component="form" noValidate onSubmit={submit} spacing={2.75} sx={{ width: '100%', maxWidth: 380 }}>
          <Box>
            <Typography component="h2" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, fontWeight: 700, color: brand.deepOceanTeal, letterSpacing: '-0.01em' }}>
              {t('login.title')}
            </Typography>
            <Typography sx={{ mt: 1, color: colors.text.secondary, fontSize: typography.size.md }}>{t('login.subtitle')}</Typography>
          </Box>

          {error && (
            <Alert severity="error" role="alert">
              {t(error)}
            </Alert>
          )}

          <Box>
            <Typography component="label" htmlFor="login-username" sx={{ display: 'block', mb: 1, fontSize: typography.size.sm, fontWeight: 600 }}>
              {t('login.username')}
            </Typography>
            <TextField
              id="login-username"
              fullWidth
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login.usernamePlaceholder')}
              error={usernameMissing}
              helperText={usernameMissing ? t('login.usernameRequired') : undefined}
              disabled={submitting}
              sx={fieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box>
            <Typography component="label" htmlFor="login-password" sx={{ display: 'block', mb: 1, fontSize: typography.size.sm, fontWeight: 600 }}>
              {t('login.password')}
            </Typography>
            <TextField
              id="login-password"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              error={passwordMissing}
              helperText={passwordMissing ? t('login.passwordRequired') : undefined}
              disabled={submitting}
              sx={fieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={t(showPassword ? 'login.hidePassword' : 'login.showPassword')}
                        aria-pressed={showPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            endIcon={submitting ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <ArrowForwardRoundedIcon />}
            sx={{
              mt: '28px !important',
              height: 50,
              borderRadius: '10px',
              fontSize: '0.95rem',
              background: `linear-gradient(180deg, #11A496 0%, ${brand.oceanTeal} 100%)`,
              boxShadow: '0 8px 20px rgba(13,148,136,0.28)',
              '&:hover': { background: brand.deepOceanTeal, boxShadow: '0 8px 20px rgba(6,78,74,0.3)' },
              '&.Mui-disabled': { color: colors.text.inverse, opacity: 0.8, background: brand.oceanTeal },
            }}
          >
            {t(submitting ? 'login.submitting' : 'login.submit')}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
