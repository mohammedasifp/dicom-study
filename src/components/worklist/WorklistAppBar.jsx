import { Avatar, Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import LanguageSwitcher from '../common/LanguageSwitcher.jsx'
import BrandMark from '../common/BrandMark.jsx'
import { brand, colors, layout, typography } from '../../styles/tokens.js'

const SECTIONS = ['worklist', 'operations']

export default function WorklistAppBar({ currentUser, refreshing, onRefresh, onHome, section = 'worklist', onNavigate, onLogout }) {
  const { t } = useI18n()
  return (
    <Stack
      component="header"
      direction="row"
      spacing={1.5}
      sx={{ alignItems: 'center', px: { xs: 1.5, md: 2.5 }, height: layout.appBarHeight, flexShrink: 0, bgcolor: brand.deepOceanTeal, color: colors.text.inverse }}
    >
      <Box
        component="button"
        type="button"
        onClick={onHome}
        aria-label={t('app.home')}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, border: 0, p: 0, bgcolor: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit' }}
      >
        <BrandMark size={34} />
        <Box sx={{ textAlign: 'left' }}>
          <Typography sx={{ fontSize: typography.size.lg, fontWeight: typography.weight.bold, letterSpacing: '0.06em', lineHeight: 1.1 }}>{t('app.name')}</Typography>
          <Typography sx={{ fontSize: typography.size.xs, color: colors.text.inverseMuted, lineHeight: 1.2, display: { xs: 'none', sm: 'block' } }}>
            {t(section === 'operations' ? 'ops.title' : 'worklist.title')}
          </Typography>
        </Box>
      </Box>

      {onNavigate && (
        <Stack component="nav" direction="row" spacing={0.5} sx={{ pl: { xs: 0.5, md: 2 } }}>
          {SECTIONS.map((id) => (
            <Button
              key={id}
              size="small"
              onClick={() => onNavigate(id)}
              aria-current={section === id ? 'page' : undefined}
              sx={{
                height: 32,
                px: 1.25,
                color: section === id ? brand.deepOceanTeal : brand.lightTeal,
                bgcolor: section === id ? brand.softAqua : 'transparent',
                fontWeight: typography.weight.semibold,
                '&:hover': { bgcolor: section === id ? brand.lightTeal : 'rgba(94,234,212,0.08)' },
              }}
            >
              {t(`ops.nav.${id}`)}
            </Button>
          ))}
        </Stack>
      )}

      <Box sx={{ flex: 1 }} />

      <LanguageSwitcher sx={{ '& .MuiInputBase-root': { color: colors.text.inverse, height: 32 }, '& fieldset': { borderColor: brand.oceanTeal } }} />

      <Tooltip title={t('worklist.refresh')}>
        <span>
          <IconButton size="small" onClick={onRefresh} disabled={refreshing} aria-label={t('worklist.refresh')} sx={{ color: brand.lightTeal, border: `1px solid ${brand.oceanTeal}` }}>
            {refreshing ? <CircularProgress size={16} sx={{ color: brand.lightTeal }} /> : <RefreshRoundedIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>

      {currentUser && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: brand.softAqua, color: brand.deepOceanTeal, fontSize: typography.size.sm, fontWeight: typography.weight.bold }}>
            {currentUser.initials}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, lineHeight: 1.2 }}>{currentUser.name}</Typography>
            <Typography sx={{ fontSize: typography.size.xs, color: colors.text.inverseMuted, lineHeight: 1.2 }}>
              {t('worklist.userRole', { subspecialty: currentUser.subspecialty })}
            </Typography>
          </Box>
        </Stack>
      )}

      <Tooltip title={t('auth.logout')}>
        <Button
          size="small"
          variant="outlined"
          onClick={onLogout}
          startIcon={<LogoutRoundedIcon />}
          aria-label={t('auth.logout')}
          sx={{
            color: brand.lightTeal,
            borderColor: brand.oceanTeal,
            minWidth: 0,
            height: 32,
            px: { xs: 0.75, sm: 1.25 },
            '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.75 }, ml: { xs: 0, sm: -0.25 } },
            '&:hover': { borderColor: brand.softAqua, bgcolor: 'rgba(94,234,212,0.08)' },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {t('auth.logout')}
          </Box>
        </Button>
      </Tooltip>
    </Stack>
  )
}
