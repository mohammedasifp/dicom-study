import {
  assignRadiologist,
  getCurrentRadiologist,
  getStudy as getBackendStudy,
  listRadiologists as listBackendRadiologists,
  listStudies as listBackendStudies,
} from './backend.js'
import { ageAt, toIsoDateTime } from './adapter.js'
import { readSession } from '../auth/session.js'
import { applyAssignment } from '../worklist/statusTransitions.js'
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

const toRadiologist = (r) => ({ id: r.id || String(r._id), name: r.name, initials: r.initials || '', subspecialty: r.subspecialty || '' })

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
    patientClass: s.patientClass || 'OP',
    modality: s.modality === 'CR' || s.modality === 'DX' ? 'XR' : s.modality,
    description: s.description || [s.modality, s.bodyPart].filter(Boolean).join(' '),
    bodyPart: s.bodyPart || '',
    // BACKEND SPEC (B12): `studyTime` on the summary; until then the scan shows at midnight of the study date.
    studyDateTime: toIsoDateTime(s.studyDate, s.studyTime) || s.updatedAt,
    referringDoctor: s.referringPhysician || '-',
    priority: s.priority || PRIORITY.ROUTINE,
    status,
    assignedTo: null,
    aiDraftStatus: mapped.ai,
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
  startReporting: (id) => backendWorklistApi.getStudy(id),
  completeReport: (id) => backendWorklistApi.getStudy(id),
  reopenReport: (id) => backendWorklistApi.getStudy(id),
  getReportDraft: async () => {
    throw new Error('The reporting screen loads its draft from /api/studies/:uid/report')
  },
}
