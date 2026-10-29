import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Box, Stack } from '@mui/material'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { draftReport } from '../data/draftReport.js'
import { initReview, reviewCounts, reviewReducer } from '../report/reviewReducer.js'
import { buildStructuredReport, downloadJson } from '../report/exportReport.js'
import { focusSuggestion, removeSuggestion, restoreSuggestion } from '../editor/authorshipMarks.js'
import WorkspaceHeader from '../components/WorkspaceHeader.jsx'
import ReportPanel from '../components/ReportPanel.jsx'
import ViewerPane from '../components/ViewerPane.jsx'
import FinalizeDialog from '../components/FinalizeDialog.jsx'
import HistoryDrawer from '../components/HistoryDrawer.jsx'
import PrintableReport from '../components/PrintableReport.jsx'

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const aiSpan = (s) => `<span data-suggestion-id="${s.id}">${escapeHtml(s.text)}</span>`

function buildInitialContent(draft) {
  const of = (section) => draft.suggestions.filter((s) => s.section === section)
  return {
    findings: of('findings').map((s) => `<p>${aiSpan(s)}</p>`).join(''),
    impression: `<ol>${of('impression').map((s) => `<li><p>${aiSpan(s)}</p></li>`).join('')}</ol>`,
  }
}

const PRESETS = {
  report: { report: 100, viewer: 0 },
  viewer: { report: 0, viewer: 100 },
}

const splitPreset = () => (window.innerWidth < 1500 ? { report: 56, viewer: 44 } : { report: 52, viewer: 48 })

function layoutMode(layout) {
  if (layout.viewer < 1) return 'report'
  if (layout.report < 1) return 'viewer'
  return 'split'
}

export default function ReportingWorkspace({ onExit }) {
  const draft = draftReport
  const initialContent = useMemo(() => buildInitialContent(draft), [draft])
  const suggestionInfo = useMemo(
    () => Object.fromEntries(draft.suggestions.map((s, i) => [s.id, { ...s, index: i + 1 }])),
    [draft],
  )
  const [defaultLayout] = useState(splitPreset)
  const [review, dispatch] = useReducer(reviewReducer, draft, initReview)
  const [fields, setFields] = useState({ clinicalHistory: draft.clinicalHistory, technique: draft.technique })
  const [showAuthorship, setShowAuthorship] = useState(true)
  const [activeEditor, setActiveEditor] = useState(null)
  const [layout, setLayout] = useState('split')
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [printReport, setPrintReport] = useState(null)
  const editors = useRef({ findings: null, impression: null })
  const groupRef = useRef(null)

  const counts = reviewCounts(review.statuses)
  const readOnly = Boolean(review.finalized)
  const active = review.activeId ? suggestionInfo[review.activeId] : null

  const discarded = draft.suggestions
    .filter((s) => review.statuses[s.id] === 'discarded')
    .map((s) => ({ suggestion: s, index: suggestionInfo[s.id].index }))

  const changeLayout = (mode) => {
    if (groupRef.current) groupRef.current.setLayout(PRESETS[mode] || splitPreset())
    setLayout(mode)
  }

  const onEditorReady = useCallback((section, editor) => {
    editors.current[section] = editor
    if (section === 'findings') setActiveEditor((current) => current || editor)
  }, [])

  const onEditorFocus = useCallback((_section, editor) => {
    if (editor) setActiveEditor(editor)
  }, [])

  const onScan = useCallback((section, result) => dispatch({ type: 'scan', section, result }), [])
  const onSuggestionFocus = useCallback((id) => dispatch({ type: 'setActive', id }), [])

  const focus = (s) => {
    dispatch({ type: 'setActive', id: s.id })
    const editor = editors.current[s.section]
    if (editor) focusSuggestion(editor, s.id)
  }

  const step = (direction, fromId = review.activeId) => {
    const order = draft.suggestions
    const start = order.findIndex((s) => s.id === fromId)
    for (let i = 1; i <= order.length; i += 1) {
      const idx = (start + direction * i + order.length * 2) % order.length
      const candidate = order[idx]
      if (review.statuses[candidate.id] === 'pending' && candidate.id !== fromId) {
        focus(candidate)
        return
      }
    }
  }

  const onReviewAction = (action, id) => {
    const s = id ? suggestionInfo[id] : null
    const pending = s && review.statuses[s.id] === 'pending'
    switch (action) {
      case 'select':
        if (s) focus(s)
        break
      case 'accept':
        if (pending && !readOnly) dispatch({ type: 'accept', id: s.id })
        break
      case 'discard':
        if (pending && !readOnly && editors.current[s.section]) removeSuggestion(editors.current[s.section], s.id)
        break
      case 'source':
        if (s) openInViewer(s)
        break
      case 'next':
        step(1)
        break
      case 'prev':
        step(-1)
        break
      default:
    }
  }

  const onKeyboardAction = (action, id) => {
    onReviewAction(action, id)
    if (action === 'accept' || action === 'discard') step(1, id)
  }

  function openInViewer(s) {
    if (!s || !s.source) return
    dispatch({ type: 'showInViewer', id: s.id, source: s.source })
    if (layout === 'report') changeLayout('split')
  }

  const buildReport = () => buildStructuredReport({ draft, review, fields, editors: editors.current })

  useEffect(() => {
    if (!printReport) return
    const frame = requestAnimationFrame(() => window.print())
    return () => cancelAnimationFrame(frame)
  }, [printReport])

  return (
    <>
      <Stack className="no-print" sx={{ height: '100%', overflow: 'hidden' }}>
        <WorkspaceHeader
          draft={draft}
          finalized={review.finalized}
          counts={counts}
          layout={layout}
          onLayoutChange={changeLayout}
          onBack={onExit}
          onHistory={() => setHistoryOpen(true)}
          onExportJson={() => downloadJson(buildReport())}
          onExportPdf={() => setPrintReport(buildReport())}
          onFinalize={() => setFinalizeOpen(true)}
          onReopen={() => dispatch({ type: 'reopen' })}
        />

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Group
            orientation="horizontal"
            groupRef={groupRef}
            defaultLayout={defaultLayout}
            onLayoutChanged={(next) => setLayout(layoutMode(next))}
            style={{ height: '100%' }}
          >
            <Panel id="report" minSize="34" collapsible collapsedSize={0}>
              <ReportPanel
                draft={draft}
                fields={fields}
                onFieldChange={(key, value) => setFields((f) => ({ ...f, [key]: value }))}
                initialContent={initialContent}
                suggestionInfo={suggestionInfo}
                statuses={review.statuses}
                counts={counts}
                finalized={review.finalized}
                showAuthorship={showAuthorship}
                onToggleAuthorship={() => setShowAuthorship((v) => !v)}
                activeEditor={activeEditor}
                activeId={review.activeId}
                showingId={review.showingId}
                discarded={discarded}
                onEditorReady={onEditorReady}
                onEditorFocus={onEditorFocus}
                onScan={onScan}
                onSuggestionFocus={onSuggestionFocus}
                onReviewAction={(action, id) =>
                  action.startsWith('kb:') ? onKeyboardAction(action.slice(3), id) : onReviewAction(action, id)
                }
                onRestore={(s) => {
                  const editor = editors.current[s.section]
                  if (editor) restoreSuggestion(editor, s)
                }}
              />
            </Panel>
            <Separator className="resize-handle" />
            <Panel id="viewer" minSize="26" collapsible collapsedSize={0}>
              <ViewerPane study={draft.study} target={review.viewerTarget} active={active} onShowInViewer={() => openInViewer(active)} />
            </Panel>
          </Group>
        </Box>
      </Stack>

      <FinalizeDialog
        key={finalizeOpen ? 'open' : 'closed'}
        open={finalizeOpen}
        counts={counts}
        onClose={() => setFinalizeOpen(false)}
        onConfirm={(reviewer) => {
          dispatch({ type: 'finalize', reviewer })
          setFinalizeOpen(false)
        }}
      />
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={review.history}
        suggestions={draft.suggestions}
      />
      <PrintableReport report={printReport} />
    </>
  )
}
