import { PRIORITY_RANK, STATUS_RANK, STUDY_STATUS } from '../constants/study.js'
import { slaInfo } from './sla.js'

export const SORT_DIRECTION = { ASC: 'asc', DESC: 'desc' }

// Default order: open before completed, then priority, then closest to (or furthest past) the SLA target.
export const TRIAGE_SORT = { field: 'triage', direction: SORT_DIRECTION.ASC }

const text = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
const time = (iso) => (iso ? new Date(iso).getTime() : 0)

function triage(a, b, ctx) {
  const doneA = a.status === STUDY_STATUS.COMPLETED
  const doneB = b.status === STUDY_STATUS.COMPLETED
  if (doneA !== doneB) return doneA ? 1 : -1
  if (doneA) return time(b.reportedAt) - time(a.reportedAt)
  return (
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    slaInfo(b, ctx.now).ratio - slaInfo(a, ctx.now).ratio ||
    time(a.studyDateTime) - time(b.studyDateTime)
  )
}

const COMPARATORS = {
  triage,
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  patient: (a, b) => text(a.patient.name, b.patient.name),
  accessionNumber: (a, b) => text(a.accessionNumber, b.accessionNumber),
  modality: (a, b) => text(a.modality, b.modality),
  description: (a, b) => text(a.description, b.description),
  studyDateTime: (a, b) => time(a.studyDateTime) - time(b.studyDateTime),
  waiting: (a, b, ctx) => slaInfo(a, ctx.now).elapsedMinutes - slaInfo(b, ctx.now).elapsedMinutes,
  referringDoctor: (a, b) => text(a.referringDoctor, b.referringDoctor),
  status: (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status],
  assignedTo: (a, b, ctx) => text(ctx.radiologistName(a.assignedTo), ctx.radiologistName(b.assignedTo)),
}

export const SORTABLE_FIELDS = Object.keys(COMPARATORS)

// ctx = { now, radiologistName(id) }. Ties fall back to triage order so the list stays stable and useful.
export function sortStudies(studies, sort, ctx) {
  const compare = COMPARATORS[sort.field] || triage
  const sign = sort.direction === SORT_DIRECTION.DESC ? -1 : 1
  return [...studies].sort((a, b) => sign * compare(a, b, ctx) || triage(a, b, ctx))
}

export function nextSort(current, field) {
  if (current.field !== field) return { field, direction: field === 'waiting' ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC }
  if (current.direction === SORT_DIRECTION.ASC) return { field, direction: SORT_DIRECTION.DESC }
  return TRIAGE_SORT
}
