import { STUDY_STATUS as S } from '../constants/study.js'

// Workflow rules for a study. The mock API applies them locally; the real backend owns them server-side.

export function applyAssignment(study, radiologistId) {
  if (study.status === S.COMPLETED) return study
  if (!radiologistId) return { ...study, assignedTo: null, status: study.status === S.ASSIGNED ? S.NEW : study.status }
  return { ...study, assignedTo: radiologistId, status: study.status === S.NEW ? S.ASSIGNED : study.status }
}

// Opening a study for reporting claims it when unassigned. Studies owned by someone else are left untouched.
export function applyStartReporting(study, userId) {
  if (study.status === S.COMPLETED) return study
  if (study.assignedTo && study.assignedTo !== userId) return study
  return { ...study, assignedTo: userId, status: S.IN_PROGRESS }
}

export const applyCompleteReport = (study, at) => ({ ...study, status: S.COMPLETED, reportedAt: at })

export const applyReopenReport = (study) => ({ ...study, status: S.IN_PROGRESS, reportedAt: null })
