// Data contracts shared by the mock and HTTP implementations. Backend responses must map to these shapes;
// if the wire format differs, adapt it in the HTTP implementation, not in the UI.

/**
 * @typedef {'CT'|'MR'|'XR'|'US'} Modality
 * @typedef {'STAT'|'URGENT'|'ROUTINE'} Priority
 * @typedef {'RECEIVED'|'PROCESSING'|'READY'|'FAILED'} AiReportStatus  Set by the backend AI pipeline only
 * @typedef {'NO_MODEL'|'OUT_OF_SCOPE'|'INCOMPLETE_STUDY'|'PROCESSING_ERROR'} AiFailureReason
 * @typedef {'PENDING_REVIEW'|'UNDER_REVIEW'|'REVIEWED'|'FINALIZED'} ReviewStatus  Set by radiologist actions only
 *
 * @typedef {Object} Patient
 * @property {string} name
 * @property {string} uhid        Hospital patient ID
 * @property {string} age         Display age, e.g. "57 Y", "14 D"
 * @property {'M'|'F'|'O'} sex
 *
 * @typedef {Object} Study
 * @property {string} id
 * @property {string} studyInstanceUID
 * @property {string} accessionNumber
 * @property {Patient} patient
 * @property {'OP'|'IP'|'ER'} patientClass
 * @property {Modality} modality
 * @property {string} description
 * @property {string} bodyPart
 * @property {string} studyDateTime  ISO 8601, acquisition time
 * @property {string} referringDoctor
 * @property {Priority} priority
 * @property {string|null} assignedTo  Radiologist id
 * @property {AiReportStatus} aiReportStatus
 * @property {string} aiReportUpdatedAt  ISO 8601, last AI status change
 * @property {AiFailureReason|null} aiFailureReason  Set when aiReportStatus is FAILED
 * @property {string|null} [aiFailureMessage]  Backend's own failure text, when it provides one
 * @property {ReviewStatus} reviewStatus
 * @property {boolean} imagesAvailable  Study has reached PACS
 * @property {number} seriesCount
 * @property {number} instanceCount
 * @property {string} clinicalHistory
 * @property {string|null} reportedAt  ISO 8601, when the report was finalized
 *
 * @typedef {Object} Radiologist
 * @property {string} id
 * @property {string} name
 * @property {string} initials
 * @property {string} subspecialty
 *
 * @typedef {Object} ReportDraft  Input of the existing report editor (pages/ReportingWorkspace.jsx).
 * @property {string} draftId
 * @property {number} version
 * @property {string|null} generatedAt
 * @property {{zoo:string,name:string,version:string,task:string,runId:string}|null} model  null = no AI draft
 * @property {{name:string,patientId:string,age:string,sex:string}} patient
 * @property {{studyInstanceUID:string,accessionNumber:string,description:string,modality:string,studyDate:string,referringPhysician:string}} study
 * @property {string} clinicalHistory
 * @property {string} technique
 * @property {string[]} limitations
 * @property {Array<Object>} suggestions
 */

export {}
