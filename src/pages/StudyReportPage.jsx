import { useEffect, useState } from 'react'
import { Box, Button } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useI18n } from '../i18n/I18nContext.js'
import { useNotify } from '../hooks/useNotify.js'
import { errorMessageKey } from '../api/errors.js'
import { completeReport, getCurrentUser, getReportDraft, reopenReport, startReporting } from '../api/worklistService.js'
import StateMessage from '../components/common/StateMessage.jsx'
import ReportingWorkspace from './ReportingWorkspace.jsx'

// Opens the existing report editor for a worklist study: claims the study for the current
// radiologist (when unassigned), loads its draft, and syncs finalize / reopen back to the worklist.
export default function StudyReportPage({ studyId, onExit }) {
  const { t } = useI18n()
  const notify = useNotify()
  const [state, setState] = useState({ studyId: null, draft: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    getCurrentUser()
      .then((user) => startReporting(studyId, user.id))
      .then(() => getReportDraft(studyId))
      .then((draft) => !cancelled && setState({ studyId, draft, error: null }))
      .catch((error) => !cancelled && setState({ studyId, draft: null, error }))
    return () => {
      cancelled = true
    }
  }, [studyId, attempt])

  // Keeps the worklist status in step with the editor's finalize / reopen.
  const sync = (request, successKey) =>
    request
      .then(() => notify({ severity: 'success', message: t(successKey) }))
      .catch((error) => notify({ severity: 'error', message: t('report.syncFailed', { reason: t(errorMessageKey(error)) }) }))

  const current = state.studyId === studyId && (state.draft || state.error)

  if (!current) {
    return <StateMessage variant="loading" title={t('report.loading')} sx={{ height: '100%' }} />
  }

  if (state.error) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
        <StateMessage
          variant="error"
          title={state.error.code === 'NOT_FOUND' ? t('report.notFound') : t('report.loadError')}
          description={t(errorMessageKey(state.error))}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={onExit}>
                {t('report.backToWorklist')}
              </Button>
              {state.error.code !== 'NOT_FOUND' && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setState({ studyId: null, draft: null, error: null })
                    setAttempt((n) => n + 1)
                  }}
                >
                  {t('common.retry')}
                </Button>
              )}
            </Box>
          }
        />
      </Box>
    )
  }

  return (
    <ReportingWorkspace
      key={studyId}
      draft={state.draft}
      onExit={onExit}
      onFinalized={(reviewer) => sync(completeReport(studyId, reviewer), 'report.syncedComplete')}
      onReopened={() => sync(reopenReport(studyId), 'report.syncedReopen')}
    />
  )
}
