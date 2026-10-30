import { listStudies as listBackendStudies, getStudy as getBackendStudy } from './backend.js'
import { ageAt, toIsoDate } from './adapter.js'
import { mockCurrentUserId, mockRadiologists } from '../data/mock/radiologists.js'
import { readSession } from '../auth/session.js'
import { applyAssignment, applyStartReporting } from '../worklist/statusTransitions.js'
import { AI_DRAFT_STATUS as AI, PRIORITY, STUDY_STATUS as S } from '../constants/study.js'

// Worklist data from dicom-study-backend (`GET /api/studies`). Same method signatures as httpWorklistApi.js.

const STATUS = {
  RECEIVED: { status: S.NEW, ai: AI.PROCESSING },
  AI_PROCESSING: { status: S.NEW, ai: AI.PROCESSING },
  AI_FAILED: { status: S.NEW, ai: AI.FAILED },
  REPORT_PENDING: { status: S.PENDING_REPORT, ai: AI.READY },
  REPORTED: { status: S.COMPLETED, ai: AI.READY },
}

const SEX = { M: 'M', F: 'F', O: 'O' }

// BACKEND SPEC (B9): assignment lives in the browser session until the backend stores `assignedTo`
// (PUT /api/studies/:uid/assignment { radiologistId }) and returns it on each study.
const assignments = new Map()

function toWorklistStudy(s) {
  const patient = s.patient || {}
  const mapped = STATUS[s.status] || { status: S.NEW, ai: AI.NOT_AVAILABLE }
  let status = mapped.status
  if (status === S.PENDING_REPORT && s.viewed && s.viewed.isViewed) status = S.IN_PROGRESS
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
    // BACKEND SPEC (B11): patientClass, priority, description, referringDoctor, clinicalHistory and reportedAt on the study summary.
    patientClass: s.patientClass || 'OP',
    modality: s.modality === 'CR' || s.modality === 'DX' ? 'XR' : s.modality,
    description: s.description || [s.modality, s.bodyPart].filter(Boolean).join(' '),
    bodyPart: s.bodyPart || '',
    studyDateTime: toIsoDate(s.studyDate) || s.updatedAt,
    referringDoctor: s.referringPhysician || '-',
    priority: s.priority || PRIORITY.ROUTINE,
    status,
    assignedTo: null,
    aiDraftStatus: mapped.ai,
    imagesAvailable: (s.instanceCount || 0) > 0,
    seriesCount: s.seriesCount || 0,
    instanceCount: s.instanceCount || 0,
    clinicalHistory: s.clinicalHistory || '',
    reportedAt: s.status === 'REPORTED' ? s.reportedAt || s.updatedAt : null,
  }
  const assigned = assignments.get(study.id)
  return assigned ? applyAssignment(study, assigned) : study
}

export const backendWorklistApi = {
  listStudies: async () => (await listBackendStudies()).map(toWorklistStudy),
  getStudy: async (id) => toWorklistStudy(await getBackendStudy(id)),
  // BACKEND SPEC (B10): GET /api/radiologists and GET /api/me; the mock list stands in until then.
  listRadiologists: async () => mockRadiologists,
  getCurrentUser: async () => mockRadiologists.find((r) => r.id === (readSession()?.user.id || mockCurrentUserId)),
  assignStudy: async (id, radiologistId) => {
    if (radiologistId) assignments.set(id, radiologistId)
    else assignments.delete(id)
    return backendWorklistApi.getStudy(id)
  },
  startReporting: async (id, userId) => applyStartReporting(await backendWorklistApi.getStudy(id), userId),
  completeReport: (id) => backendWorklistApi.getStudy(id),
  reopenReport: (id) => backendWorklistApi.getStudy(id),
  getReportDraft: async () => {
    throw new Error('The reporting screen loads its draft from /api/studies/:uid/report')
  },
}
