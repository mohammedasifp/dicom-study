import { createMockAiSchedule, createMockStudies } from '../../data/mock/studies.js'
import { mockCurrentUserId, mockRadiologists } from '../../data/mock/radiologists.js'
import { mockAiReport } from '../../data/mock/aiReports.js'
import { appConfig } from '../../config/appConfig.js'
import { AI_REPORT_STATUS } from '../../constants/study.js'
import { ApiError } from '../httpClient.js'
import { readSession } from '../../auth/session.js'
import { draftFromStudy } from '../../report/draftFromStudy.js'
import { applyAssignment, applyFinalize, applyReopen, applyReviewProgress, applyStartReview, canOpenReport } from '../../worklist/reviewWorkflow.js'

// In-memory stand-in for the worklist backend. Same method signatures as httpWorklistApi.js.
// State lives for the browser session, so assignments and review progress persist while navigating.
// It also simulates the backend AI pipeline: scheduled studies move RECEIVED -> PROCESSING -> READY / FAILED on their own.

let studies = null
let aiSchedule = null

function store() {
  if (!studies) {
    const now = Date.now()
    studies = createMockStudies(now)
    aiSchedule = createMockAiSchedule(now)
  }
  advanceAiPipeline(Date.now())
  return studies
}

// Applies every scheduled AI status change that is due. Only the pipeline changes aiReportStatus.
function advanceAiPipeline(now) {
  studies = studies.map((study) => {
    const due = (aiSchedule[study.id] || []).filter((step) => step.at <= now)
    if (!due.length) return study
    aiSchedule[study.id] = aiSchedule[study.id].filter((step) => step.at > now)
    const last = due[due.length - 1]
    return { ...study, aiReportStatus: last.status, aiFailureReason: last.reason, aiReportUpdatedAt: new Date(last.at).toISOString() }
  })
}

const clone = (value) => structuredClone(value)
const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(clone(value)), appConfig.mockLatencyMs))
const reject = (error) => new Promise((_resolve, fail) => setTimeout(() => fail(error), appConfig.mockLatencyMs))

const aiNotReady = (id) => new ApiError(`AI report for study ${id} is still being generated`, { status: 409, code: 'AI_REPORT_NOT_READY' })

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
  getCurrentUser: () => delay(mockRadiologists.find((r) => r.id === (readSession()?.user.id || mockCurrentUserId))),
  assignStudy: async (id, radiologistId) => update(id, (s) => applyAssignment(s, radiologistId)),
  startReview: async (id, userId) => (canOpenReport(find(id)) ? update(id, (s) => applyStartReview(s, userId)) : reject(aiNotReady(id))),
  setReviewProgress: async (id, reviewed) => update(id, (s) => applyReviewProgress(s, reviewed)),
  finalizeReport: async (id) => update(id, (s) => applyFinalize(s, new Date().toISOString())),
  reopenReport: async (id) => update(id, applyReopen),
  getReportDraft: async (id) => {
    const study = find(id)
    if (!canOpenReport(study)) return reject(aiNotReady(id))
    const aiReport = study.aiReportStatus === AI_REPORT_STATUS.READY ? mockAiReport(study) : null
    return delay(draftFromStudy(study, aiReport))
  },
}
