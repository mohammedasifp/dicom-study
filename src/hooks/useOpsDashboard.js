import { useCallback, useEffect, useRef, useState } from 'react'
import {
  acknowledgeException,
  assignException,
  getOpsDashboard,
  openEventStream,
  resolveException,
} from '../api/backend.js'
import { errorMessageKey } from '../api/errors.js'
import { getCurrentUser, listRadiologists } from '../api/worklistService.js'
import { useI18n } from '../i18n/I18nContext.js'
import { useNotify } from './useNotify.js'

const OPS_TAGS = [
  'SIM_STARTED',
  'SIM_FAULT_INJECTED',
  'CASE_STAGE_CHANGED',
  'OPS_EXCEPTION_RAISED',
  'OPS_EXCEPTION_ACKNOWLEDGED',
  'OPS_EXCEPTION_ASSIGNED',
  'OPS_EXCEPTION_RESOLVED',
  'OPS_EXCEPTION_CLEARED',
]
const POLL_MS = 30000
const PUSH_DEBOUNCE_MS = 400

export function useOpsDashboard() {
  const { t } = useI18n()
  const notify = useNotify()
  const [state, setState] = useState({ status: 'loading', error: null, data: null, radiologists: [], currentUser: null })
  const [refreshing, setRefreshing] = useState(false)
  const [busy, setBusy] = useState(null)
  const requestId = useRef(0)

  const load = useCallback(async ({ background = false } = {}) => {
    const id = ++requestId.current
    if (background) setRefreshing(true)
    try {
      const [data, radiologists, currentUser] = await Promise.all([getOpsDashboard(), listRadiologists(), getCurrentUser()])
      if (id === requestId.current) setState({ status: 'ready', error: null, data, radiologists, currentUser })
    } catch (error) {
      if (id === requestId.current && !background) setState((s) => ({ ...s, status: 'error', error }))
    } finally {
      if (id === requestId.current) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(() => load({ background: true }), POLL_MS)
    let pending
    const onPush = () => {
      clearTimeout(pending)
      pending = setTimeout(() => load({ background: true }), PUSH_DEBOUNCE_MS)
    }
    const close = openEventStream(Object.fromEntries(OPS_TAGS.map((tag) => [tag, onPush])))
    return () => {
      clearInterval(timer)
      clearTimeout(pending)
      close()
    }
  }, [load])

  const run = useCallback(
    async (key, action, success) => {
      setBusy(key)
      try {
        const result = await action()
        if (success) notify({ severity: 'success', message: success(result) })
        await load({ background: true })
        return result
      } catch (error) {
        notify({ severity: 'error', message: t('ops.failed', { reason: error.message || t(errorMessageKey(error)) }) })
        return undefined
      } finally {
        setBusy(null)
      }
    },
    [load, notify, t],
  )

  return {
    ...state,
    refreshing,
    busy,
    refresh: () => load({ background: true }),
    acknowledge: (id) => run(id, () => acknowledgeException(id), () => t('ops.done.acknowledged')),
    assign: (id, radiologistId) => run(id, () => assignException(id, radiologistId), (e) => t('ops.done.assigned', { name: e.assignee.name })),
    resolve: (id, note) => run(id, () => resolveException(id, note), () => t('ops.done.resolved')),
  }
}
