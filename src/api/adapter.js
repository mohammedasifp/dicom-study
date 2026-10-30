export const toIsoDate = (dicomDate) =>
  /^\d{8}$/.test(dicomDate || '') ? `${dicomDate.slice(0, 4)}-${dicomDate.slice(4, 6)}-${dicomDate.slice(6, 8)}` : dicomDate || null

export function toIsoDateTime(dicomDate, dicomTime) {
  const date = toIsoDate(dicomDate)
  if (!date || !/^\d{4}/.test(dicomTime || '')) return date
  const t = dicomTime.padEnd(6, '0')
  return `${date}T${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4, 6)}`
}

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
  const source = s.source || observation.source || {}
  const sourceSop = source.sopInstanceUid || (roi && roi.sopInstanceUid)
  return {
    id: s.observationId,
    section: s.section || observation.section || 'findings',
    observation: s.title || observation.title || shortTitle(s.aiText),
    text: s.aiText,
    confidence: typeof s.confidence === 'number' ? s.confidence : null,
    limitation: s.limitation || observation.limitation || null,
    source: sourceSop ? findImage(study, sourceSop) : null,
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
      studyDate: toIsoDateTime(study.studyDate, study.studyTime),
      referringPhysician: study.referringPhysician || '-',
      status: study.status,
      sla: study.sla || null,
    },
    clinicalHistory: study.clinicalHistory || '',
    technique: study.technique || '',
    impressionText: hasImpressionPoints ? '' : (report.impression && report.impression.text) || '',
    uncertainty: report.uncertainty || ai.uncertainty || '',
    limitations: report.limitations || ai.limitations || [],
    suggestions,
    body: report.body || null,
    status: report.status,
    reviewer: report.reviewer || null,
    finalisedAt: report.finalisedAt || null,
    hasPreviousAi: Boolean(study.previousAi && study.previousAi.completedAt),
  }
}
