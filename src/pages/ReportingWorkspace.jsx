import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Box, Button, Snackbar, Stack } from '@mui/material'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { draftReport } from '../data/draftReport.js'
import { initReview, reviewCounts, reviewReducer } from '../report/reviewReducer.js'
import { buildStructuredReport, downloadJson } from '../report/exportReport.js'
import { keyImageContent } from '../report/keyImages.js'
import { focusSuggestion, removeSuggestion, restoreSuggestion, revertSuggestion } from '../editor/authorshipMarks.js'
import WorkspaceHeader from '../components/WorkspaceHeader.jsx'
import ReportPanel from '../components/ReportPanel.jsx'
import ViewerPane from '../components/ViewerPane.jsx'
import FinalizeDialog from '../components/FinalizeDialog.jsx'
import HistoryDrawer from '../components/HistoryDrawer.jsx'
import PrintableReport from '../components/PrintableReport.jsx'

const SECTION_TITLES = { findings: 'Findings', impression: 'Impression' }

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const aiSpan = (s) => `<span data-suggestion-id="${s.id}">${escapeHtml(s.text)}</span>`

function buildInitialContent(draft) {
  const of = (section) => draft.suggestions.filter((s) => s.section === section)
  return [
    `<h3>Clinical history</h3><p>${escapeHtml(draft.clinicalHistory)}</p>`,
    `<h3>Technique</h3><p>${escapeHtml(draft.technique)}</p>`,
    `<h3>${SECTION_TITLES.findings}</h3>${of('findings').map((s) => `<p>${aiSpan(s)}</p>`).join('')}`,
    `<h3>${SECTION_TITLES.impression}</h3><ol>${of('impression').map((s) => `<li><p>${aiSpan(s)}</p></li>`).join('')}</ol>`,
  ].join('')
}

const PRESETS = {
  report: { report: 100, viewer: 0 },
  viewer: { report: 0, viewer: 100 },
}

const splitPreset = () => (window.innerWidth < 1500 ? { report: 62, viewer: 38 } : { report: 56, viewer: 44 })

function layoutMode(layout) {
  if (layout.viewer < 1) return 'report'
  if (layout.report < 1) return 'viewer'
  return 'split'
}

// `draft` defaults to the bundled demo draft (#/report); worklist studies pass their own (pages/StudyReportPage.jsx).
export default function ReportingWorkspace({ draft = draftReport, onExit, onFinalized, onReopened }) {
  const initialContent = useMemo(() => buildInitialContent(draft), [draft])
  const suggestions = useMemo(() => draft.suggestions.map((s, i) => ({ ...s, index: i + 1 })), [draft])
  const suggestionInfo = useMemo(() => Object.fromEntries(suggestions.map((s) => [s.id, s])), [suggestions])
  const [defaultLayout] = useState(splitPreset)
  const [review, dispatch] = useReducer(reviewReducer, draft, initReview)
  const [showAuthorship, setShowAuthorship] = useState(false)
  const [editor, setEditor] = useState(null)
  const [hoverId, setHoverId] = useState(null)
  const [layoutTick, setLayoutTick] = useState(0)
  const [layout, setLayout] = useState('split')
  const [keyImages, setKeyImages] = useState([])
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [printReport, setPrintReport] = useState(null)
  const [toast, setToast] = useState(null)
  const groupRef = useRef(null)
  const tickFrame = useRef(0)

  const counts = reviewCounts(review.statuses)
  const readOnly = Boolean(review.finalized)

  const discarded = suggestions.filter((s) => review.statuses[s.id] === 'discarded').map((s) => ({ suggestion: s, index: s.index }))

  const changeLayout = (mode) => {
    if (groupRef.current) groupRef.current.setLayout(PRESETS[mode] || splitPreset())
    setLayout(mode)
  }

  const onEditorReady = useCallback((ed) => setEditor(ed), [])
  const onScan = useCallback((result) => dispatch({ type: 'scan', result }), [])
  const onSuggestionFocus = useCallback((id) => dispatch({ type: 'setActive', id }), [])
  const onTransaction = useCallback(() => {
    cancelAnimationFrame(tickFrame.current)
    tickFrame.current = requestAnimationFrame(() => setLayoutTick((n) => n + 1))
  }, [])

  useEffect(() => {
    const onResize = () => onTransaction()
    window.addEventListener('resize', onResize)
    document.fonts.ready.then(onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [onTransaction])

  const focus = (s) => {
    dispatch({ type: 'setActive', id: s.id })
    if (editor) focusSuggestion(editor, s.id)
  }

  const step = (direction, fromId = review.activeId) => {
    const start = suggestions.findIndex((s) => s.id === fromId)
    for (let i = 1; i <= suggestions.length; i += 1) {
      const candidate = suggestions[(start + direction * i + suggestions.length * 2) % suggestions.length]
      if (review.statuses[candidate.id] === 'pending' && candidate.id !== fromId) {
        focus(candidate)
        return
      }
    }
  }

  const restore = (s) => {
    if (readOnly || !editor || review.statuses[s.id] !== 'discarded') return
    const sameSection = suggestions.filter((x) => x.section === s.section)
    const laterIds = sameSection.slice(sameSection.findIndex((x) => x.id === s.id) + 1).map((x) => x.id)
    restoreSuggestion(editor, s, laterIds, SECTION_TITLES[s.section])
    dispatch({ type: 'setActive', id: s.id })
  }

  function openInViewer(s) {
    if (!s || !s.source) return
    dispatch({ type: 'showInViewer', id: s.id, source: s.source })
    if (layout === 'report') changeLayout('split')
  }

  const onReviewAction = (action, id) => {
    const s = id ? suggestionInfo[id] : null
    const status = s ? review.statuses[s.id] : null
    switch (action) {
      case 'select':
        if (s) focus(s)
        break
      case 'accept':
        if (status !== 'pending' || readOnly) break
        dispatch({ type: 'accept', id: s.id })
        step(1, s.id)
        break
      case 'discard':
        if (status !== 'pending' || readOnly || !editor) break
        removeSuggestion(editor, s.id)
        setToast({ id: s.id, message: `#${s.index} ${s.observation} discarded` })
        step(1, s.id)
        break
      case 'unaccept':
        if (status === 'accepted' && !readOnly) dispatch({ type: 'unaccept', id: s.id })
        break
      case 'revert':
        if (status !== 'edited' || readOnly || !editor) break
        revertSuggestion(editor, s)
        dispatch({ type: 'revert', id: s.id })
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

  const insertKeyImage = (image) => {
    if (!editor || readOnly) return
    editor.chain().focus().insertContent(keyImageContent(image)).run()
  }

  const buildReport = () => buildStructuredReport({ draft, review, editor })

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
          onReopen={() => {
            dispatch({ type: 'reopen' })
            onReopened?.()
          }}
        />

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Group
            orientation="horizontal"
            groupRef={groupRef}
            defaultLayout={defaultLayout}
            onLayoutChanged={(next) => {
              setLayout(layoutMode(next))
              onTransaction()
            }}
            style={{ height: '100%' }}
          >
            <Panel id="report" minSize="40" collapsible collapsedSize={0}>
              <ReportPanel
                draft={draft}
                initialContent={initialContent}
                suggestions={suggestions}
                statuses={review.statuses}
                counts={counts}
                finalized={review.finalized}
                showAuthorship={showAuthorship}
                onToggleAuthorship={() => setShowAuthorship((v) => !v)}
                editor={editor}
                activeId={review.activeId}
                hoverId={hoverId}
                showingId={review.showingId}
                layoutTick={layoutTick}
                discarded={discarded}
                onEditorReady={onEditorReady}
                onScan={onScan}
                onSuggestionFocus={onSuggestionFocus}
                onReviewAction={onReviewAction}
                onHover={setHoverId}
                onTransaction={onTransaction}
                onRestore={restore}
                onFinalize={() => setFinalizeOpen(true)}
              />
            </Panel>
            <Separator className="resize-handle" />
            <Panel id="viewer" minSize="24" collapsible collapsedSize={0}>
              <ViewerPane
                study={draft.study}
                target={review.viewerTarget}
                keyImages={keyImages}
                onCapture={(src) =>
                  setKeyImages((list) => [...list, { id: `${Date.now()}`, src, caption: `Key image ${list.length + 1}` }])
                }
                onInsertKeyImage={insertKeyImage}
                onRemoveKeyImage={(id) => setKeyImages((list) => list.filter((img) => img.id !== id))}
              />
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
          onFinalized?.(reviewer)
        }}
      />
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} history={review.history} suggestions={draft.suggestions} />
      <PrintableReport report={printReport} />
      <Snackbar
        key={toast ? toast.id : 'none'}
        open={Boolean(toast)}
        autoHideDuration={6000}
        onClose={(_e, reason) => reason !== 'clickaway' && setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message={toast ? toast.message : ''}
        action={
          <Button
            size="small"
            sx={{ color: '#c4b5fd' }}
            onClick={() => {
              restore(suggestionInfo[toast.id])
              setToast(null)
            }}
          >
            Undo
          </Button>
        }
        slotProps={{ content: { sx: { bgcolor: '#1e293b', fontSize: '0.8rem', borderRadius: 2 } } }}
        sx={{ mb: 4 }}
      />
    </>
  )
}
