import { useCallback, useEffect, useRef, useState } from 'react'
import { decideSuggestion, saveReport } from '../api/backend.js'
import { extractReport } from '../editor/authorshipMarks.js'
import { measureAuthorship, sectionText } from '../report/exportReport.js'
import { getReviewer } from '../report/reviewer.js'

const EDIT_DELAY = 900
const SAVE_DELAY = 1500

export function buildSavePayload(editor) {
  const sections = extractReport(editor.state.doc)
  return {
    body: editor.getJSON(),
    findings: sectionText(sections, 'Findings'),
    impression: sectionText(sections, 'Impression'),
    reviewer: getReviewer(),
    authorship: measureAuthorship(sections),
  }
}

export function useBackendSync({ uid, editor, statuses, texts, readOnly, onError }) {
  const sent = useRef(null)
  const timers = useRef({})
  const inflight = useRef(new Set())
  const errorRef = useRef(onError)
  const [saveState, setSaveState] = useState({ status: 'idle', at: null })

  useEffect(() => {
    errorRef.current = onError
  })

  const track = useCallback((promise) => {
    inflight.current.add(promise)
    promise.finally(() => inflight.current.delete(promise))
    return promise
  }, [])

  const sendDecision = useCallback(
    (id, status, text) =>
      track(
        decideSuggestion(uid, id, { decision: status, text: status === 'edited' ? text : undefined, reviewer: getReviewer() })
          .then(() => {
            sent.current[id] = { status, text }
          })
          .catch((err) => errorRef.current(`Could not save the decision: ${err.message}`)),
      ),
    [uid, track],
  )

  const save = useCallback(() => {
    if (!editor) return Promise.resolve()
    setSaveState((s) => ({ ...s, status: 'saving' }))
    return track(
      saveReport(uid, buildSavePayload(editor))
        .then(() => setSaveState({ status: 'saved', at: new Date() }))
        .catch((err) => {
          setSaveState((s) => ({ ...s, status: 'error' }))
          errorRef.current(`Could not save the report: ${err.message}`)
        }),
    )
  }, [uid, editor, track])

  useEffect(() => {
    if (!sent.current) {
      sent.current = Object.fromEntries(Object.keys(statuses).map((id) => [id, { status: statuses[id], text: texts[id] }]))
      return
    }
    if (readOnly) return
    Object.keys(statuses).forEach((id) => {
      const status = statuses[id]
      const text = texts[id]
      const last = sent.current[id] || {}
      if (last.status === status && (status !== 'edited' || last.text === text)) return
      clearTimeout(timers.current[id])
      const run = () => {
        delete timers.current[id]
        sendDecision(id, status, text)
      }
      if (status === 'edited') timers.current[id] = setTimeout(run, EDIT_DELAY)
      else run()
    })
  }, [statuses, texts, readOnly, sendDecision])

  const scheduleSave = useCallback(() => {
    if (readOnly) return
    clearTimeout(timers.current.__save)
    timers.current.__save = setTimeout(() => {
      delete timers.current.__save
      save()
    }, SAVE_DELAY)
  }, [readOnly, save])

  const flush = useCallback(async () => {
    const pending = Object.keys(timers.current)
    pending.forEach((key) => clearTimeout(timers.current[key]))
    timers.current = {}
    pending.filter((key) => key !== '__save').forEach((id) => sendDecision(id, statuses[id], texts[id]))
    await save()
    await Promise.allSettled([...inflight.current])
  }, [save, sendDecision, statuses, texts])

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), [])

  return { saveState, scheduleSave, saveNow: save, flush }
}
