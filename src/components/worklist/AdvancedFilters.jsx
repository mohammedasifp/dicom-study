import { Box, Collapse, MenuItem, TextField } from '@mui/material'
import { useI18n } from '../../i18n/I18nContext.js'
import MultiSelectField from '../common/MultiSelectField.jsx'
import { AI_READINESS_VALUES, PRIORITIES, REVIEW_STATUSES, UNASSIGNED } from '../../constants/study.js'
import { DATE_RANGE } from '../../worklist/filters.js'
import { typography } from '../../styles/tokens.js'

// Less frequent filters, collapsed by default.
export default function AdvancedFilters({ open, filters, onFiltersChange, referringDoctors, radiologists, currentUserId }) {
  const { t } = useI18n()
  const set = (patch) => onFiltersChange({ ...filters, ...patch })
  const any = t('filters.any')

  const assigneeOptions = [
    { value: UNASSIGNED, label: t('assignment.unassigned') },
    ...radiologists.map((r) => ({ value: r.id, label: r.id === currentUserId ? `${r.name} (${t('assignment.you')})` : r.name })),
  ]

  return (
    <Collapse in={open} unmountOnExit>
      <Box
        id="worklist-advanced-filters"
        sx={{
          display: 'grid',
          gap: 1.5,
          pt: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' },
        }}
      >
        <MultiSelectField
          id="filter-priority"
          label={t('filters.priority')}
          anyLabel={any}
          value={filters.priorities}
          onChange={(priorities) => set({ priorities })}
          options={PRIORITIES.map((p) => ({ value: p, label: t(`priority.${p}`) }))}
        />
        <MultiSelectField
          id="filter-ai-status"
          label={t('filters.aiStatus')}
          anyLabel={any}
          value={filters.aiReadiness}
          onChange={(aiReadiness) => set({ aiReadiness })}
          options={AI_READINESS_VALUES.map((v) => ({ value: v, label: t(`aiReport.${v}`) }))}
        />
        <MultiSelectField
          id="filter-review-status"
          label={t('filters.reviewStatus')}
          anyLabel={any}
          value={filters.reviewStatuses}
          onChange={(reviewStatuses) => set({ reviewStatuses })}
          options={REVIEW_STATUSES.map((s) => ({ value: s, label: t(`reviewStatus.${s}`) }))}
        />
        <MultiSelectField
          id="filter-referring"
          label={t('filters.referringDoctor')}
          anyLabel={any}
          value={filters.referringDoctors}
          onChange={(referringDoctors) => set({ referringDoctors })}
          options={referringDoctors.map((d) => ({ value: d, label: d }))}
        />
        <MultiSelectField
          id="filter-assignee"
          label={t('filters.assignedTo')}
          anyLabel={any}
          value={filters.assignees}
          onChange={(assignees) => set({ assignees })}
          options={assigneeOptions}
        />
        <TextField
          select
          size="small"
          label={t('filters.studyDate')}
          value={filters.dateRange}
          onChange={(e) => set({ dateRange: e.target.value })}
          sx={{ '& .MuiInputBase-root': { fontSize: typography.size.sm, bgcolor: 'background.paper' } }}
        >
          {Object.values(DATE_RANGE).map((r) => (
            <MenuItem key={r} value={r}>
              {t(`dateRange.${r}`)}
            </MenuItem>
          ))}
        </TextField>
        {filters.dateRange === DATE_RANGE.CUSTOM && (
          <>
            <TextField
              type="date"
              size="small"
              label={t('filters.dateFrom')}
              value={filters.dateFrom}
              onChange={(e) => set({ dateFrom: e.target.value })}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filters.dateTo || undefined } }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'background.paper' } }}
            />
            <TextField
              type="date"
              size="small"
              label={t('filters.dateTo')}
              value={filters.dateTo}
              onChange={(e) => set({ dateTo: e.target.value })}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: filters.dateFrom || undefined } }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'background.paper' } }}
            />
          </>
        )}
      </Box>
    </Collapse>
  )
}
