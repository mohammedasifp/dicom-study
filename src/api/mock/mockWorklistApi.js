import { createMockStudies } from '../../data/mock/studies.js'
import { mockCurrentUserId, mockRadiologists } from '../../data/mock/radiologists.js'
import { appConfig } from '../../config/appConfig.js'
import { ApiError } from '../httpClient.js'
import { draftFromStudy } from '../../report/draftFromStudy.js'
import { applyAssignment, applyCompleteReport, applyReopenReport, applyStartReporting } from '../../worklist/statusTransitions.js'

// In-memory stand-in for the worklist backend. Same method signatures as httpWorklistApi.js.
// State lives for the browser session, so assignments and status changes persist while navigating.

let studies = null
const store = () => (studies ||= createMockStudies())

const clone = (value) => structuredClone(value)
const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(clone(value)), appConfig.mockLatencyMs))

function find(id) {
  const study = store().find((s) => s.id === id)
  if (!study) throw new ApiError(`Study ${id} not found`, { status: 404, code: 'NOT_FOUND' })
  return study
}

function update(id, change) {
  const next = change(find(id))
  studies = store().map((s) => (s.id === id ? next : s))
  return delay(next)
}

export const mockWorklistApi = {
  listStudies: () => delay(store()),
  getStudy: async (id) => delay(find(id)),
  listRadiologists: () => delay(mockRadiologists),
  getCurrentUser: () => delay(mockRadiologists.find((r) => r.id === mockCurrentUserId)),
  assignStudy: async (id, radiologistId) => update(id, (s) => applyAssignment(s, radiologistId)),
  startReporting: async (id, userId) => update(id, (s) => applyStartReporting(s, userId)),
  completeReport: async (id) => update(id, (s) => applyCompleteReport(s, new Date().toISOString())),
  reopenReport: async (id) => update(id, applyReopenReport),
  getReportDraft: async (id) => {
    const study = find(id)
    return delay(draftFromStudy(study, null))
  },
}
