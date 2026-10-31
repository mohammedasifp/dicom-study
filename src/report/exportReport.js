import { extractReport, scanSuggestions } from '../editor/authorshipMarks.js'

export const DISCLAIMER =
  'AI-assisted draft. This is not a verified diagnosis. All clinical content must be reviewed and confirmed by a qualified radiologist before use.'

export const DISCLAIMER_SHORT = 'AI-assisted draft · not a diagnosis · must be reviewed by a qualified radiologist'

export const NO_AI_DISCLAIMER = 'AI analysis failed for this study. The radiologist wrote this report without an AI draft.'

export const NO_AI_DISCLAIMER_SHORT = 'AI analysis failed · report written by the radiologist without an AI draft'

const blockText = (block) => {
  if (block.runs) return block.runs.map((r) => r.text).join('')
  if (block.rows) return block.rows.map((row) => row.map((c) => c.text).join(' | ')).join('\n')
  return ''
}

export function sectionText(sections, title) {
  const section = sections.find((s) => s.title.toLowerCase() === title.toLowerCase())
  if (!section) return ''
  return section.blocks.map(blockText).filter(Boolean).join('\n')
}

const countWords = (text) => (text.match(/[\p{L}\p{N}]+/gu) || []).length

export function measureAuthorship(sections) {
  let ai = 0
  let reviewer = 0
  sections.forEach((section) =>
    section.blocks.forEach((block) =>
      (block.runs || []).forEach((run) => {
        if (run.author === 'ai') ai += countWords(run.text)
        if (run.author === 'reviewer') reviewer += countWords(run.text)
      }),
    ),
  )
  const total = ai + reviewer
  if (!total) return undefined
  const aiPercent = Math.round((ai / total) * 1000) / 10
  return { aiPercent, humanPercent: Math.round((100 - aiPercent) * 10) / 10, source: 'editor authorship marks' }
}

export function buildStructuredReport({ draft, review, editor, events = [] }) {
  const sections = editor ? extractReport(editor.state.doc) : []
  const scans = editor ? scanSuggestions(editor.state.doc) : {}

  const final = Boolean(review.finalized)
  const aiDraft = Boolean(draft.model && draft.model.id)
  return {
    reportType: final ? 'FINAL_REVIEWED_DRAFT' : 'AI_DRAFT_UNDER_REVIEW',
    label: final ? 'Final Reviewed Draft' : aiDraft ? 'AI Draft (under review)' : 'Draft (under review)',
    disclaimer: aiDraft ? DISCLAIMER : NO_AI_DISCLAIMER,
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
      finalText: scans[s.id] ? scans[s.id].fullText : null,
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
    authorship: measureAuthorship(sections) || null,
    auditTrail: events,
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
