import { Box, Paper, Stack, Typography } from '@mui/material'
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatTime } from '../../i18n/format.js'
import Pill from '../common/Pill.jsx'
import { brand, colors, shadows, table, typography } from '../../styles/tokens.js'

function feedText(item, t) {
  const p = item.payload || {}
  const type = p.type ? t(`ops.type.${p.type}`) : ''
  if (item.tag === 'CASE_STAGE_CHANGED') return t('ops.feed.CASE_STAGE_CHANGED', { patient: p.patient, stage: t(`ops.stage.${p.to}`) })
  return t(`ops.feed.${item.tag}`, { ...p, type })
}

// Icon and colour per event kind; anything unknown falls back to the neutral stage-change look.
const KIND = {
  CASE_STAGE_CHANGED: { icon: <SwapHorizRoundedIcon />, fg: brand.oceanTeal, bg: brand.mintWhite },
  OPS_EXCEPTION_RAISED: { icon: <ReportProblemOutlinedIcon />, fg: colors.danger.main, bg: colors.danger.light },
  OPS_EXCEPTION_ACKNOWLEDGED: { icon: <VisibilityOutlinedIcon />, fg: colors.warning.dark, bg: colors.warning.light },
  OPS_EXCEPTION_ASSIGNED: { icon: <PersonAddAlt1OutlinedIcon />, fg: colors.info.dark, bg: colors.info.light },
  OPS_EXCEPTION_RESOLVED: { icon: <TaskAltRoundedIcon />, fg: colors.success.dark, bg: colors.success.light },
  OPS_EXCEPTION_CLEARED: { icon: <TaskAltRoundedIcon />, fg: colors.success.dark, bg: colors.success.light },
}

// Workflow stages left to right; later stages get a stronger teal.
const STAGE_TONE = {
  REGISTERED: { fg: colors.neutral.dark, bg: colors.neutral.light, border: colors.neutral.border },
  ACQUIRED: { fg: colors.info.dark, bg: colors.info.light, border: colors.info.border },
  IN_PACS: { fg: colors.ai.main, bg: colors.ai.light, border: colors.ai.border },
  REPORTED: { fg: brand.deepOceanTeal, bg: brand.mintWhite, border: brand.softAqua },
  DELIVERED: { fg: colors.success.dark, bg: colors.success.light, border: colors.success.border },
}

function FeedText({ item }) {
  const { t } = useI18n()
  const p = item.payload || {}
  if (item.tag === 'CASE_STAGE_CHANGED' && p.to) {
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, flexWrap: 'wrap', rowGap: 0.5 }}>
        <Typography noWrap sx={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, minWidth: 0 }}>
          {p.patient}
        </Typography>
        <Pill tone={STAGE_TONE[p.to] || STAGE_TONE.REGISTERED}>{t(`ops.stage.${p.to}`)}</Pill>
      </Stack>
    )
  }
  return <Typography sx={{ fontSize: typography.size.sm }}>{feedText(item, t)}</Typography>
}

export default function OpsFeed({ feed }) {
  const { t, intlLocale } = useI18n()
  return (
    <Paper sx={{ border: 1, borderColor: 'divider', boxShadow: shadows.card, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2, py: 1.25, bgcolor: table.headerBg, color: table.headerText }}>
        <Typography sx={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, flex: 1 }}>{t('ops.feed.title')}</Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: brand.softAqua,
              animation: 'opsFeedPulse 1.6s ease-in-out infinite',
              '@keyframes opsFeedPulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />
          <Typography sx={{ fontSize: typography.size.xs, color: table.headerMuted, fontVariantNumeric: 'tabular-nums' }}>
            {t('ops.feed.live', { count: feed.length })}
          </Typography>
        </Stack>
      </Stack>
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', overflowY: 'auto', maxHeight: 520 }}>
        {!feed.length && (
          <Typography component="li" sx={{ p: 2, fontSize: typography.size.sm, color: colors.text.muted }}>
            {t('ops.feed.empty')}
          </Typography>
        )}
        {feed.map((item) => {
          const kind = KIND[item.tag] || KIND.CASE_STAGE_CHANGED
          return (
            <Box
              component="li"
              key={item.id}
              sx={{
                display: 'grid',
                // Time first: it is what staff scan for, so it sits right next to the event instead of at the far edge.
                gridTemplateColumns: '64px 30px minmax(0, 1fr)',
                columnGap: 1.5,
                alignItems: 'center',
                px: 2,
                py: 1,
                borderBottom: `1px solid ${table.gridLine}`,
                '&:last-of-type': { borderBottom: 0 },
                '&:hover': { bgcolor: table.rowHoverBg },
              }}
            >
              <Typography sx={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: colors.text.secondary, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {formatTime(item.at, intlLocale)}
              </Typography>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', color: kind.fg, bgcolor: kind.bg, '& svg': { fontSize: 17 } }}>
                {kind.icon}
              </Box>
              <FeedText item={item} />
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}
