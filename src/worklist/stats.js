import { AI_REPORT_STATUS as AI, PRIORITY, REVIEW_STATUS as R } from '../constants/study.js'
import { isOverdue } from './sla.js'
import { isFinalized } from './reviewWorkflow.js'

const sameDay = (iso, now) => iso && new Date(iso).toDateString() === new Date(now).toDateString()

// Headline numbers for the dashboard cards. Each maps to a queue the card opens.
export function worklistStats(studies, ctx) {
  const open = studies.filter((s) => !isFinalized(s))
  const finalizedToday = studies.filter((s) => isFinalized(s) && sameDay(s.reportedAt, ctx.now))
  const aiReady = open.filter((s) => s.aiReportStatus === AI.READY)
  return {
    statOpen: open.filter((s) => s.priority === PRIORITY.STAT).length,
    statUnassigned: open.filter((s) => s.priority === PRIORITY.STAT && !s.assignedTo).length,
    aiReady: aiReady.length,
    aiReadyNotStarted: aiReady.filter((s) => s.reviewStatus === R.PENDING_REVIEW).length,
    overdue: open.filter((s) => isOverdue(s, ctx.now)).length,
    myOpen: open.filter((s) => s.assignedTo === ctx.userId).length,
    myOverdue: open.filter((s) => s.assignedTo === ctx.userId && isOverdue(s, ctx.now)).length,
    unassigned: open.filter((s) => !s.assignedTo).length,
    finalizedToday: finalizedToday.length,
    myFinalizedToday: finalizedToday.filter((s) => s.assignedTo === ctx.userId).length,
  }
}
