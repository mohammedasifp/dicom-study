// Enum values match the API contract. Display labels live in the locale files (keys noted below).

export const MODALITY = { CT: 'CT', MR: 'MR', XR: 'XR', US: 'US' }
export const MODALITIES = [MODALITY.XR, MODALITY.CT, MODALITY.MR, MODALITY.US] // i18n: modality.<code>

export const PRIORITY = { STAT: 'STAT', URGENT: 'URGENT', ROUTINE: 'ROUTINE' }
export const PRIORITIES = [PRIORITY.STAT, PRIORITY.URGENT, PRIORITY.ROUTINE] // i18n: priority.<value>
export const PRIORITY_RANK = { STAT: 0, URGENT: 1, ROUTINE: 2 }

// The two statuses below are independent and owned by different actors:
// - AI report status: set by the backend pipeline (Orthanc -> backend -> AI service). Radiologists never start AI work.
// - Review status: set by the radiologist's actions in the report editor.

export const AI_REPORT_STATUS = {
  RECEIVED: 'RECEIVED', // study received from Orthanc, queued for the AI service
  PROCESSING: 'PROCESSING', // AI service is generating the report
  READY: 'READY', // generated report is ready to review
  FAILED: 'FAILED', // AI could not produce a report; the radiologist reports manually
}
// What the worklist shows: the AI report is either ready or not. The detailed pipeline status above stays in the
// data (tooltips, and FAILED lets the radiologist report manually). i18n: aiReport.<value>
export const AI_READINESS = { READY: 'READY', NOT_READY: 'NOT_READY' }
export const AI_READINESS_VALUES = Object.values(AI_READINESS)

// Why the AI service did not return a report. i18n: aiFailure.<value>
export const AI_FAILURE_REASON = {
  NO_MODEL: 'NO_MODEL',
  OUT_OF_SCOPE: 'OUT_OF_SCOPE',
  INCOMPLETE_STUDY: 'INCOMPLETE_STUDY',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
}

export const REVIEW_STATUS = {
  PENDING_REVIEW: 'PENDING_REVIEW', // nobody has opened the report yet
  UNDER_REVIEW: 'UNDER_REVIEW', // a radiologist has the report open / in progress
  REVIEWED: 'REVIEWED', // every AI finding has been accepted, edited or discarded; awaiting sign-off
  FINALIZED: 'FINALIZED', // signed off
}
export const REVIEW_STATUSES = Object.values(REVIEW_STATUS) // i18n: reviewStatus.<value>
export const REVIEW_RANK = { UNDER_REVIEW: 0, REVIEWED: 1, PENDING_REVIEW: 2, FINALIZED: 3 }

// Target report turnaround from acquisition, in minutes.
export const SLA_TARGET_MINUTES = { STAT: 60, URGENT: 240, ROUTINE: 24 * 60 }
// Share of the target after which a study is flagged as at risk.
export const SLA_AT_RISK_RATIO = 0.75

export const SLA_STATE = { OK: 'OK', AT_RISK: 'AT_RISK', BREACHED: 'BREACHED', DONE: 'DONE' }

export const UNASSIGNED = '__unassigned__'
