import { Box, Skeleton, Stack } from '@mui/material'
import { useI18n } from '../../i18n/I18nContext.js'
import { table } from '../../styles/tokens.js'

// Placeholder rows shown while the worklist loads; mirrors the table / card layout to avoid layout shift.
export default function WorklistSkeleton({ rows = 8, compact }) {
  const { t } = useI18n()
  return (
    <Box role="status" aria-busy="true" aria-label={t('worklist.loading')} sx={{ p: compact ? 1 : 0 }}>
      {Array.from({ length: rows }, (_, i) =>
        compact ? (
          <Skeleton key={i} variant="rounded" height={150} sx={{ mb: 1 }} />
        ) : (
          <Stack key={i} direction="row" spacing={2} sx={{ alignItems: 'center', px: 2, height: table.rowHeight, borderBottom: `1px solid ${table.gridLine}` }}>
            <Skeleton variant="rounded" width={64} height={22} />
            <Box sx={{ flex: 1.2 }}>
              <Skeleton width="70%" />
              <Skeleton width="45%" height={14} />
            </Box>
            <Skeleton variant="rounded" width={34} height={22} />
            <Box sx={{ flex: 1.4 }}>
              <Skeleton width="80%" />
              <Skeleton width="35%" height={14} />
            </Box>
            <Skeleton width={70} />
            <Skeleton variant="rounded" width={96} height={22} />
            <Skeleton variant="rounded" width={140} height={32} />
          </Stack>
        ),
      )}
    </Box>
  )
}
