import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { assignStudy, getCurrentUser, listRadiologists, listStudies } from '../api/worklistService.js'
import { errorMessageKey } from '../api/errors.js'
import { appConfig } from '../config/appConfig.js'
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

  const load = useCallback(
    async ({ background = false, silent = false } = {}) => {
      const id = ++requestId.current
      if (background) setRefreshing(true)
      else setState((s) => ({ ...s, status: 'loading', error: null }))
      try {
        const [studies, radiologists, currentUser] = await Promise.all([listStudies(), listRadiologists(), getCurrentUser()])
        if (id !== requestId.current) return
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
    // Initial fetch, then a silent background poll so new studies appear without user action.
    load()
    const timer = setInterval(() => load({ background: true, silent: true }), appConfig.worklistRefreshMs)
    return () => clearInterval(timer)
  }, [load])

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

  return {
    ...state,
    radiologistsById,
    refreshing,
    busyIds,
    refresh: () => load({ background: state.status === 'ready' }),
    assign,
  }
}
