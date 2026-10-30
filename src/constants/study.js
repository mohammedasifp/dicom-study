// Enum values match the API contract. Display labels live in the locale files (keys noted below).

export const MODALITY = { CT: 'CT', MR: 'MR', XR: 'XR', US: 'US' }
export const MODALITIES = [MODALITY.XR, MODALITY.CT, MODALITY.MR, MODALITY.US] // i18n: modality.<code>

export const PRIORITY = { STAT: 'STAT', URGENT: 'URGENT', ROUTINE: 'ROUTINE' }
export const PRIORITIES = [PRIORITY.STAT, PRIORITY.URGENT, PRIORITY.ROUTINE] // i18n: priority.<value>
export const PRIORITY_RANK = { STAT: 0, URGENT: 1, ROUTINE: 2 }

export const STUDY_STATUS = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_REPORT: 'PENDING_REPORT',
  COMPLETED: 'COMPLETED',
}
export const STUDY_STATUSES = Object.values(STUDY_STATUS) // i18n: status.<value>
export const STATUS_RANK = { IN_PROGRESS: 0, PENDING_REPORT: 1, ASSIGNED: 2, NEW: 3, COMPLETED: 4 }

export const AI_DRAFT_STATUS = { READY: 'READY', PROCESSING: 'PROCESSING', FAILED: 'FAILED', NOT_AVAILABLE: 'NOT_AVAILABLE' }

// Target report turnaround from acquisition, in minutes.
export const SLA_TARGET_MINUTES = { STAT: 60, URGENT: 240, ROUTINE: 24 * 60 }
// Share of the target after which a study is flagged as at risk.
export const SLA_AT_RISK_RATIO = 0.75

export const SLA_STATE = { OK: 'OK', AT_RISK: 'AT_RISK', BREACHED: 'BREACHED', DONE: 'DONE' }

export const UNASSIGNED = '__unassigned__'
