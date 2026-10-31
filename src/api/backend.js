import { request } from './client.js'

const enc = encodeURIComponent

export const listStudies = (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return request('GET', `/api/studies${query ? `?${query}` : ''}`)
}

export const syncFromOrthanc = () => request('POST', '/api/studies/sync')

export const getStudy = (uid) => request('GET', `/api/studies/${enc(uid)}`)

export const deleteStudy = (uid) => request('DELETE', `/api/studies/${enc(uid)}`)

export const getReportData = (uid) => request('GET', `/api/studies/${enc(uid)}/report`)

export const listModels = () => request('GET', '/api/models')

export const retryAnalysis = (uid, { model, prompt, mode } = {}) =>
  request('POST', `/api/studies/${enc(uid)}/retry`, { model, prompt, mode })

export const rollbackAi = (uid, rolledBackBy) => request('POST', `/api/studies/${enc(uid)}/ai/rollback`, { rolledBackBy })

export const markViewed = (uid, viewedBy) => request('PUT', `/api/studies/${enc(uid)}/viewed`, { viewedBy })

export const setSla = (uid, minutes, setBy) => request('PUT', `/api/studies/${enc(uid)}/sla`, { minutes, setBy })

export const assignRadiologist = (uid, radiologistId, assignedBy) =>
  request('PUT', `/api/studies/${enc(uid)}/assignment`, { radiologistId, assignedBy })

export const listRadiologists = () => request('GET', '/api/radiologists?status=ACTIVE')

export const getCurrentRadiologist = () => request('GET', '/api/me')

export const listEvents = (uid) => request('GET', `/api/events?studyInstanceUid=${enc(uid)}`)

export const decideSuggestion = (uid, observationId, { decision, text, reviewer }) =>
  request('PATCH', `/api/studies/${enc(uid)}/report/suggestions/${enc(observationId)}`, { decision, text, reviewer })

export const saveReport = (uid, { body, findings, impression, reviewer, authorship }) =>
  request('PUT', `/api/studies/${enc(uid)}/report`, { body, findings, impression, reviewer, authorship })

export const finaliseReport = (uid, { reviewer, authorship }) =>
  request('POST', `/api/studies/${enc(uid)}/report/finalise`, { reviewer, authorship })

export const reopenReport = (uid, { reviewer, reason }) =>
  request('POST', `/api/studies/${enc(uid)}/report/reopen`, { reviewer, reason })

export const getOpsDashboard = () => request('GET', '/api/ops/dashboard')

export const getOpsSummary = () => request('GET', '/api/ops/summary')

export const getStagePatients = (stage) => request('GET', `/api/ops/stages/${enc(stage)}`)

export const injectFaults = (types) => request('POST', '/api/ops/simulation/inject', { types })

export const acknowledgeException = (id) => request('POST', `/api/ops/exceptions/${enc(id)}/acknowledge`)

export const assignException = (id, radiologistId) => request('PUT', `/api/ops/exceptions/${enc(id)}/assignee`, { radiologistId })

export const resolveException = (id, note) => request('POST', `/api/ops/exceptions/${enc(id)}/resolve`, { note })

export const uploadReportImage = (uid, dataUrl) => request('POST', `/api/studies/${enc(uid)}/report/images`, { dataUrl })

const parseJson = (text) => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function openEventStream(handlers) {
  const source = new EventSource('/api/events/stream')
  Object.entries(handlers).forEach(([tag, handler]) =>
    source.addEventListener(tag, (e) => {
      const event = parseJson(e.data)
      if (event) handler(event)
    }),
  )
  return () => source.close()
}
