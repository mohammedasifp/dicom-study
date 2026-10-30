import { useCallback, useEffect, useState } from 'react'
import { Box, Button } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useI18n } from '../i18n/I18nContext.js'
import { useNotify } from '../hooks/useNotify.js'
import { errorMessageKey } from '../api/errors.js'
import { finalizeReport, getCurrentUser, getReportDraft, reopenReport, setReviewProgress, startReview } from '../api/worklistService.js'
import StateMessage from '../components/common/StateMessage.jsx'
import ReportingWorkspace from './ReportingWorkspace.jsx'

// Opens the existing report editor for a worklist study: starts the radiologist review (claiming the study when
// unassigned), loads the AI-generated report (or an empty one when AI failed), and syncs review progress,
// finalize and reopen back to the worklist. The backend refuses to open a study while AI is still working.
export default function StudyReportPage({ studyId, onExit }) {
  const { t } = useI18n()
  const notify = useNotify()
  const [state, setState] = useState({ studyId: null, draft: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    getCurrentUser()
      .then((user) => startReview(studyId, user.id))
      .then(() => getReportDraft(studyId))
      .then((draft) => !cancelled && setState({ studyId, draft, error: null }))
      .catch((error) => !cancelled && setState({ studyId, draft: null, error }))
    return () => {
      cancelled = true
    }
  }, [studyId, attempt])

  // Keeps the worklist review status in step with the editor.
  const sync = useCallback(
    (request, successKey) =>
      request
        .then(() => successKey && notify({ severity: 'success', message: t(successKey) }))
        .catch((error) => notify({ severity: 'error', message: t('report.syncFailed', { reason: t(errorMessageKey(error)) }) })),
    [notify, t],
  )

  const onReviewedChange = useCallback(
    (reviewed) => sync(setReviewProgress(studyId, reviewed), reviewed ? 'report.syncedReviewed' : null),
    [sync, studyId],
  )

  const current = state.studyId === studyId && (state.draft || state.error)

  if (!current) {
    return <StateMessage variant="loading" title={t('report.loading')} sx={{ height: '100%' }} />
  }

  if (state.error) {
    const aiPending = state.error.code === 'AI_REPORT_NOT_READY'
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
        <StateMessage
          variant={aiPending ? 'empty' : 'error'}
          title={state.error.code === 'NOT_FOUND' ? t('report.notFound') : aiPending ? t('report.aiPendingTitle') : t('report.loadError')}
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
                  {aiPending ? t('report.checkAgain') : t('common.retry')}
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
      onReviewedChange={onReviewedChange}
      onFinalized={(reviewer) => sync(finalizeReport(studyId, reviewer), 'report.syncedFinalized')}
      onReopened={() => sync(reopenReport(studyId), 'report.syncedReopen')}
    />
  )
}
