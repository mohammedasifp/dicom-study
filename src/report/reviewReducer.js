export const STATUS = {
  pending: 'pending',
  accepted: 'accepted',
  edited: 'edited',
  discarded: 'discarded',
}

export function initReview(draft) {
  const firstPending = draft.suggestions.find((s) => s.decision === STATUS.pending)
  return {
    suggestions: draft.suggestions,
    statuses: Object.fromEntries(draft.suggestions.map((s) => [s.id, s.decision || STATUS.pending])),
    texts: Object.fromEntries(draft.suggestions.map((s) => [s.id, s.decision === STATUS.edited ? s.reviewerText : s.text])),
    finalized: draft.status === 'final' ? { reviewer: draft.reviewer, at: draft.finalisedAt } : null,
    activeId: draft.status === 'final' ? null : (firstPending || draft.suggestions[0] || {}).id || null,
    showingId: null,
    viewerTarget: null,
    viewerJump: 0,
  }
}

function deriveStatus(current, original, scan) {
  if (!scan || !scan.text.trim()) return STATUS.discarded
  const changed = scan.text !== original || scan.fragments > 1
  if (changed) return STATUS.edited
  if (current === STATUS.discarded) return STATUS.pending
  return current
}

export function reviewReducer(state, action) {
  switch (action.type) {
    case 'accept':
      return { ...state, statuses: { ...state.statuses, [action.id]: STATUS.accepted } }
    case 'unaccept':
    case 'revert':
      return { ...state, statuses: { ...state.statuses, [action.id]: STATUS.pending } }
    case 'scan': {
      const statuses = { ...state.statuses }
      const texts = { ...state.texts }
      let changed = false
      state.suggestions.forEach((s) => {
        const scan = action.result[s.id]
        const next = deriveStatus(statuses[s.id], s.text, scan)
        const text = scan ? scan.fullText : ''
        if (next !== statuses[s.id]) {
          statuses[s.id] = next
          changed = true
        }
        if (text !== texts[s.id]) {
          texts[s.id] = text
          changed = true
        }
      })
      return changed ? { ...state, statuses, texts } : state
    }
    case 'finalize':
      return { ...state, finalized: { reviewer: action.reviewer, at: action.at || new Date().toISOString() }, activeId: null }
    case 'reopen':
      return { ...state, finalized: null }
    case 'setActive':
      return state.activeId === action.id ? state : { ...state, activeId: action.id }
    case 'showInViewer':
      return { ...state, activeId: action.id, showingId: action.id, viewerTarget: action.source, viewerJump: state.viewerJump + 1 }
    default:
      return state
  }
}

export function reviewCounts(statuses) {
  const counts = { pending: 0, accepted: 0, edited: 0, discarded: 0 }
  Object.values(statuses).forEach((s) => {
    counts[s] += 1
  })
  return { ...counts, total: Object.keys(statuses).length, decided: counts.accepted + counts.edited + counts.discarded }
}
