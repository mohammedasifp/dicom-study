import { SLA_AT_RISK_RATIO, SLA_STATE, SLA_TARGET_MINUTES, STUDY_STATUS } from '../constants/study.js'

const minutesBetween = (fromIso, toMs) => (toMs - new Date(fromIso).getTime()) / 60000

// Turnaround against the priority's target. Completed studies report their final TAT.
export function slaInfo(study, now) {
  const targetMinutes = SLA_TARGET_MINUTES[study.priority]
  if (study.status === STUDY_STATUS.COMPLETED) {
    const end = study.reportedAt ? new Date(study.reportedAt).getTime() : now
    const elapsedMinutes = minutesBetween(study.studyDateTime, end)
    return { state: SLA_STATE.DONE, elapsedMinutes, targetMinutes, ratio: elapsedMinutes / targetMinutes, metTarget: elapsedMinutes <= targetMinutes }
  }
  const elapsedMinutes = minutesBetween(study.studyDateTime, now)
  const ratio = elapsedMinutes / targetMinutes
  let state = SLA_STATE.OK
  if (ratio >= 1) state = SLA_STATE.BREACHED
  else if (ratio >= SLA_AT_RISK_RATIO) state = SLA_STATE.AT_RISK
  return { state, elapsedMinutes, targetMinutes, ratio, remainingMinutes: targetMinutes - elapsedMinutes }
}

export const isOverdue = (study, now) => slaInfo(study, now).state === SLA_STATE.BREACHED
