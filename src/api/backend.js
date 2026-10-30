/*
 * ============================================================================
 * BACKEND SPEC: changes the reporting screen needs from dicom-study-backend
 * ============================================================================
 * Everything below already works against the current backend. Where a field or
 * endpoint is missing, the webapp falls back to a mock and marks the spot with
 * "BACKEND SPEC (Bn)". Search for that string to find every dependency.
 *
 * B1  Store the report document
 *     PUT /api/studies/:uid/report accepts and stores `body` (TipTap/ProseMirror
 *     JSON of the whole report: headings, paragraphs, lists, tables, images,
 *     and the marks `aiText { suggestionId }` and `reviewerText`).
 *     GET /api/studies/:uid/report returns it as `report.body` (null until the
 *     first save). Keep deriving `findings` / `impression` plain text from what
 *     the webapp sends, so authorship and search keep working.
 *     Body size: up to ~10 MB while images are inline (see B7).
 *
 * B2  Undo a decision
 *     PATCH /api/studies/:uid/report/suggestions/:observationId accepts
 *     `decision: "pending"` (clears reviewerText and decidedAt). Used by
 *     Undo accept, Restore after discard, and Revert to AI wording.
 *     Emit a SUGGESTION_RESET event.
 *
 * B3  Where each observation belongs and what it was seen on
 *     Each observation / suggestion gets:
 *       section: "findings" | "impression"
 *       title:   short label, e.g. "Intra-axial mass" (max ~40 chars)
 *       source:  { seriesInstanceUid, sopInstanceUid } for EVERY observation,
 *                not only localizable ones (the image the model looked at)
 *       limitation: optional per-observation caveat text
 *     The AI impression should arrive as observations with section
 *     "impression" (one per impression point) instead of one string.
 *
 * B4  ROI geometry
 *     ai.rois[] items add `imageWidth` and `imageHeight` (pixel size of the
 *     image the coordinates refer to) and `shape: "rect" | "ellipse"`.
 *     Until then the webapp normalises against the rendered image size.
 *
 * B5  Draft findings
 *     findings.aiText should not be all observations joined; the webapp builds
 *     the findings from the suggestions. Send the AI's free-text findings only
 *     if they add something beyond the observations.
 *
 * B6  Clinical context
 *     GET /api/studies/:uid (and the report summary) add:
 *       clinicalHistory, technique (from RIS / modality worklist when known),
 *       referringPhysician, seriesNumber on each series.
 *
 * B7  Report images
 *     POST /api/studies/:uid/report/images (multipart `file`, or JSON
 *     `{ dataUrl }`) -> `{ url }`. The webapp then stores the URL in `body`
 *     instead of a data URL. Until then images stay inline in `body`.
 *
 * B8  Reopen a finalised report
 *     POST /api/studies/:uid/report/reopen  body { reviewer, reason }
 *     -> status back to "draft", keep finalisedAt history, emit REPORT_REOPENED.
 *     Until then Reopen only unlocks the screen locally.
 *
 * B9  Worklist assignment
 *     PUT /api/studies/:uid/assignment  body { radiologistId | null }
 *     -> study summary with `assignedTo`. GET /api/studies returns `assignedTo`.
 *     Until then assignments live in the browser session (api/backendWorklistApi.js).
 *
 * B10 Users
 *     GET /api/radiologists -> [{ id, name, initials, subspecialty }]
 *     GET /api/me           -> the signed-in radiologist (same shape).
 *     Until then data/mock/radiologists.js stands in.
 *
 * B11 Worklist fields on the study summary (GET /api/studies)
 *     description, priority ("STAT" | "URGENT" | "ROUTINE"), patientClass
 *     ("OP" | "IP" | "ER"), referringPhysician, clinicalHistory, reportedAt.
 *     Until then: description = modality + body part, priority ROUTINE, class OP.
 * ============================================================================
 */
import { ApiError, request } from './client.js'

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

export const markViewed = (uid, viewedBy) => request('PUT', `/api/studies/${enc(uid)}/viewed`, { viewedBy })

export const setSla = (uid, minutes, setBy) => request('PUT', `/api/studies/${enc(uid)}/sla`, { minutes, setBy })

export const listEvents = (uid) => request('GET', `/api/events?studyInstanceUid=${enc(uid)}`)

export async function decideSuggestion(uid, observationId, { decision, text, reviewer }) {
  try {
    return await request('PATCH', `/api/studies/${enc(uid)}/report/suggestions/${enc(observationId)}`, { decision, text, reviewer })
  } catch (err) {
    // BACKEND SPEC (B2): "pending" is rejected with 400 until undo is supported; keep the local state.
    if (decision === 'pending' && err instanceof ApiError && err.status === 400) return null
    throw err
  }
}

export const saveReport = (uid, { body, findings, impression, reviewer, authorship }) =>
  request('PUT', `/api/studies/${enc(uid)}/report`, { body, findings, impression, reviewer, authorship })

export const finaliseReport = (uid, { reviewer, authorship }) =>
  request('POST', `/api/studies/${enc(uid)}/report/finalise`, { reviewer, authorship })

export async function reopenReport(uid, { reviewer, reason }) {
  try {
    return await request('POST', `/api/studies/${enc(uid)}/report/reopen`, { reviewer, reason })
  } catch (err) {
    // BACKEND SPEC (B8): endpoint not built yet (404); the screen unlocks locally only.
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

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
