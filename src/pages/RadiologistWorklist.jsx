import { useMemo, useState } from 'react'
import { Box, Button, Chip, Paper, Stack, TablePagination, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useI18n } from '../i18n/I18nContext.js'
import { useWorklist } from '../hooks/useWorklist.js'
import { useNow } from '../hooks/useNow.js'
import { useSessionState } from '../hooks/useSessionState.js'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'
import { errorMessageKey } from '../api/errors.js'
import { DEFAULT_QUEUE, countQueues, filterByQueue } from '../worklist/queues.js'
import { EMPTY_FILTERS, advancedFilterCount, applyFilters, hasActiveFilters, uniqueSorted } from '../worklist/filters.js'
import { TRIAGE_SORT, nextSort, sortStudies } from '../worklist/sorting.js'
import { worklistStats } from '../worklist/stats.js'
import WorklistAppBar from '../components/worklist/WorklistAppBar.jsx'
import QueueNav from '../components/worklist/QueueNav.jsx'
import SummaryCards from '../components/worklist/SummaryCards.jsx'
import WorklistToolbar from '../components/worklist/WorklistToolbar.jsx'
import AdvancedFilters from '../components/worklist/AdvancedFilters.jsx'
import StudyTable from '../components/worklist/StudyTable.jsx'
import StudyCardList from '../components/worklist/StudyCardList.jsx'
import WorklistSkeleton from '../components/worklist/WorklistSkeleton.jsx'
import StateMessage from '../components/common/StateMessage.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import { colors, layout, shadows } from '../styles/tokens.js'

const ROWS_PER_PAGE = [25, 50, 100]
const DEFAULT_VIEW = { queue: DEFAULT_QUEUE, filters: EMPTY_FILTERS, sort: TRIAGE_SORT, rowsPerPage: ROWS_PER_PAGE[0], advancedOpen: false }

export default function RadiologistWorklist({ onOpenStudy, onHome }) {
  const { t } = useI18n()
  const theme = useTheme()
  // The full-width table needs ~1150px; narrower screens get the card list and the queue chips.
  const compact = useMediaQuery(theme.breakpoints.down('lg'))
  const showSidebar = useMediaQuery(theme.breakpoints.up('xl'))
  const now = useNow()
  const worklist = useWorklist()
  const [view, setView] = useSessionState('svaim.worklist.view', DEFAULT_VIEW)
  const [page, setPage] = useState(0)
  const [pendingAssign, setPendingAssign] = useState(null)
  // Search text can contain patient identifiers, so it is kept in memory only (not in sessionStorage).
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 250)

  const filters = useMemo(() => ({ ...EMPTY_FILTERS, ...view.filters, search }), [view.filters, search])
  const userId = worklist.currentUser?.id
  const { studies, radiologistsById } = worklist

  const updateView = (patch, resetPage = true) => {
    setView((v) => ({ ...v, ...patch }))
    if (resetPage) setPage(0)
  }

  const setFilters = (next) => {
    if (next.search !== search) setSearch(next.search)
    updateView({ filters: { ...next, search: '' } })
  }

  // Taking a study away from a colleague needs confirmation; everything else applies immediately.
  const requestAssign = (studyId, radiologistId) => {
    const study = studies.find((s) => s.id === studyId)
    if (study?.assignedTo && study.assignedTo !== userId && study.assignedTo !== radiologistId) {
      setPendingAssign({ study, radiologistId })
      return
    }
    worklist.assign(studyId, radiologistId)
  }

  const derived = useMemo(() => {
    // Unassigned (no name) sorts after every radiologist.
    const ctx = { userId, now, radiologistName: (id) => radiologistsById[id]?.name || '￿' }
    const filtered = applyFilters(studies, { ...filters, search: debouncedSearch }, ctx)
    return {
      // Queue counts honour the active filters so they always match what a click will show.
      counts: countQueues(filtered, ctx),
      stats: worklistStats(studies, ctx),
      rows: sortStudies(filterByQueue(filtered, view.queue, ctx), view.sort, ctx),
      referringDoctors: uniqueSorted(studies.map((s) => s.referringDoctor)),
    }
  }, [studies, filters, debouncedSearch, view.queue, view.sort, userId, now, radiologistsById])

  const pageCount = Math.max(1, Math.ceil(derived.rows.length / view.rowsPerPage))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = derived.rows.slice(safePage * view.rowsPerPage, (safePage + 1) * view.rowsPerPage)
  const canClear = hasActiveFilters(filters) || view.queue !== DEFAULT_QUEUE

  const clearAll = () => {
    setSearch('')
    updateView({ filters: EMPTY_FILTERS, queue: DEFAULT_QUEUE })
  }

  const listProps = {
    studies: pageRows,
    now,
    radiologists: worklist.radiologists,
    radiologistsById,
    currentUserId: userId,
    busyIds: worklist.busyIds,
    onOpen: (study) => onOpenStudy(study.id),
    onAssign: requestAssign,
  }

  let content
  if (worklist.status === 'loading') content = <WorklistSkeleton compact={compact} />
  else if (worklist.status === 'error')
    content = (
      <StateMessage
        variant="error"
        title={t('worklist.loadError')}
        description={t(errorMessageKey(worklist.error))}
        action={<Button variant="contained" onClick={worklist.refresh}>{t('common.retry')}</Button>}
      />
    )
  else if (!derived.rows.length)
    content = (
      <StateMessage
        title={t('worklist.emptyTitle')}
        description={canClear ? t('worklist.emptyFiltered') : t('worklist.emptyQueue')}
        action={canClear && <Button variant="outlined" onClick={clearAll}>{t('filters.clear')}</Button>}
      />
    )
  else content = compact ? <StudyCardList {...listProps} /> : <StudyTable {...listProps} sort={view.sort} onSortChange={(field) => updateView({ sort: nextSort(view.sort, field) }, false)} />

  return (
    <Stack sx={{ height: '100%', bgcolor: 'background.default' }}>
      <WorklistAppBar currentUser={worklist.currentUser} refreshing={worklist.refreshing} onRefresh={worklist.refresh} onHome={onHome} />

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {showSidebar && (
          <Box component="aside" sx={{ width: layout.sidebarWidth, flexShrink: 0, overflowY: 'auto', bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
            <QueueNav value={view.queue} counts={derived.counts} onChange={(queue) => updateView({ queue })} />
          </Box>
        )}

        <Box component="main" sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: { xs: 1.5, md: 2 } }}>
          <Stack spacing={2} sx={{ maxWidth: 1800, mx: 'auto' }}>
            {worklist.status === 'ready' && <SummaryCards stats={derived.stats} activeQueue={view.queue} onSelectQueue={(queue) => updateView({ queue })} />}

            {!showSidebar && <QueueNav variant="chips" value={view.queue} counts={derived.counts} onChange={(queue) => updateView({ queue })} />}

            {/* overflow: clip (not hidden) so the table header can stick to the page scroll. */}
            <Paper sx={{ border: 1, borderColor: 'divider', boxShadow: shadows.card, overflow: 'clip' }}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: 1, borderColor: 'divider' }}>
                <WorklistToolbar
                  filters={filters}
                  onFiltersChange={setFilters}
                  advancedCount={advancedFilterCount(filters)}
                  advancedOpen={view.advancedOpen}
                  onToggleAdvanced={() => updateView({ advancedOpen: !view.advancedOpen }, false)}
                  canClear={canClear}
                  onClear={clearAll}
                  resultCount={derived.rows.length}
                  sort={view.sort}
                  onSortSelect={(sort) => updateView({ sort })}
                  compact={compact}
                />
                <AdvancedFilters
                  open={view.advancedOpen}
                  filters={filters}
                  onFiltersChange={setFilters}
                  referringDoctors={derived.referringDoctors}
                  radiologists={worklist.radiologists}
                  currentUserId={userId}
                />
                {!compact && view.sort.field !== TRIAGE_SORT.field && (
                  <Chip
                    size="small"
                    sx={{ mt: 1.5 }}
                    label={t('sort.customActive', { field: t(`sort.${view.sort.field}`) })}
                    onDelete={() => updateView({ sort: TRIAGE_SORT }, false)}
                  />
                )}
              </Box>

              {content}

              {worklist.status === 'ready' && derived.rows.length > 0 && (
                <TablePagination
                  component="div"
                  count={derived.rows.length}
                  page={safePage}
                  onPageChange={(_e, next) => setPage(next)}
                  rowsPerPage={view.rowsPerPage}
                  rowsPerPageOptions={ROWS_PER_PAGE}
                  onRowsPerPageChange={(e) => updateView({ rowsPerPage: Number(e.target.value) })}
                  labelRowsPerPage={t('pagination.rowsPerPage')}
                  labelDisplayedRows={({ from, to, count }) => t('pagination.displayed', { from, to, count })}
                  getItemAriaLabel={(type) => t(`pagination.${type}`)}
                  sx={{ borderTop: 1, borderColor: 'divider', bgcolor: colors.background.subtle }}
                />
              )}
            </Paper>
          </Stack>
        </Box>
      </Box>

      <ConfirmDialog
        open={Boolean(pendingAssign)}
        title={t('assignment.confirmTitle')}
        message={
          pendingAssign &&
          t(pendingAssign.radiologistId ? 'assignment.confirmReassign' : 'assignment.confirmUnassign', {
            patient: pendingAssign.study.patient.name,
            current: radiologistsById[pendingAssign.study.assignedTo]?.name || '',
            next: radiologistsById[pendingAssign.radiologistId]?.name || '',
          })
        }
        confirmLabel={t(pendingAssign?.radiologistId ? 'assignment.reassign' : 'assignment.unassign')}
        onCancel={() => setPendingAssign(null)}
        onConfirm={() => {
          worklist.assign(pendingAssign.study.id, pendingAssign.radiologistId)
          setPendingAssign(null)
        }}
      />
    </Stack>
  )
}
