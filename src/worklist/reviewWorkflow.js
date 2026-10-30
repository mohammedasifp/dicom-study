import { AI_READINESS, AI_REPORT_STATUS as AI, REVIEW_STATUS as R } from '../constants/study.js'

// Radiologist review workflow. The AI report status is never changed here: it belongs to the backend pipeline.
// The UI uses the guards to enable actions; the mock API applies the transitions (the real backend owns them server-side).

export const isFinalized = (study) => study.reviewStatus === R.FINALIZED

// The report can be reviewed once the AI service has finished: with its generated report (READY)
// or without one (FAILED, the radiologist writes the report manually). Never while AI is still working.
export const isAiPending = (study) => study.aiReportStatus === AI.RECEIVED || study.aiReportStatus === AI.PROCESSING
export const canOpenReport = (study) => !isAiPending(study)

export const isAiReportReady = (study) => study.aiReportStatus === AI.READY
export const aiReadiness = (study) => (isAiReportReady(study) ? AI_READINESS.READY : AI_READINESS.NOT_READY)

// The primary row action, derived from both statuses. i18n: actions.<kind> / actionHint.<kind>
export const REPORT_ACTION = { VIEW_EDIT: 'viewEdit', MANUAL: 'manualReport', VIEW: 'viewReport', AWAITING_AI: 'awaitingAi' }

export function reportAction(study) {
  if (isFinalized(study)) return REPORT_ACTION.VIEW
  if (isAiPending(study)) return REPORT_ACTION.AWAITING_AI
  return study.aiReportStatus === AI.READY ? REPORT_ACTION.VIEW_EDIT : REPORT_ACTION.MANUAL
}

// Assignment never changes the review status; finalized studies are locked.
export function applyAssignment(study, radiologistId) {
  if (isFinalized(study)) return study
  return { ...study, assignedTo: radiologistId || null }
}

// Opening the report claims an unassigned study and starts the review. Studies owned by someone else are left untouched.
export function applyStartReview(study, userId) {
  if (isFinalized(study) || (study.assignedTo && study.assignedTo !== userId)) return study
  return {
    ...study,
    assignedTo: userId,
    reviewStatus: study.reviewStatus === R.PENDING_REVIEW ? R.UNDER_REVIEW : study.reviewStatus,
  }
}

// reviewed = every AI finding has a decision (accepted / edited / discarded). Undoing one moves it back under review.
export function applyReviewProgress(study, reviewed) {
  if (isFinalized(study)) return study
  return { ...study, reviewStatus: reviewed ? R.REVIEWED : R.UNDER_REVIEW }
}

export const applyFinalize = (study, at) => ({ ...study, reviewStatus: R.FINALIZED, reportedAt: at })

export const applyReopen = (study) => ({ ...study, reviewStatus: R.UNDER_REVIEW, reportedAt: null })
