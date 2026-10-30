import { PRIORITY, REVIEW_STATUS as R } from '../constants/study.js'
import { isOverdue } from './sla.js'
import { isAiReportReady, isFinalized } from './reviewWorkflow.js'

// Quick-access views. ctx = { userId, now }. Labels: i18n `queues.<id>`, group labels: `queues.groups.<group>`.
// The AI and review groups filter on independent statuses, so a study can appear in one of each.
const isOpen = (s) => !isFinalized(s)

export const QUEUES = [
  { id: 'all', group: 'worklists', match: () => true },
  { id: 'mine', group: 'worklists', match: (s, ctx) => isOpen(s) && s.assignedTo === ctx.userId },
  { id: 'unassigned', group: 'worklists', match: (s) => isOpen(s) && !s.assignedTo },
  { id: 'overdue', group: 'worklists', match: (s, ctx) => isOpen(s) && isOverdue(s, ctx.now), tone: 'danger' },
  { id: 'stat', group: 'priority', match: (s) => isOpen(s) && s.priority === PRIORITY.STAT, tone: 'danger' },
  { id: 'urgent', group: 'priority', match: (s) => isOpen(s) && s.priority === PRIORITY.URGENT, tone: 'warning' },
  { id: 'routine', group: 'priority', match: (s) => isOpen(s) && s.priority === PRIORITY.ROUTINE },
  { id: 'aiReady', group: 'ai', match: (s) => isOpen(s) && isAiReportReady(s) },
  { id: 'aiNotReady', group: 'ai', match: (s) => isOpen(s) && !isAiReportReady(s) },
  { id: 'pendingReview', group: 'review', match: (s) => s.reviewStatus === R.PENDING_REVIEW },
  { id: 'underReview', group: 'review', match: (s) => s.reviewStatus === R.UNDER_REVIEW },
  { id: 'reviewed', group: 'review', match: (s) => s.reviewStatus === R.REVIEWED },
  { id: 'finalized', group: 'review', match: (s) => s.reviewStatus === R.FINALIZED },
]

export const QUEUE_GROUPS = ['worklists', 'priority', 'ai', 'review']
export const DEFAULT_QUEUE = 'all'

const byId = Object.fromEntries(QUEUES.map((q) => [q.id, q]))

export function filterByQueue(studies, queueId, ctx) {
  const queue = byId[queueId] || byId[DEFAULT_QUEUE]
  return studies.filter((s) => queue.match(s, ctx))
}

export function countQueues(studies, ctx) {
  return Object.fromEntries(QUEUES.map((q) => [q.id, studies.filter((s) => q.match(s, ctx)).length]))
}
