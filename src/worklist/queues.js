import { PRIORITY, STUDY_STATUS as S } from '../constants/study.js'
import { isOverdue } from './sla.js'

// Quick-access views. ctx = { userId, now }. Labels: i18n `queues.<id>`, group labels: `queues.groups.<group>`.
const isOpen = (s) => s.status !== S.COMPLETED

export const QUEUES = [
  { id: 'all', group: 'worklists', match: () => true },
  { id: 'mine', group: 'worklists', match: (s, ctx) => isOpen(s) && s.assignedTo === ctx.userId },
  { id: 'unassigned', group: 'worklists', match: (s) => isOpen(s) && !s.assignedTo },
  { id: 'overdue', group: 'worklists', match: (s, ctx) => isOpen(s) && isOverdue(s, ctx.now), tone: 'danger' },
  { id: 'stat', group: 'priority', match: (s) => isOpen(s) && s.priority === PRIORITY.STAT, tone: 'danger' },
  { id: 'urgent', group: 'priority', match: (s) => isOpen(s) && s.priority === PRIORITY.URGENT, tone: 'warning' },
  { id: 'routine', group: 'priority', match: (s) => isOpen(s) && s.priority === PRIORITY.ROUTINE },
  { id: 'new', group: 'status', match: (s) => s.status === S.NEW },
  { id: 'inProgress', group: 'status', match: (s) => s.status === S.IN_PROGRESS },
  { id: 'pendingReport', group: 'status', match: (s) => s.status === S.PENDING_REPORT },
  { id: 'completed', group: 'status', match: (s) => s.status === S.COMPLETED },
]

export const QUEUE_GROUPS = ['worklists', 'priority', 'status']
export const DEFAULT_QUEUE = 'all'

const byId = Object.fromEntries(QUEUES.map((q) => [q.id, q]))

export function filterByQueue(studies, queueId, ctx) {
  const queue = byId[queueId] || byId[DEFAULT_QUEUE]
  return studies.filter((s) => queue.match(s, ctx))
}

export function countQueues(studies, ctx) {
  return Object.fromEntries(QUEUES.map((q) => [q.id, studies.filter((s) => q.match(s, ctx)).length]))
}
