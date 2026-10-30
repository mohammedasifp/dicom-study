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
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>{t(`ops.stage.${s.stage}`)}</Typography>
                {alert && (
                  <Box
                    component="span"
                    sx={{
                      px: 0.75,
                      borderRadius: `${radius.pill}px`,
                      bgcolor: colors.danger.main,
                      color: colors.text.inverse,
                      fontSize: typography.size.xs,
                      fontWeight: typography.weight.bold,
                      lineHeight: '18px',
                    }}
                    title={t('ops.stageFilter', { stage: t(`ops.stage.${s.stage}`) })}
                  >
                    {s.openExceptions}
                  </Box>
                )}
              </Box>
              <Typography sx={{ fontSize: typography.size.xxl, fontWeight: typography.weight.bold, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
                {s.count}
              </Typography>
              <Typography noWrap sx={{ fontSize: typography.size.xs, color: colors.text.secondary }}>
                {t(`ops.stageHint.${s.stage}`)}
              </Typography>
            </ButtonBase>
            {index < stages.length - 1 && <ChevronRightRoundedIcon sx={{ color: colors.text.muted, flexShrink: 0 }} />}
          </Box>
        )
      })}
    </Box>
  )
}
