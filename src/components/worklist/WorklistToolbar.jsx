import { Badge, Button, IconButton, InputAdornment, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import { MODALITIES } from '../../constants/study.js'
import { SORT_DIRECTION } from '../../worklist/sorting.js'
import { brand, colors, typography } from '../../styles/tokens.js'

const MOBILE_SORTS = ['triage', 'waiting', 'studyDateTime', 'patient', 'status']

// Always-visible controls: search, modality toggles, advanced-filter toggle, clear, result count.
export default function WorklistToolbar({
  filters,
  onFiltersChange,
  advancedCount,
  advancedOpen,
  onToggleAdvanced,
  canClear,
  onClear,
  resultCount,
  sort,
  onSortSelect,
  compact,
}) {
  const { t } = useI18n()
  const set = (patch) => onFiltersChange({ ...filters, ...patch })

  return (
    <Stack spacing={1.25}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ alignItems: { md: 'center' } }}>
        <TextField
          size="small"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder={t('filters.searchPlaceholder')}
          slotProps={{
            htmlInput: { 'aria-label': t('filters.search') },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label={t('filters.clearSearch')} onClick={() => set({ search: '' })}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: { md: '1 1 320px' }, maxWidth: { md: 440 }, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
        />

        <ToggleButtonGroup
          size="small"
          value={filters.modalities}
          onChange={(_e, value) => set({ modalities: value })}
          aria-label={t('filters.modality')}
          sx={{
            flexWrap: 'wrap',
            '& .MuiToggleButton-root': {
              px: 1.5,
              height: 34,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              color: colors.text.secondary,
              '&.Mui-selected': { bgcolor: brand.mintWhite, color: brand.deepOceanTeal, borderColor: brand.oceanTeal },
            },
          }}
        >
          {MODALITIES.map((m) => (
            <ToggleButton key={m} value={m} aria-label={t(`modality.${m}`)}>
              {t(`modalityShort.${m}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
          <Badge badgeContent={advancedCount} color="primary" overlap="rectangular">
            <Button
              size="small"
              variant={advancedOpen ? 'contained' : 'outlined'}
              startIcon={<TuneRoundedIcon />}
              onClick={onToggleAdvanced}
              aria-expanded={advancedOpen}
              aria-controls="worklist-advanced-filters"
            >
              {t('filters.more')}
            </Button>
          </Badge>
          {canClear && (
            <Button size="small" color="inherit" startIcon={<FilterAltOffRoundedIcon />} onClick={onClear} sx={{ color: colors.text.secondary }}>
              {t('filters.clear')}
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: { md: 'auto' } }}>
          {compact && (
            <TextField
              select
              size="small"
              value={MOBILE_SORTS.includes(sort.field) ? sort.field : 'triage'}
              onChange={(e) => onSortSelect({ field: e.target.value, direction: e.target.value === 'waiting' ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC })}
              label={t('sort.label')}
              sx={{ minWidth: 180, flex: 1 }}
            >
              {MOBILE_SORTS.map((f) => (
                <MenuItem key={f} value={f}>
                  {t(`sort.${f}`)}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Typography role="status" sx={{ fontSize: typography.size.sm, color: colors.text.secondary, whiteSpace: 'nowrap' }}>
            {t('worklist.resultCount', { count: resultCount })}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
