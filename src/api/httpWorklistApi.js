import { apiRequest } from './httpClient.js'
import { endpoints } from './endpoints.js'

// Backend implementation of the worklist API. Enabled with VITE_USE_MOCK_API=false.
// Responses are expected in the shapes documented in api/models.js; map them here if the wire format differs.
export const httpWorklistApi = {
  listStudies: (query) => apiRequest(endpoints.studies, { params: query }),
  getStudy: (id) => apiRequest(endpoints.study(id)),
  listRadiologists: () => apiRequest(endpoints.radiologists),
  getCurrentUser: () => apiRequest(endpoints.currentUser),
  assignStudy: (id, radiologistId) => apiRequest(endpoints.assign(id), { method: 'PUT', body: { radiologistId } }),
  // Review actions only; AI status is read-only for the UI. The backend rejects START_REVIEW with 409 while AI is still working.
  startReview: (id) => apiRequest(endpoints.review(id), { method: 'POST', body: { action: 'START_REVIEW' } }),
  setReviewProgress: (id, reviewed) => apiRequest(endpoints.review(id), { method: 'POST', body: { action: reviewed ? 'MARK_REVIEWED' : 'RESUME_REVIEW' } }),
  finalizeReport: (id, reviewer) => apiRequest(endpoints.review(id), { method: 'POST', body: { action: 'FINALIZE', reviewer } }),
  reopenReport: (id) => apiRequest(endpoints.review(id), { method: 'POST', body: { action: 'REOPEN' } }),
  getReportDraft: (id) => apiRequest(endpoints.aiReport(id)),
}
