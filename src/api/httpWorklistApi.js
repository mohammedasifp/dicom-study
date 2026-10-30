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
  startReporting: (id) => apiRequest(endpoints.status(id), { method: 'POST', body: { action: 'START_REPORTING' } }),
  completeReport: (id, reviewer) => apiRequest(endpoints.status(id), { method: 'POST', body: { action: 'COMPLETE', reviewer } }),
  reopenReport: (id) => apiRequest(endpoints.status(id), { method: 'POST', body: { action: 'REOPEN' } }),
  getReportDraft: (id) => apiRequest(endpoints.reportDraft(id)),
}
