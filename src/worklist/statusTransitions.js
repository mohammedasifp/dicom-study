import { STUDY_STATUS as S } from '../constants/study.js'

export function applyAssignment(study, radiologistId) {
  if (study.status === S.COMPLETED) return study
  if (!radiologistId) return { ...study, assignedTo: null, status: study.status === S.ASSIGNED ? S.NEW : study.status }
  return { ...study, assignedTo: radiologistId, status: study.status === S.NEW ? S.ASSIGNED : study.status }
}
