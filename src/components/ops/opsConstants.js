export const EXCEPTION_VIEWS = ['active', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'all']

export function matchesView(exception, view) {
  if (view === 'all') return true
  if (view === 'active') return exception.status !== 'RESOLVED'
  return exception.status === view
}
