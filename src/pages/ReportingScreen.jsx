import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, CircularProgress, IconButton, Snackbar, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { assignRadiologist, getReportData, getStudy, openEventStream } from '../api/backend.js'
import { readSession } from '../auth/session.js'
import { toDraft } from '../api/adapter.js'
import AiProgressDialog from '../components/AiProgressDialog.jsx'
import RerunDialog from '../components/RerunDialog.jsx'
import ReportingWorkspace from './ReportingWorkspace.jsx'
import { chrome } from '../theme.js'

function aiPhaseOf(study) {
  if (study.status === 'AI_PROCESSING') return 'processing'
  if (study.status === 'AI_FAILED') return 'failed'
  return 'done'
}

async function fetchState(uid) {
  try {
    const study = await getStudy(uid)
    const data = await getReportData(uid)
    const ai = data.ai || study.ai || {}
    return { phase: 'ready', aiPhase: aiPhaseOf(study), study, draft: toDraft({ study, report: data.report, ai }) }
  } catch (err) {
    return { phase: 'error', message: err.message }
  }
}

function StatusShell({ study, onExit, children }) {
  const patient = (study && study.patient) || {}
  return (
    <Stack sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 1.5, height: 56, bgcolor: chrome.bg, flexShrink: 0 }}>
        <IconButton size="small" onClick={onExit} sx={{ color: chrome.muted }}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        {study && (
          <Typography sx={{ color: chrome.text, fontSize: '0.84rem', fontWeight: 650 }}>
            {(patient.name || 'Unknown').replace(/\^/g, ' ')} · {study.modality} {study.bodyPart || ''}
          </Typography>
        )}
      </Stack>
      <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 3 }}>{children}</Box>
    </Stack>
  )
}

export default function ReportingScreen({ uid, onExit }) {
  const [state, setState] = useState({ phase: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [rerunOpen, setRerunOpen] = useState(false)
  const [watching, setWatching] = useState(false)
  const [notice, setNotice] = useState(null)
  const aiPhase = useRef(null)

  const apply = useCallback((next) => {
    if (aiPhase.current === 'processing' && next.aiPhase === 'done') setReloadKey((n) => n + 1)
    if (next.aiPhase === 'processing') setWatching(true)
    aiPhase.current = next.aiPhase
    setState(next)
  }, [])

  const load = useCallback(() => fetchState(uid).then(apply), [uid, apply])

  useEffect(() => {
    let alive = true
    fetchState(uid).then((next) => alive && apply(next))
    return () => {
      alive = false
    }
  }, [uid, apply])

  useEffect(
    () =>
      openEventStream({
        AI_COMPLETED: (event) => {
          if (event.studyInstanceUid !== uid) return
          setNotice('The AI draft is ready.')
          load()
        },
        AI_FAILED: (event) => {
          if (event.studyInstanceUid === uid) load()
        },
        REPORT_OVERDUE: (event) => {
          if (event.studyInstanceUid !== uid) return
          setNotice('This report is now overdue.')
          setState((s) => (s.draft ? { ...s, draft: { ...s.draft, study: { ...s.draft.study, sla: { ...s.draft.study.sla, overdueAt: event.payload && event.payload.overdueAt } } } } : s))
        },
      }),
    [uid, load],
  )

  useEffect(() => {
    if (state.aiPhase !== 'processing') return undefined
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [state.aiPhase, load])

  const unclaimed = Boolean(state.study && state.study.status !== 'REPORTED' && !state.study.assignedTo && !(state.study.assignment && state.study.assignment.radiologist))
  useEffect(() => {
    const session = readSession()
    const me = session && session.user && session.user.id
    if (unclaimed && me) assignRadiologist(uid, me).catch(() => {})
  }, [uid, unclaimed])

  const openRerun = () => {
    setWatching(false)
    setRerunOpen(true)
  }

  const toast = (
    <Snackbar
      open={Boolean(notice)}
      autoHideDuration={5000}
      onClose={() => setNotice(null)}
      message={notice || ''}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    />
  )

  if (state.phase !== 'ready') {
    return (
      <StatusShell study={state.study} onExit={onExit}>
        {state.phase === 'loading' && <CircularProgress size={28} />}
        {state.phase === 'error' && (
          <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 420 }}>
            <ErrorOutlineRoundedIcon sx={{ fontSize: 44, color: 'error.main' }} />
            <Typography sx={{ fontWeight: 700 }}>Could not open this study</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>{state.message}</Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setState({ phase: 'loading' })
                load()
              }}
            >
              Try again
            </Button>
          </Stack>
        )}
        {toast}
      </StatusShell>
    )
  }

  const ai = state.study.ai || {}
  return (
    <>
      <Stack sx={{ height: '100%' }}>
        {state.aiPhase === 'failed' && !watching && (
          <Alert
            className="no-print"
            severity={ai.failureReason === 'OUT_OF_SCOPE' ? 'warning' : 'error'}
            sx={{ borderRadius: 0, py: 0, flexShrink: 0 }}
            action={
              <Button color="inherit" size="small" onClick={openRerun}>
                Run the AI again
              </Button>
            }
          >
            {ai.failureReason === 'OUT_OF_SCOPE' ? 'The AI declined the instruction' : 'AI analysis failed'}
            {ai.error ? `: ${ai.error}` : ''}. You can report manually.
          </Alert>
        )}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ReportingWorkspace
            key={`${uid}-${reloadKey}`}
            uid={uid}
            draft={state.draft}
            onExit={onExit}
            onRerun={openRerun}
            onSlaChange={(sla) => setState((s) => ({ ...s, draft: { ...s.draft, study: { ...s.draft.study, sla } } }))}
            onReload={() => {
              setNotice('Previous AI draft restored.')
              load().then(() => setReloadKey((n) => n + 1))
            }}
          />
        </Box>
      </Stack>
      <AiProgressDialog
        open={watching && state.aiPhase !== 'done'}
        phase={state.aiPhase}
        ai={ai}
        onClose={() => setWatching(false)}
        onRerun={openRerun}
      />
      <RerunDialog
        open={rerunOpen}
        uid={uid}
        modality={state.study.modality}
        currentModelId={ai.model && ai.model.id}
        replacesDraft
        onClose={() => setRerunOpen(false)}
        onStarted={() => {
          setRerunOpen(false)
          setWatching(true)
          aiPhase.current = 'processing'
          setState((s) => ({ ...s, aiPhase: 'processing', study: { ...s.study, status: 'AI_PROCESSING', ai: {} } }))
        }}
      />
      {toast}
    </>
  )
}
