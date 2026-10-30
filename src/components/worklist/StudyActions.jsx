import { Button, IconButton, Stack, Tooltip } from '@mui/material'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import ImageSearchRoundedIcon from '@mui/icons-material/ImageSearchRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import { viewerUrl } from '../../api/pacsService.js'
import { STUDY_STATUS } from '../../constants/study.js'
import { AssignMenu } from './Assignment.jsx'

// Row actions: open the report editor, open images in OHIF, assignment menu.
export default function StudyActions({ study, radiologists, currentUserId, busy, onOpen, onAssign, fullWidth = false }) {
  const { t } = useI18n()
  const stop = (e) => e.stopPropagation()
  const completed = study.status === STUDY_STATUS.COMPLETED

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap', flexShrink: 0, width: fullWidth ? '100%' : 'auto' }}>
      <Button
        size="small"
        variant={completed ? 'outlined' : 'contained'}
        startIcon={<EditNoteRoundedIcon />}
        onClick={(e) => {
          stop(e)
          onOpen(study)
        }}
        sx={{ flex: fullWidth ? 1 : 'none', flexShrink: 0, minWidth: 88, whiteSpace: 'nowrap' }}
      >
        {completed ? t('actions.viewReport') : t('actions.report')}
      </Button>
      <Tooltip title={study.imagesAvailable ? t('actions.openImages') : t('actions.imagesUnavailable')}>
        <span>
          <IconButton
            size="small"
            component="a"
            href={viewerUrl(study.studyInstanceUID)}
            target="_blank"
            rel="noreferrer"
            disabled={!study.imagesAvailable}
            onClick={stop}
            aria-label={t('actions.openImages')}
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <ImageSearchRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <AssignMenu study={study} radiologists={radiologists} currentUserId={currentUserId} busy={busy} onAssign={(id) => onAssign(study.id, id)} />
    </Stack>
  )
}
