import { Box, Chip, List, ListItemButton, ListItemText, ListSubheader, Stack } from '@mui/material'
import { useI18n } from '../../i18n/I18nContext.js'
import { QUEUES, QUEUE_GROUPS } from '../../worklist/queues.js'
import { brand, colors, radius, typography } from '../../styles/tokens.js'

const TONE = {
  danger: { fg: colors.text.inverse, bg: colors.danger.main },
  warning: { fg: colors.text.inverse, bg: colors.warning.main },
}

function CountBadge({ count, tone, selected }) {
  const strong = count > 0 && TONE[tone]
  return (
    <Box
      component="span"
      sx={{
        minWidth: 24,
        height: 20,
        px: 0.75,
        display: 'inline-grid',
        placeItems: 'center',
        borderRadius: `${radius.pill}px`,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.bold,
        fontVariantNumeric: 'tabular-nums',
        color: strong ? strong.fg : selected ? brand.deepOceanTeal : colors.text.secondary,
        bgcolor: strong ? strong.bg : selected ? brand.lightTeal : colors.neutral.light,
      }}
    >
      {count}
    </Box>
  )
}

// Quick-access views with live counts. variant 'sidebar' (desktop) or 'chips' (narrow screens).
export default function QueueNav({ variant = 'sidebar', value, counts, onChange }) {
  const { t } = useI18n()

  if (variant === 'chips') {
    return (
      <Stack direction="row" spacing={0.75} role="tablist" aria-label={t('queues.label')} sx={{ overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
        {QUEUES.filter((q) => !q.summaryCard).map((q) => {
          const selected = value === q.id
          return (
            <Chip
              key={q.id}
              role="tab"
              aria-selected={selected}
              clickable
              onClick={() => onChange(q.id)}
              label={
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <span>{t(`queues.${q.id}`)}</span>
                  <CountBadge count={counts[q.id]} tone={q.tone} selected={selected} />
                </Stack>
              }
              variant={selected ? 'filled' : 'outlined'}
              sx={{
                flexShrink: 0,
                bgcolor: selected ? brand.mintWhite : 'background.paper',
                borderColor: selected ? brand.oceanTeal : colors.border.default,
                color: selected ? brand.deepOceanTeal : colors.text.primary,
              }}
            />
          )
        })}
      </Stack>
    )
  }

  return (
    <Box component="nav" aria-label={t('queues.label')} sx={{ py: 1 }}>
      {QUEUE_GROUPS.map((group) => (
        <List
          key={group}
          dense
          disablePadding
          subheader={
            <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '32px', fontSize: typography.size.xxs, fontWeight: typography.weight.bold, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.muted }}>
              {t(`queues.groups.${group}`)}
            </ListSubheader>
          }
          sx={{ px: 1, mb: 1 }}
        >
          {QUEUES.filter((q) => q.group === group).map((q) => {
            const selected = value === q.id
            return (
              <ListItemButton
                key={q.id}
                selected={selected}
                aria-current={selected ? 'page' : undefined}
                onClick={() => onChange(q.id)}
                sx={{
                  borderRadius: `${radius.md}px`,
                  mb: 0.25,
                  '&.Mui-selected': { bgcolor: brand.mintWhite, color: brand.deepOceanTeal, boxShadow: `inset 3px 0 0 ${brand.oceanTeal}` },
                  '&.Mui-selected:hover': { bgcolor: colors.background.hover },
                }}
              >
                <ListItemText
                  primary={t(`queues.${q.id}`)}
                  slotProps={{ primary: { sx: { fontSize: typography.size.sm, fontWeight: selected ? typography.weight.semibold : typography.weight.medium } } }}
                />
                <CountBadge count={counts[q.id]} tone={q.tone} selected={selected} />
              </ListItemButton>
            )
          })}
        </List>
      ))}
    </Box>
  )
}
