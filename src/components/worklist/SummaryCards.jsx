import { Box, ButtonBase, Typography } from '@mui/material'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded'
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import { brand, colors, radius, shadows, typography } from '../../styles/tokens.js'

// Headline workload numbers. Each card opens the matching queue.
export default function SummaryCards({ stats, activeQueue, onSelectQueue }) {
  const { t } = useI18n()
  const cards = [
    { queue: 'stat', icon: <BoltRoundedIcon />, value: stats.statOpen, label: t('summary.stat'), detail: t('summary.statDetail', { count: stats.statUnassigned }), alert: stats.statOpen > 0, accent: colors.danger.main },
    { queue: 'overdue', icon: <AlarmRoundedIcon />, value: stats.overdue, label: t('summary.overdue'), detail: t('summary.overdueDetail'), alert: stats.overdue > 0, accent: colors.danger.main },
    { queue: 'mine', icon: <AssignmentIndRoundedIcon />, value: stats.myOpen, label: t('summary.mine'), detail: t('summary.mineDetail', { count: stats.myOverdue }), accent: brand.oceanTeal },
    { queue: 'completed', icon: <TaskAltRoundedIcon />, value: stats.completedToday, label: t('summary.completedToday'), detail: t('summary.completedDetail', { count: stats.myCompletedToday }), accent: colors.success.main },
  ]

  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' } }}>
      {cards.map((card) => {
        const active = activeQueue === card.queue
        return (
          <ButtonBase
            key={card.queue}
            onClick={() => onSelectQueue(card.queue)}
            aria-pressed={active}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: 1.5,
              alignItems: 'center',
              textAlign: 'left',
              p: { xs: 1.25, sm: 1.75 },
              borderRadius: `${radius.lg}px`,
              bgcolor: card.alert ? colors.danger.light : 'background.paper',
              border: '1px solid',
              borderColor: active ? card.accent : card.alert ? colors.danger.border : colors.border.default,
              boxShadow: active ? `0 0 0 1px ${card.accent}` : shadows.card,
              '&:hover': { borderColor: card.accent },
              '&:focus-visible': { outline: `2px solid ${colors.border.focus}`, outlineOffset: 2 },
            }}
          >
            <Box
              sx={{
                gridRow: 'span 2',
                width: 38,
                height: 38,
                borderRadius: `${radius.md}px`,
                display: 'grid',
                placeItems: 'center',
                color: card.accent,
                bgcolor: card.alert ? colors.background.paper : brand.mintWhite,
              }}
            >
              {card.icon}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: typography.size.xxl, fontWeight: typography.weight.bold, lineHeight: 1.1, color: card.alert ? colors.danger.dark : colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
                {card.value}
              </Typography>
              <Typography noWrap sx={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.text.primary }}>
                {card.label}
              </Typography>
            </Box>
            <Typography noWrap sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
              {card.detail}
            </Typography>
          </ButtonBase>
        )
      })}
    </Box>
  )
}
