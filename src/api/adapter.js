export const toIsoDate = (dicomDate) =>
  /^\d{8}$/.test(dicomDate || '') ? `${dicomDate.slice(0, 4)}-${dicomDate.slice(4, 6)}-${dicomDate.slice(6, 8)}` : dicomDate || null

export function ageAt(birthDate, studyDate) {
  const birth = toIsoDate(birthDate)
  const at = toIsoDate(studyDate)
  if (!birth || !at) return '-'
  const b = new Date(birth)
  const s = new Date(at)
  let years = s.getFullYear() - b.getFullYear()
  if (s < new Date(s.getFullYear(), b.getMonth(), b.getDate())) years -= 1
  return Number.isFinite(years) && years >= 0 ? `${years} Y` : '-'
}

const SEX = { M: 'M', F: 'F', O: 'O' }

const shortTitle = (text) => {
  const words = text.replace(/[.;:]+$/, '').split(/\s+/).slice(0, 5).join(' ')
  return words.length > 38 ? `${words.slice(0, 36)}…` : words
}

function findImage(study, sopInstanceUid) {
  for (const [index, series] of (study.series || []).entries()) {
    const instance = series.instances.find((i) => i.sopInstanceUid === sopInstanceUid)
    if (instance) {
      return {
        studyInstanceUID: study.studyInstanceUid,
        seriesInstanceUID: series.seriesInstanceUid,
        sopInstanceUID: instance.sopInstanceUid,
        // BACKEND SPEC (B6): seriesNumber per series; until then the series position stands in.
        seriesNumber: series.seriesNumber ?? index + 1,
        seriesDescription: series.description || series.modality || 'Series',
        instanceNumber: instance.instanceNumber ?? '-',
      }
    }
  }
  return null
}

function toSuggestion(s, study, ai) {
  const observation = (ai.observations || []).find((o) => o.id === s.observationId) || {}
  const roi = (ai.rois || []).find((r) => r.observationId === s.observationId)
  // BACKEND SPEC (B3): every observation carries `source`; today only localisable ones have an ROI to borrow it from.
  const sourceSop = (observation.source && observation.source.sopInstanceUid) || (roi && roi.sopInstanceUid)
  return {
    id: s.observationId,
    // BACKEND SPEC (B3): `section`; until then every observation is a finding.
    section: observation.section || s.section || 'findings',
    // BACKEND SPEC (B3): `title`; until then the first words of the text.
    observation: observation.title || s.title || shortTitle(s.aiText),
    text: s.aiText,
    confidence: typeof s.confidence === 'number' ? s.confidence : null,
    limitation: observation.limitation || s.limitation || null,
    source: sourceSop ? findImage(study, sourceSop) : null,
    // BACKEND SPEC (B4): `shape`, `imageWidth`, `imageHeight`; until then a pixel rect sized against the rendered image.
    roi: roi
      ? { shape: roi.shape || 'rect', units: 'px', x: roi.x, y: roi.y, width: roi.width, height: roi.height, imageWidth: roi.imageWidth, imageHeight: roi.imageHeight }
      : null,
    decision: s.decision || 'pending',
    reviewerText: s.reviewerText || null,
  }
}

export function toDraft({ study, report, ai }) {
  const patient = study.patient || {}
  const model = report.model || ai.model || {}
  const suggestions = (report.suggestions || []).map((s) => toSuggestion(s, study, ai))
  const hasImpressionPoints = suggestions.some((s) => s.section === 'impression')

  return {
    draftId: report._id,
    version: 1,
    generatedAt: ai.completedAt || report.createdAt,
    model: {
      zoo: 'Model Zoo',
      id: model.id,
      name: model.name || model.id || 'AI model',
      version: model.version || '-',
      task: [study.modality, study.bodyPart].filter(Boolean).join(' ') + (ai.mode ? ` · ${ai.mode} mode` : ''),
      runId: null,
    },
    patient: {
      name: (patient.name || 'Unknown').replace(/\^/g, ' ').trim(),
      patientId: patient.patientId || '-',
      age: ageAt(patient.birthDate, study.studyDate),
      sex: SEX[patient.sex] || '-',
    },
    study: {
      studyInstanceUID: study.studyInstanceUid,
      accessionNumber: study.accessionNumber || '-',
      description: study.description || [study.modality, study.bodyPart].filter(Boolean).join(' ') || 'Study',
      modality: study.modality || '-',
      studyDate: toIsoDate(study.studyDate),
      // BACKEND SPEC (B6): referringPhysician.
      referringPhysician: study.referringPhysician || '-',
      status: study.status,
      sla: study.sla || null,
    },
    // BACKEND SPEC (B6): clinicalHistory and technique; until then the sections start empty for the reviewer.
    clinicalHistory: study.clinicalHistory || '',
    technique: study.technique || '',
    // BACKEND SPEC (B3): impression as observations; until then the AI's single impression string is plain AI text.
    impressionText: hasImpressionPoints ? '' : (report.impression && report.impression.text) || '',
    uncertainty: report.uncertainty || ai.uncertainty || '',
    limitations: report.limitations || ai.limitations || [],
    suggestions,
    // BACKEND SPEC (B1): `report.body` (editor JSON) once saved; null means build the page from the draft.
    body: report.body || null,
    status: report.status,
    reviewer: report.reviewer || null,
    finalisedAt: report.finalisedAt || null,
  }
}
