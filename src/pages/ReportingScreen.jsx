import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, IconButton, Snackbar, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { getReportData, getStudy, openEventStream } from '../api/backend.js'
import { toDraft } from '../api/adapter.js'
import RerunDialog from '../components/RerunDialog.jsx'
import ReportingWorkspace from './ReportingWorkspace.jsx'
import { chrome } from '../theme.js'

const PROCESSING = ['RECEIVED', 'AI_PROCESSING']

async function fetchState(uid) {
  try {
    const study = await getStudy(uid)
    if (PROCESSING.includes(study.status)) return { phase: 'processing', study }
    if (study.status === 'AI_FAILED') return { phase: 'failed', study }
    const data = await getReportData(uid)
    return { phase: 'ready', study, draft: toDraft({ study, report: data.report, ai: data.ai || study.ai || {} }) }
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
  const [notice, setNotice] = useState(null)

  const load = useCallback(() => fetchState(uid).then(setState), [uid])

  useEffect(() => {
    let alive = true
    fetchState(uid).then((next) => alive && setState(next))
    return () => {
      alive = false
    }
  }, [uid])

  useEffect(
    () =>
      openEventStream({
        AI_COMPLETED: (event) => {
          if (event.studyInstanceUid !== uid) return
          setNotice('The AI draft is ready.')
          setReloadKey((n) => n + 1)
          load()
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
    if (state.phase !== 'processing') return undefined
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [state.phase, load])

  const rerun = (
    <RerunDialog
      open={rerunOpen}
      uid={uid}
      modality={state.study && state.study.modality}
      currentModelId={state.study && state.study.ai && state.study.ai.model && state.study.ai.model.id}
      replacesDraft={state.phase === 'ready'}
      onClose={() => setRerunOpen(false)}
      onStarted={() => {
        setRerunOpen(false)
        setState((s) => ({ phase: 'processing', study: s.study }))
      }}
    />
  )

  const toast = (
    <Snackbar
      open={Boolean(notice)}
      autoHideDuration={5000}
      onClose={() => setNotice(null)}
      message={notice || ''}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    />
  )

  if (state.phase === 'ready') {
    return (
      <>
        <ReportingWorkspace
          key={`${uid}-${reloadKey}`}
          uid={uid}
          draft={state.draft}
          onExit={onExit}
          onRerun={() => setRerunOpen(true)}
          onSlaChange={(sla) => setState((s) => ({ ...s, draft: { ...s.draft, study: { ...s.draft.study, sla } } }))}
          onReload={() => {
            setNotice('Previous AI draft restored.')
            load().then(() => setReloadKey((n) => n + 1))
          }}
        />
        {rerun}
        {toast}
      </>
    )
  }

  return (
    <StatusShell study={state.study} onExit={onExit}>
      {state.phase === 'loading' && <CircularProgress size={28} />}

      {state.phase === 'processing' && (
        <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 420 }}>
          <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={56} thickness={2.5} sx={{ color: '#8b5cf6' }} />
            <AutoAwesomeRoundedIcon sx={{ position: 'absolute', color: '#7c3aed' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>The AI is analysing this study</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>
            {state.study.ai && state.study.ai.requestedModel ? `Model: ${state.study.ai.requestedModel}. ` : ''}
            The draft report opens here automatically when it is ready.
          </Typography>
        </Stack>
      )}

      {state.phase === 'failed' && (
        <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 460 }}>
          <ErrorOutlineRoundedIcon sx={{ fontSize: 44, color: 'error.main' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>The AI analysis failed</Typography>
          {state.study.ai && state.study.ai.error && (
            <Alert severity="error" variant="outlined" sx={{ textAlign: 'left', width: '100%' }}>
              {state.study.ai.error}
            </Alert>
          )}
          <Button variant="contained" onClick={() => setRerunOpen(true)}>
            Run the AI again
          </Button>
        </Stack>
      )}

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
      {rerun}
      {toast}
    </StatusShell>
  )
}
