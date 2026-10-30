import {
  assignRadiologist,
  getCurrentRadiologist,
  getStudy as getBackendStudy,
  listRadiologists as listBackendRadiologists,
  listStudies as listBackendStudies,
} from './backend.js'
import { ageAt, toIsoDateTime } from './adapter.js'
import { readSession } from '../auth/session.js'
import { applyAssignment } from '../worklist/reviewWorkflow.js'
import { AI_FAILURE_REASON, AI_REPORT_STATUS as AI, PRIORITY, REVIEW_STATUS as R } from '../constants/study.js'

// Worklist data from dicom-study-backend (`GET /api/studies`). Same method signatures as httpWorklistApi.js.

// The backend keeps one study status; the worklist splits it into the AI report status (pipeline)
// and the radiologist review status. Opening the report marks it viewed, which counts as under review.
const STATUS = {
  RECEIVED: { ai: AI.RECEIVED, review: R.PENDING_REVIEW },
  AI_PROCESSING: { ai: AI.PROCESSING, review: R.PENDING_REVIEW },
  AI_FAILED: { ai: AI.FAILED, review: R.PENDING_REVIEW },
  REPORT_PENDING: { ai: AI.READY, review: R.PENDING_REVIEW },
  REPORTED: { ai: AI.READY, review: R.FINALIZED },
}

const SEX = { M: 'M', F: 'F', O: 'O' }

const toRadiologist = (r) => ({ id: r.id || String(r._id), name: r.name, initials: r.initials || '', subspecialty: r.subspecialty || '' })

function toWorklistStudy(s) {
  const patient = s.patient || {}
  const ai = s.ai || {}
  const mapped = STATUS[s.status] || { ai: AI.RECEIVED, review: R.PENDING_REVIEW }
  const reviewStatus = mapped.review === R.PENDING_REVIEW && s.viewed && s.viewed.isViewed ? R.UNDER_REVIEW : mapped.review
  const study = {
    id: s.studyInstanceUid,
    studyInstanceUID: s.studyInstanceUid,
    accessionNumber: s.accessionNumber || '-',
    patient: {
      name: (patient.name || 'Unknown').replace(/\^/g, ' ').trim(),
      uhid: patient.patientId || '-',
      age: ageAt(patient.birthDate, s.studyDate),
      sex: SEX[patient.sex] || 'O',
    },
    patientClass: s.patientClass || 'OP',
    modality: s.modality === 'CR' || s.modality === 'DX' ? 'XR' : s.modality,
    description: s.description || [s.modality, s.bodyPart].filter(Boolean).join(' '),
    bodyPart: s.bodyPart || '',
    // BACKEND SPEC (B12): `studyTime` on the summary; until then the scan shows at midnight of the study date.
    studyDateTime: toIsoDateTime(s.studyDate, s.studyTime) || s.updatedAt,
    referringDoctor: s.referringPhysician || '-',
    priority: s.priority || PRIORITY.ROUTINE,
    assignedTo: null,
    aiReportStatus: mapped.ai,
    aiReportUpdatedAt: ai.completedAt || ai.startedAt || s.updatedAt,
    aiFailureReason: mapped.ai === AI.FAILED ? AI_FAILURE_REASON.PROCESSING_ERROR : null,
    // The backend reports failures as free text; shown instead of the generic reason when present.
    aiFailureMessage: mapped.ai === AI.FAILED ? ai.error || null : null,
    reviewStatus,
    imagesAvailable: (s.instanceCount || 0) > 0,
    seriesCount: s.seriesCount || 0,
    instanceCount: s.instanceCount || 0,
    clinicalHistory: s.clinicalHistory || '',
    reportedAt: s.reportedAt || null,
  }
  return s.assignedTo ? applyAssignment(study, s.assignedTo) : study
}

const sessionUser = () => {
  const session = readSession()
  return session && session.user
}

export const backendWorklistApi = {
  listStudies: async () => (await listBackendStudies()).map(toWorklistStudy),
  getStudy: async (id) => toWorklistStudy(await getBackendStudy(id)),
  listRadiologists: async () => (await listBackendRadiologists()).map(toRadiologist),
  getCurrentUser: async () => sessionUser() || toRadiologist(await getCurrentRadiologist()),
  assignStudy: async (id, radiologistId) => {
    const user = sessionUser()
    return toWorklistStudy(await assignRadiologist(id, radiologistId || null, user && user.name))
  },
  // The reporting screen (pages/ReportingScreen.jsx) talks to the backend directly for review actions:
  // opening marks the study viewed, and save / finalize / reopen go through api/backend.js.
  startReview: (id) => backendWorklistApi.getStudy(id),
  setReviewProgress: (id) => backendWorklistApi.getStudy(id),
  finalizeReport: (id) => backendWorklistApi.getStudy(id),
  reopenReport: (id) => backendWorklistApi.getStudy(id),
  getReportDraft: async () => {
    throw new Error('The reporting screen loads its draft from /api/studies/:uid/report')
  },
}
