/*
 * ============================================================================
 * BACKEND SPEC: changes the reporting screen still needs from dicom-study-backend
 * ============================================================================
 * B1-B13 are built (backend commit 5a04bb1). The webapp has no mock data left.
 *
 * B14 Require sign-in on every /api route
 *     Today only /api/me and radiologist create/update need a token; studies,
 *     reports, events and report images answer anonymous calls, and the
 *     backend is public on ngrok. Reject a missing token with 401 on all /api
 *     routes (the Orthanc push /event/preregister is outside /api).
 *     EventSource and <img> cannot send headers, so also accept `?token=` on
 *     GET /api/events/stream and GET /api/studies/:uid/report/images/:id.
 *     Webapp follow-up once built: add ?token= to the SSE URL and to report
 *     image URLs at render time (never store it in the report body).
 *
 * B15 Serve the images through the backend
 *     Proxy /dicom-web, /wado and /ohif to Orthanc with the backend's own
 *     Orthanc login, behind the same token check. Then the webapp needs only
 *     BACKEND_URL (no Orthanc address or password), and a production build
 *     works without the Vite dev proxy. Also make `viewerUrl` relative
 *     (today it is http://localhost:8042/ohif/viewer?...).
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
