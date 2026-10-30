// Data contracts shared by the mock and HTTP implementations. Backend responses must map to these shapes;
// if the wire format differs, adapt it in the HTTP implementation, not in the UI.

/**
 * @typedef {'CT'|'MR'|'XR'|'US'} Modality
 * @typedef {'STAT'|'URGENT'|'ROUTINE'} Priority
 * @typedef {'NEW'|'ASSIGNED'|'IN_PROGRESS'|'PENDING_REPORT'|'COMPLETED'} StudyStatus
 * @typedef {'READY'|'PROCESSING'|'FAILED'|'NOT_AVAILABLE'} AiDraftStatus
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
 * @property {StudyStatus} status
 * @property {string|null} assignedTo  Radiologist id
 * @property {AiDraftStatus} aiDraftStatus
 * @property {boolean} imagesAvailable  Study has reached PACS
 * @property {number} seriesCount
 * @property {number} instanceCount
 * @property {string} clinicalHistory
 * @property {string|null} reportedAt  ISO 8601
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
