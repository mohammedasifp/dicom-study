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

const AGE_TOKEN = /^(\d{1,3})\s*([YMWD])?\s*\/?\s*([MFO])?$/i

// Some centres put the age inside the DICOM name, as in "RAHUL^46Y/M" or "SANAM AHMAD 43/F".
export function patientIdentity(patient, studyDate, unknownSex) {
  const parts = (patient.name || '').split(/[\^\s]+/).filter(Boolean)
  const ageToken = parts.map((p) => p.match(AGE_TOKEN)).find(Boolean)
  const kept = parts.filter((p) => !AGE_TOKEN.test(p))
  let tokenSex = ageToken && ageToken[3]
  const last = kept[kept.length - 1]
  if (ageToken && kept.length > 1 && /^[MFO]$/i.test(last)) {
    kept.pop()
    tokenSex = tokenSex || last
  }
  const age = ageAt(patient.birthDate, studyDate)
  return {
    name: kept.join(' ') || 'Unknown',
    age: age === '-' && ageToken ? `${ageToken[1]} ${(ageToken[2] || 'Y').toUpperCase()}` : age,
    sex: SEX[patient.sex] || (tokenSex ? tokenSex.toUpperCase() : unknownSex),
  }
}


const SEX = { M: 'M', F: 'F', O: 'O' }

const shortTitle = (text) => {
  const words = text.replace(/[.;:]+$/, '').split(/\s+/).slice(0, 5).join(' ')
  return words.length > 38 ? `${words.slice(0, 36)}…` : words
}

function findImage(study, sopInstanceUid, frame) {
  for (const [index, series] of (study.series || []).entries()) {
    const instance = series.instances.find((i) => i.sopInstanceUid === sopInstanceUid)
    if (instance) {
      return {
        studyInstanceUID: study.studyInstanceUid,
        seriesInstanceUID: series.seriesInstanceUid,
        sopInstanceUID: instance.sopInstanceUid,
        seriesNumber: series.seriesNumber ?? index + 1,
        seriesDescription: series.description || series.modality || 'Series',
        instanceNumber: frame ?? instance.instanceNumber ?? '-',
        frame,
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
    source: sourceSop ? findImage(study, sourceSop, source.frame || undefined) : null,
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
      ...patientIdentity(patient, study.studyDate, '-'),
      patientId: patient.patientId || '-',
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
      series: (study.series || []).map((s, index) => ({
        number: s.seriesNumber ?? index + 1,
        description: s.description || s.modality || 'Series',
        instanceNumbers: s.instances.map((i) => i.instanceNumber).sort((a, b) => a - b),
      })),
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
