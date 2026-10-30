import { UNASSIGNED } from '../constants/study.js'
import { aiReadiness } from './reviewWorkflow.js'

export const DATE_RANGE = { ANY: 'any', TODAY: 'today', LAST_24H: 'last24h', LAST_7D: 'last7d', CUSTOM: 'custom' }

export const EMPTY_FILTERS = {
  search: '',
  modalities: [],
  priorities: [],
  aiReadiness: [], // AI_READINESS values
  reviewStatuses: [],
  referringDoctors: [],
  assignees: [], // radiologist ids and/or UNASSIGNED
  dateRange: DATE_RANGE.ANY,
  dateFrom: '', // yyyy-mm-dd, used when dateRange is CUSTOM
  dateTo: '',
}

const normalize = (text) => (text || '').toString().toLowerCase()

export function matchesSearch(study, query) {
  const q = normalize(query).trim()
  if (!q) return true
  const haystack = [
    study.patient.name,
    study.patient.uhid,
    study.accessionNumber,
    study.description,
    study.bodyPart,
    study.referringDoctor,
    study.modality,
  ]
    .map(normalize)
    .join(' ')
  return q.split(/\s+/).every((term) => haystack.includes(term))
}

const startOfDay = (ms) => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function dateBounds(filters, now) {
  switch (filters.dateRange) {
    case DATE_RANGE.TODAY:
      return [startOfDay(now), Infinity]
    case DATE_RANGE.LAST_24H:
      return [now - 24 * 3600000, Infinity]
    case DATE_RANGE.LAST_7D:
      return [now - 7 * 24 * 3600000, Infinity]
    case DATE_RANGE.CUSTOM: {
      const from = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`).getTime() : -Infinity
      const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999`).getTime() : Infinity
      return [from, to]
    }
    default:
      return null
  }
}

const inList = (list, value) => list.length === 0 || list.includes(value)

export function applyFilters(studies, filters, ctx) {
  const bounds = dateBounds(filters, ctx.now)
  return studies.filter((s) => {
    if (!inList(filters.modalities, s.modality)) return false
    if (!inList(filters.priorities, s.priority)) return false
    if (!inList(filters.aiReadiness, aiReadiness(s))) return false
    if (!inList(filters.reviewStatuses, s.reviewStatus)) return false
    if (!inList(filters.referringDoctors, s.referringDoctor)) return false
    if (!inList(filters.assignees, s.assignedTo || UNASSIGNED)) return false
    if (bounds) {
      const t = new Date(s.studyDateTime).getTime()
      if (t < bounds[0] || t > bounds[1]) return false
    }
    return matchesSearch(s, filters.search)
  })
}

// Advanced filters only (search and modality chips are always visible).
export function advancedFilterCount(filters) {
  return (
    filters.priorities.length +
    filters.aiReadiness.length +
    filters.reviewStatuses.length +
    filters.referringDoctors.length +
    filters.assignees.length +
    (filters.dateRange === DATE_RANGE.ANY ? 0 : 1)
  )
}

export const hasActiveFilters = (filters) =>
  Boolean(filters.search.trim()) || filters.modalities.length > 0 || advancedFilterCount(filters) > 0

export const uniqueSorted = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b))
