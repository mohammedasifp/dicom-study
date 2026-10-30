import { Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Tooltip, Typography } from '@mui/material'
import { useI18n } from '../../i18n/I18nContext.js'
import { formatDate, formatDayMonth, formatTime } from '../../i18n/format.js'
import { PRIORITY } from '../../constants/study.js'
import { colors, priorityColors, table, typography } from '../../styles/tokens.js'
import { canOpenReport, isFinalized } from '../../worklist/reviewWorkflow.js'
import { AiReportStatusBadge, ModalityBadge, PriorityBadge, ReviewStatusBadge } from './StudyBadges.jsx'
import { AssigneeLabel } from './Assignment.jsx'
import SlaTimer from './SlaTimer.jsx'
import StudyActions from './StudyActions.jsx'

// Columns fill the available width without horizontal scrolling. Compact columns have a fixed size
// that fits their content; text-heavy columns share the remaining space by weight (fr) above a minimum.
// Minimums add up to ~1198px, so the table is used from layout.worklistTableMinWidth (1280px) and cards below it.
// AI report status and review status are separate columns: they are set by different actors and change independently.
const COLUMNS = [
  { id: 'priority', sortField: 'priority', track: '80px' },
  { id: 'patient', sortField: 'patient', track: 'minmax(128px, 1.4fr)' },
  { id: 'modality', sortField: 'modality', track: '88px', align: 'center' },
  { id: 'study', sortField: 'description', track: 'minmax(140px, 1.6fr)' },
  { id: 'waiting', sortField: 'waiting', track: '112px' },
  { id: 'aiReport', sortField: 'aiReportStatus', track: '136px' },
  { id: 'reviewStatus', sortField: 'reviewStatus', track: '122px' },
  { id: 'assignedTo', sortField: 'assignedTo', track: 'minmax(100px, 1fr)' },
  { id: 'referringDoctor', sortField: 'referringDoctor', track: 'minmax(92px, 0.9fr)' },
  { id: 'actions', track: '200px', align: 'right' },
]

// Space between the app bar and the pinned table header while scrolling, in px.
const STICKY_GAP = 12

// Each row is its own grid with the same template; tracks resolve identically, so columns line up.
const rowGrid = { display: 'grid', gridTemplateColumns: COLUMNS.map((c) => c.track).join(' ') }

const JUSTIFY = { right: 'flex-end', center: 'center' }

const cellBase = (col) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: JUSTIFY[col.align] || 'flex-start',
  minWidth: 0,
  px: table.cellPaddingX,
  py: 0,
  whiteSpace: 'nowrap',
  borderBottom: 0,
  borderRight: `1px solid ${table.gridLine}`,
  '&:last-of-type': { borderRight: 0 },
  '& > *': { maxWidth: '100%' },
})

const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis' }
const primaryText = { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, lineHeight: 1.35, ...ellipsis }
const secondaryText = { fontSize: typography.size.xs, color: colors.text.secondary, lineHeight: 1.35, ...ellipsis }

export default function StudyTable({ studies, now, sort, onSortChange, radiologists, radiologistsById, currentUserId, busyIds, onOpen, onAssign }) {
  const { t, intlLocale } = useI18n()

  const cell = (study, col) => {
    switch (col.id) {
      case 'priority':
        return <PriorityBadge priority={study.priority} />
      case 'patient': {
        const demographics = `${study.patient.age} / ${t(`sex.${study.patient.sex}`)} · ${t(`patientClass.${study.patientClass}`)}`
        return (
          <>
            <Typography sx={primaryText} title={`${study.patient.name} · ${demographics}`}>
              {study.patient.name}
            </Typography>
            <Typography sx={secondaryText} title={study.patient.uhid}>
              {study.patient.uhid} · {demographics}
            </Typography>
          </>
        )
      }
      case 'modality':
        return <ModalityBadge modality={study.modality} />
      case 'study':
        return (
          <>
            <Typography sx={{ ...primaryText, fontWeight: typography.weight.medium }} title={study.description}>
              {study.description}
            </Typography>
            <Typography sx={secondaryText}>
              {t('study.accessionShort')} {study.accessionNumber}
            </Typography>
          </>
        )
      case 'waiting':
        // Turnaround is measured from acquisition, so the acquisition time sits under the timer.
        return (
          <>
            <SlaTimer study={study} now={now} />
            <Tooltip title={t('study.acquiredAt', { time: `${formatDate(study.studyDateTime, intlLocale)} ${formatTime(study.studyDateTime, intlLocale)}` })}>
              <Typography sx={secondaryText}>
                {formatDayMonth(study.studyDateTime, intlLocale)}, {formatTime(study.studyDateTime, intlLocale)}
              </Typography>
            </Tooltip>
          </>
        )
      case 'aiReport':
        return <AiReportStatusBadge study={study} />
      case 'reviewStatus':
        return <ReviewStatusBadge status={study.reviewStatus} />
      case 'assignedTo':
        return <AssigneeLabel radiologist={radiologistsById[study.assignedTo]} isCurrentUser={study.assignedTo === currentUserId} />
      case 'referringDoctor':
        return (
          <Typography sx={{ fontSize: typography.size.sm, ...ellipsis }} title={study.referringDoctor}>
            {study.referringDoctor}
          </Typography>
        )
      case 'actions':
        return (
          <StudyActions
            study={study}
            radiologists={radiologists}
            currentUserId={currentUserId}
            busy={busyIds.includes(study.id)}
            onOpen={onOpen}
            onAssign={onAssign}
          />
        )
      default:
        return null
    }
  }

  return (
    // Rendered as divs with a CSS grid per row; ARIA roles keep the table semantics for assistive tech.
    <Table component="div" role="table" aria-label={t('worklist.tableLabel')} sx={{ display: 'block', width: '100%' }}>
      {/* Sticks to the page scroll container so the header stays visible through long lists. */}
      {/* Pinned STICKY_GAP px below the app bar; ::before paints that gap in the page colour so rows scrolling
          underneath don't show through it. */}
      <TableHead
        component="div"
        role="rowgroup"
        sx={{
          display: 'block',
          position: 'sticky',
          top: STICKY_GAP,
          zIndex: 2,
          boxShadow: '0 4px 8px -4px rgba(30,41,59,0.25)',
          '&::before': { content: '""', position: 'absolute', left: 0, right: 0, bottom: '100%', height: STICKY_GAP, bgcolor: 'background.default' },
        }}
      >
        <TableRow component="div" role="row" sx={{ ...rowGrid, height: table.headerHeight, bgcolor: table.headerBg }}>
          {COLUMNS.map((col) => (
            <TableCell
              key={col.id}
              component="div"
              role="columnheader"
              aria-sort={sort.field === col.sortField ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
              sx={{
                ...cellBase(col),
                borderRightColor: table.headerGridLine,
                color: table.headerText,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.bold,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {col.sortField ? (
                <TableSortLabel
                  active={sort.field === col.sortField}
                  hideSortIcon
                  direction={sort.field === col.sortField ? sort.direction : 'asc'}
                  onClick={() => onSortChange(col.sortField)}
                  sx={{
                    color: 'inherit',
                    maxWidth: '100%',
                    // MUI's default `flexDirection: inherit` picks up the cell's column layout and drops the arrow below the label.
                    flexDirection: 'row',
                    '&:hover, &:focus-visible': { color: table.headerMuted },
                    '&.Mui-active': { color: table.headerText },
                    '& .MuiTableSortLabel-icon': { color: `${table.headerMuted} !important`, mx: 0.25 },
                  }}
                >
                  {t(`columns.${col.id}`)}
                </TableSortLabel>
              ) : (
                t(`columns.${col.id}`)
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody component="div" role="rowgroup" sx={{ display: 'block' }}>
        {studies.map((study, index) => {
          const completed = isFinalized(study)
          const stat = study.priority === PRIORITY.STAT && !completed
          // Rows open the report only once AI has finished; while it is working the row is informational.
          const openable = canOpenReport(study)
          return (
            <TableRow
              key={study.id}
              component="div"
              role="row"
              tabIndex={0}
              onClick={() => openable && onOpen(study)}
              onKeyDown={(e) => openable && e.key === 'Enter' && e.target === e.currentTarget && onOpen(study)}
              aria-label={t(openable ? 'worklist.openStudy' : 'worklist.awaitingAiStudy', { patient: study.patient.name, study: study.description })}
              sx={{
                ...rowGrid,
                height: table.rowHeight,
                cursor: openable ? 'pointer' : 'default',
                bgcolor: stat ? table.statRowBg : index % 2 ? table.rowStripeBg : table.rowBg,
                borderBottom: `1px solid ${table.gridLine}`,
                boxShadow: `inset 4px 0 0 ${priorityColors[study.priority].bar}`,
                transition: 'background-color 80ms',
                '&:hover': { bgcolor: stat ? table.statRowHoverBg : table.rowHoverBg },
                '&:focus-visible': { bgcolor: table.rowHoverBg, outline: `2px solid ${colors.border.focus}`, outlineOffset: -2 },
              }}
            >
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  component="div"
                  role="cell"
                  sx={{ ...cellBase(col), pl: col.id === 'priority' ? 1.5 : table.cellPaddingX, color: completed ? colors.text.secondary : 'inherit' }}
                >
                  {cell(study, col)}
                </TableCell>
              ))}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
