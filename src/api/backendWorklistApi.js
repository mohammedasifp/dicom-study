import {
  assignRadiologist,
  deleteStudy as deleteBackendStudy,
  getCurrentRadiologist,
  getStudy as getBackendStudy,
  listRadiologists as listBackendRadiologists,
  listStudies as listBackendStudies,
} from './backend.js'
import { patientIdentity, toIsoDateTime } from './adapter.js'
import { applyAssignment } from '../worklist/reviewWorkflow.js'
import { AI_FAILURE_REASON, AI_REPORT_STATUS as AI, PRIORITY, REVIEW_STATUS as R } from '../constants/study.js'

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
  const review = s.review || { total: 0, decided: 0 }
  let reviewStatus = mapped.review
  if (reviewStatus === R.PENDING_REVIEW && review.total > 0 && review.decided === review.total) reviewStatus = R.REVIEWED
  else if (reviewStatus === R.PENDING_REVIEW && s.viewed && s.viewed.isViewed) reviewStatus = R.UNDER_REVIEW
  const studyDateTime = toIsoDateTime(s.studyDate, s.studyTime) || s.updatedAt
  const slaDueAt = s.sla && s.sla.dueAt
  const study = {
    id: s.studyInstanceUid,
    studyInstanceUID: s.studyInstanceUid,
    accessionNumber: s.accessionNumber || '-',
    patient: {
      ...patientIdentity(patient, s.studyDate),
      uhid: patient.patientId || '-',
      sex: SEX[patient.sex] || 'O',
    },
    patientClass: s.patientClass || 'OP',
    modality: s.modality === 'CR' || s.modality === 'DX' ? 'XR' : s.modality,
    description: s.description || [s.modality, s.bodyPart].filter(Boolean).join(' '),
    bodyPart: s.bodyPart || '',
    studyDateTime,
    slaTargetMinutes: slaDueAt ? (new Date(slaDueAt).getTime() - new Date(studyDateTime).getTime()) / 60000 : null,
    referringDoctor: s.referringPhysician || '-',
    priority: s.priority || PRIORITY.ROUTINE,
    assignedTo: null,
    aiReportStatus: mapped.ai,
    aiReportUpdatedAt: ai.completedAt || ai.requestedAt || s.updatedAt,
    aiFailureReason: mapped.ai === AI.FAILED ? ai.failureReason || AI_FAILURE_REASON.PROCESSING_ERROR : null,
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

export const backendWorklistApi = {
  listStudies: async () => (await listBackendStudies()).map(toWorklistStudy),
  getStudy: async (id) => toWorklistStudy(await getBackendStudy(id)),
  listRadiologists: async () => (await listBackendRadiologists()).map(toRadiologist),
  getCurrentUser: async () => toRadiologist(await getCurrentRadiologist()),
  assignStudy: async (id, radiologistId) => toWorklistStudy(await assignRadiologist(id, radiologistId || null)),
  deleteStudy: (id) => deleteBackendStudy(id),
}
