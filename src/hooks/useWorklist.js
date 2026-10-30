import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { assignStudy, deleteStudy, getCurrentUser, listRadiologists, listStudies } from '../api/worklistService.js'
import { errorMessageKey } from '../api/errors.js'
import { appConfig } from '../config/appConfig.js'
import { AI_REPORT_STATUS } from '../constants/study.js'
import { isAiPending } from '../worklist/reviewWorkflow.js'
import { useI18n } from '../i18n/I18nContext.js'
import { useNotify } from './useNotify.js'

// Loads the worklist and reference data, and exposes worklist mutations.
// status: 'loading' | 'ready' | 'error'. Background refreshes keep the current rows visible.
export function useWorklist() {
  const { t } = useI18n()
  const notify = useNotify()
  const [state, setState] = useState({ status: 'loading', error: null, studies: [], radiologists: [], currentUser: null })
  const [refreshing, setRefreshing] = useState(false)
  const [busyIds, setBusyIds] = useState([])
  const requestId = useRef(0)
  const busyRef = useRef(new Set())
  const previousStudies = useRef(null)

  const load = useCallback(
    async ({ background = false, silent = false } = {}) => {
      const id = ++requestId.current
      if (background) setRefreshing(true)
      else setState((s) => ({ ...s, status: 'loading', error: null }))
      try {
        const [studies, radiologists, currentUser] = await Promise.all([listStudies(), listRadiologists(), getCurrentUser()])
        if (id !== requestId.current) return
        announceAiReady(previousStudies.current, studies, currentUser, notify, t)
        previousStudies.current = studies
        setState({ status: 'ready', error: null, studies, radiologists, currentUser })
      } catch (error) {
        if (id !== requestId.current) return
        if (background) {
          if (!silent) notify({ severity: 'warning', message: t('worklist.refreshFailed', { reason: t(errorMessageKey(error)) }) })
        } else {
          setState((s) => ({ ...s, status: 'error', error }))
        }
      } finally {
        if (id === requestId.current) setRefreshing(false)
      }
    },
    [notify, t],
  )

  useEffect(() => {
    load()
  }, [load])

  // Silent background poll so new studies and AI status changes appear without user action;
  // faster while any study is still with the AI service.
  const aiPending = state.studies.some(isAiPending)
  useEffect(() => {
    const timer = setInterval(() => load({ background: true, silent: true }), aiPending ? appConfig.aiStatusRefreshMs : appConfig.worklistRefreshMs)
    return () => clearInterval(timer)
  }, [load, aiPending])

  const radiologistsById = useMemo(() => Object.fromEntries(state.radiologists.map((r) => [r.id, r])), [state.radiologists])

  const assign = useCallback(
    async (studyId, radiologistId) => {
      if (busyRef.current.has(studyId)) return // ignore duplicate clicks while a request is in flight
      busyRef.current.add(studyId)
      setBusyIds([...busyRef.current])
      try {
        const updated = await assignStudy(studyId, radiologistId)
        setState((s) => ({ ...s, studies: s.studies.map((st) => (st.id === updated.id ? updated : st)) }))
        notify({
          severity: 'success',
          message: radiologistId
            ? t('assignment.assigned', { patient: updated.patient.name, name: radiologistsById[radiologistId]?.name || '' })
            : t('assignment.unassignedDone', { patient: updated.patient.name }),
        })
      } catch (error) {
        notify({ severity: 'error', message: t('assignment.failed', { reason: t(errorMessageKey(error)) }) })
      } finally {
        busyRef.current.delete(studyId)
        setBusyIds([...busyRef.current])
      }
    },
    [notify, t, radiologistsById],
  )

  const remove = useCallback(
    async (study) => {
      if (busyRef.current.has(study.id)) return
      busyRef.current.add(study.id)
      setBusyIds([...busyRef.current])
      try {
        await deleteStudy(study.id)
        setState((s) => ({ ...s, studies: s.studies.filter((st) => st.id !== study.id) }))
        notify({ severity: 'success', message: t('deleteStudy.done', { patient: study.patient.name }) })
      } catch (error) {
        notify({ severity: 'error', message: t('deleteStudy.failed', { reason: error.message || t(errorMessageKey(error)) }) })
      } finally {
        busyRef.current.delete(study.id)
        setBusyIds([...busyRef.current])
      }
    },
    [notify, t],
  )

  return {
    ...state,
    radiologistsById,
    refreshing,
    busyIds,
    refresh: () => load({ background: state.status === 'ready' }),
    assign,
    remove,
  }
}

// Tells the radiologist when AI reports they can pick up (theirs or unassigned) have just become ready.
function announceAiReady(before, after, currentUser, notify, t) {
  if (!before || !currentUser) return
  const wasPending = new Set(before.filter(isAiPending).map((s) => s.id))
  const ready = after.filter(
    (s) => wasPending.has(s.id) && s.aiReportStatus === AI_REPORT_STATUS.READY && (!s.assignedTo || s.assignedTo === currentUser.id),
  )
  if (!ready.length) return
  notify({
    severity: 'info',
    message:
      ready.length === 1
        ? t('aiReport.readyNotice', { patient: ready[0].patient.name, study: ready[0].description })
        : t('aiReport.readyNoticeMany', { count: ready.length }),
  })
}
