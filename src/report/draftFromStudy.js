// Builds the report editor's input (ReportDraft, see api/models.js) for a worklist study.
// Demographics always come from the worklist record so the editor header matches the row the radiologist opened.

function editorHeader(study) {
  return {
    patient: { name: study.patient.name, patientId: study.patient.uhid, age: study.patient.age, sex: study.patient.sex },
    study: {
      studyInstanceUID: study.studyInstanceUID,
      accessionNumber: study.accessionNumber,
      description: study.description,
      modality: study.modality,
      studyDate: study.studyDateTime,
      referringPhysician: study.referringDoctor,
    },
  }
}

// aiDraft: an AI draft for this study, or null to open an empty report (no AI suggestions).
export function draftFromStudy(study, aiDraft) {
  if (aiDraft) return { ...aiDraft, ...editorHeader(study), clinicalHistory: study.clinicalHistory || aiDraft.clinicalHistory }
  return {
    draftId: `manual_${study.id}`,
    version: 1,
    generatedAt: null,
    model: null,
    ...editorHeader(study),
    clinicalHistory: study.clinicalHistory || '',
    technique: '',
    limitations: [],
    suggestions: [],
  }
}
