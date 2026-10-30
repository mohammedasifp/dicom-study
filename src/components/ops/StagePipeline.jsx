import { Box, ButtonBase, Typography } from '@mui/material'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import { brand, colors, radius, shadows, typography } from '../../styles/tokens.js'

export default function StagePipeline({ stages, activeStage, onSelectStage }) {
  const { t } = useI18n()
  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0.5, overflowX: 'auto', pb: 0.25 }}>
      {stages.map((s, index) => {
        const active = activeStage === s.stage
        const alert = s.openExceptions > 0
        return (
          <Box key={s.stage} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: '1 1 0', minWidth: 170 }}>
            <ButtonBase
              onClick={() => onSelectStage(active ? null : s.stage)}
              aria-pressed={active}
              sx={{
                flex: 1,
                minWidth: 0,
                alignSelf: 'stretch',
                display: 'block',
                textAlign: 'left',
                p: 1.5,
                borderRadius: `${radius.lg}px`,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: active ? brand.oceanTeal : alert ? colors.danger.border : colors.border.default,
                boxShadow: active ? `0 0 0 1px ${brand.oceanTeal}` : shadows.card,
                '&:hover': { borderColor: brand.oceanTeal },
                '&:focus-visible': { outline: `2px solid ${colors.border.focus}`, outlineOffset: 2 },
              }}
            >
              <Typography sx={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>{t(`ops.stage.${s.stage}`)}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                <Typography
                  sx={{ fontSize: typography.size.xxl, fontWeight: typography.weight.bold, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums', color: alert ? colors.danger.main : 'text.primary' }}
                >
                  {s.openExceptions || 0}
                </Typography>
                <Typography sx={{ fontSize: typography.size.xs, color: alert ? colors.danger.main : colors.text.secondary }}>
                  {t('ops.stageExceptions', { count: s.openExceptions || 0 })}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
                {t('ops.stageCases', { count: s.count })} · {t(`ops.stageHint.${s.stage}`)}
              </Typography>
            </ButtonBase>
            {index < stages.length - 1 && <ChevronRightRoundedIcon sx={{ color: colors.text.muted, flexShrink: 0 }} />}
          </Box>
        )
      })}
    </Box>
  )
}
