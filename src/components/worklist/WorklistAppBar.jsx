import { Avatar, Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import LanguageSwitcher from '../common/LanguageSwitcher.jsx'
import { brand, colors, layout, radius, typography } from '../../styles/tokens.js'

export default function WorklistAppBar({ currentUser, refreshing, onRefresh, onHome }) {
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
        <Box sx={{ width: 32, height: 32, borderRadius: `${radius.md}px`, bgcolor: brand.oceanTeal, display: 'grid', placeItems: 'center', fontWeight: typography.weight.bold, fontSize: typography.size.sm, color: brand.mintWhite, border: `1px solid ${brand.softAqua}` }}>
          {t('app.logoMark')}
        </Box>
        <Box sx={{ textAlign: 'left' }}>
          <Typography sx={{ fontSize: typography.size.lg, fontWeight: typography.weight.bold, letterSpacing: '0.06em', lineHeight: 1.1 }}>{t('app.name')}</Typography>
          <Typography sx={{ fontSize: typography.size.xs, color: colors.text.inverseMuted, lineHeight: 1.2, display: { xs: 'none', sm: 'block' } }}>
            {t('worklist.title')}
          </Typography>
        </Box>
      </Box>

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
    </Stack>
  )
}
