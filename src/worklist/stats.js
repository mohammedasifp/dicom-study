import { PRIORITY, STUDY_STATUS as S } from '../constants/study.js'
import { isOverdue } from './sla.js'

const sameDay = (iso, now) => iso && new Date(iso).toDateString() === new Date(now).toDateString()

// Headline numbers for the dashboard cards. Each maps to a queue the card opens.
export function worklistStats(studies, ctx) {
  const open = studies.filter((s) => s.status !== S.COMPLETED)
  return {
    statOpen: open.filter((s) => s.priority === PRIORITY.STAT).length,
    statUnassigned: open.filter((s) => s.priority === PRIORITY.STAT && !s.assignedTo).length,
    overdue: open.filter((s) => isOverdue(s, ctx.now)).length,
    myOpen: open.filter((s) => s.assignedTo === ctx.userId).length,
    myOverdue: open.filter((s) => s.assignedTo === ctx.userId && isOverdue(s, ctx.now)).length,
    unassigned: open.filter((s) => !s.assignedTo).length,
    completedToday: studies.filter((s) => s.status === S.COMPLETED && sameDay(s.reportedAt, ctx.now)).length,
    myCompletedToday: studies.filter((s) => s.status === S.COMPLETED && s.assignedTo === ctx.userId && sameDay(s.reportedAt, ctx.now)).length,
  }
}
