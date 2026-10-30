export const STATUS = {
  pending: 'pending',
  accepted: 'accepted',
  edited: 'edited',
  discarded: 'discarded',
}

const event = (actor, action, suggestionId = null, detail = '') => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  at: new Date().toISOString(),
  actor,
  action,
  suggestionId,
  detail,
})

export function initReview(draft) {
  return {
    suggestions: draft.suggestions,
    statuses: Object.fromEntries(draft.suggestions.map((s) => [s.id, STATUS.pending])),
    history: [
      event(
        'AI',
        'Draft generated',
        null,
        draft.model
          ? `${draft.model.name} v${draft.model.version} (${draft.model.zoo}) · ${draft.suggestions.length} suggestions`
          : 'No AI draft for this study · manual report',
      ),
    ],
    finalized: null,
    activeId: draft.suggestions.length ? draft.suggestions[0].id : null,
    showingId: null,
    viewerTarget: null,
  }
}

function deriveStatus(current, original, scan) {
  if (!scan || !scan.text.trim()) return STATUS.discarded
  const changed = scan.text !== original || scan.fragments > 1
  if (changed) return STATUS.edited
  if (current === STATUS.discarded) return STATUS.pending
  return current
}

const ACTION_LABEL = {
  [STATUS.edited]: 'Edited',
  [STATUS.discarded]: 'Discarded',
  [STATUS.pending]: 'Restored',
  [STATUS.accepted]: 'Accepted',
}

export function reviewReducer(state, action) {
  switch (action.type) {
    case 'accept':
    case 'unaccept': {
      const next = action.type === 'accept' ? STATUS.accepted : STATUS.pending
      return {
        ...state,
        statuses: { ...state.statuses, [action.id]: next },
        history: [
          ...state.history,
          event('Reviewer', action.type === 'accept' ? 'Accepted' : 'Moved back to pending', action.id),
        ],
      }
    }
    case 'revert':
      return {
        ...state,
        statuses: { ...state.statuses, [action.id]: STATUS.pending },
        history: [...state.history, event('Reviewer', 'Reverted to AI wording', action.id)],
      }
    case 'scan': {
      const statuses = { ...state.statuses }
      const events = []
      state.suggestions
        .forEach((s) => {
          const current = statuses[s.id]
          const next = deriveStatus(current, s.text, action.result[s.id])
          if (next === current) return
          statuses[s.id] = next
          const detail = next === STATUS.edited ? action.result[s.id].text : ''
          events.push(event('Reviewer', ACTION_LABEL[next], s.id, detail))
        })
      if (!events.length) return state
      return { ...state, statuses, history: [...state.history, ...events] }
    }
    case 'finalize':
      return {
        ...state,
        finalized: { reviewer: action.reviewer, at: new Date().toISOString() },
        activeId: null,
        history: [...state.history, event('Reviewer', 'Finalized as reviewed draft', null, action.reviewer)],
      }
    case 'reopen':
      return {
        ...state,
        finalized: null,
        history: [...state.history, event('Reviewer', 'Reopened for editing')],
      }
    case 'setActive':
      return state.activeId === action.id ? state : { ...state, activeId: action.id }
    case 'showInViewer':
      return { ...state, activeId: action.id, showingId: action.id, viewerTarget: action.source }
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
