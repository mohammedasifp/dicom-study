import { extractReport, scanSuggestions } from '../editor/authorshipMarks.js'

export const DISCLAIMER =
  'AI-assisted draft. This is not a verified diagnosis. All clinical content must be reviewed and confirmed by a qualified radiologist before use.'

export const DISCLAIMER_SHORT = 'AI-assisted draft · not a diagnosis · must be reviewed by a qualified radiologist'

export function buildStructuredReport({ draft, review, editor }) {
  const sections = editor ? extractReport(editor.state.doc) : []
  const scans = editor ? scanSuggestions(editor.state.doc) : {}

  const final = Boolean(review.finalized)
  return {
    reportType: final ? 'FINAL_REVIEWED_DRAFT' : 'AI_DRAFT_UNDER_REVIEW',
    label: final ? 'Final Reviewed Draft' : 'AI Draft (under review)',
    disclaimer: DISCLAIMER,
    exportedAt: new Date().toISOString(),
    draft: { id: draft.draftId, version: draft.version, generatedAt: draft.generatedAt },
    model: draft.model,
    patient: draft.patient,
    study: draft.study,
    sections,
    suggestions: draft.suggestions.map((s) => ({
      id: s.id,
      section: s.section,
      observation: s.observation,
      confidence: s.confidence,
      status: review.statuses[s.id],
      aiText: s.text,
      finalText: scans[s.id] ? scans[s.id].text : null,
      limitation: s.limitation || null,
      source: s.source,
      roi: s.roi,
    })),
    limitations: draft.limitations,
    review: {
      status: final ? 'finalized' : 'in_review',
      reviewer: final ? review.finalized.reviewer : null,
      finalizedAt: final ? review.finalized.at : null,
    },
    auditTrail: review.history,
  }
}

export function downloadJson(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${report.patient.patientId}_${report.study.accessionNumber}_${report.reportType.toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
