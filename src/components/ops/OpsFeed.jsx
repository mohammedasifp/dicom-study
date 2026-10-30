import { Box, Paper, Stack, Typography } from '@mui/material'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatTime } from '../../i18n/format.js'
import { colors, shadows, typography } from '../../styles/tokens.js'

function feedText(item, t) {
  const p = item.payload || {}
  const type = p.type ? t(`ops.type.${p.type}`) : ''
  if (item.tag === 'CASE_STAGE_CHANGED') return t('ops.feed.CASE_STAGE_CHANGED', { patient: p.patient, stage: t(`ops.stage.${p.to}`) })
  return t(`ops.feed.${item.tag}`, { ...p, type })
}

const DOT = {
  OPS_EXCEPTION_RAISED: colors.danger.main,
  OPS_EXCEPTION_RESOLVED: colors.success.main,
  OPS_EXCEPTION_CLEARED: colors.success.main,
  OPS_EXCEPTION_ACKNOWLEDGED: colors.warning.main,
  OPS_EXCEPTION_ASSIGNED: colors.warning.main,
}

export default function OpsFeed({ feed }) {
  const { t, intlLocale } = useI18n()
  return (
    <Paper sx={{ border: 1, borderColor: 'divider', boxShadow: shadows.card, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Typography sx={{ px: 2, py: 1.25, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, borderBottom: 1, borderColor: 'divider' }}>
        {t('ops.feed.title')}
      </Typography>
      <Stack spacing={1} sx={{ p: 2, overflowY: 'auto', maxHeight: 520 }}>
        {!feed.length && <Typography sx={{ fontSize: typography.size.sm, color: colors.text.muted }}>{t('ops.feed.empty')}</Typography>}
        {feed.map((item) => (
          <Box key={item.id} sx={{ display: 'grid', gridTemplateColumns: '10px 44px 1fr', gap: 1, alignItems: 'baseline' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DOT[item.tag] || colors.neutral.main, alignSelf: 'center' }} />
            <Typography sx={{ fontSize: typography.size.xs, color: colors.text.muted, fontVariantNumeric: 'tabular-nums' }}>{formatTime(item.at, intlLocale)}</Typography>
            <Typography sx={{ fontSize: typography.size.xs }}>{feedText(item, t)}</Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  )
}
