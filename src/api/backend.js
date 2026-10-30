/*
 * ============================================================================
 * BACKEND SPEC: changes the reporting screen still needs from dicom-study-backend
 * ============================================================================
 * B1-B11 are built (backend commit 07d7b1d). Search for "BACKEND SPEC" to find
 * every remaining dependency in the webapp.
 *
 * B12 Scan time on the study summary
 *     GET /api/studies (and GET /api/studies/:uid) add `studyTime` (DICOM
 *     StudyTime, "HHMMSS") or a combined ISO `studyDateTime`. Until then the
 *     worklist shows every scan at midnight (05:30 IST) and its waiting time
 *     counts from midnight.
 *
 * B13 Sign-in
 *     POST /api/auth/login  body { username, password } -> { token, user }
 *     (user in the GET /api/radiologists shape) and POST /api/auth/logout.
 *     Accept `Authorization: Bearer <token>` on every /api call and derive the
 *     current radiologist from it (today /api/me reads X-User-Id, which the
 *     webapp sends from the session). Until then sign-in matches the username
 *     to an active radiologist and accepts the demo password
 *     (api/backendAuthApi.js).
 * ============================================================================
 */
import { request } from './client.js'

const enc = encodeURIComponent

export const listStudies = (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return request('GET', `/api/studies${query ? `?${query}` : ''}`)
}

export const syncFromOrthanc = () => request('POST', '/api/studies/sync')

export const getStudy = (uid) => request('GET', `/api/studies/${enc(uid)}`)

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
