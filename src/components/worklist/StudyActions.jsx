import { Button, IconButton, Stack, Tooltip } from '@mui/material'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import ImageSearchRoundedIcon from '@mui/icons-material/ImageSearchRounded'
import { useI18n } from '../../i18n/I18nContext.js'
import { viewerUrl } from '../../api/pacsService.js'
import { REPORT_ACTION, reportAction } from '../../worklist/reviewWorkflow.js'
import { AssignMenu } from './Assignment.jsx'
import { actionIconSx, actionIconTones } from '../../styles/tokens.js'
import ReportPdfMenu from './ReportPdfMenu.jsx'

const ACTION_ICONS = {
  [REPORT_ACTION.VIEW_EDIT]: <EditNoteRoundedIcon />,
  [REPORT_ACTION.MANUAL]: <EditRoundedIcon />,
  [REPORT_ACTION.VIEW]: <DescriptionOutlinedIcon />,
  [REPORT_ACTION.AWAITING_AI]: <HourglassTopRoundedIcon />,
}

// Row actions: open the report editor, view / download the report PDF, open images in OHIF, assignment menu.
// The editor opens only once the AI service has finished; there is deliberately no way to start AI processing here.
export default function StudyActions({ study, radiologists, currentUserId, busy, onOpen, onAssign, onDelete, fullWidth = false }) {
  const { t } = useI18n()
  const stop = (e) => e.stopPropagation()
  const action = reportAction(study)
  const disabled = action === REPORT_ACTION.AWAITING_AI

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap', flexShrink: 0, width: fullWidth ? '100%' : 'auto' }}>
      <Tooltip title={t(`actionHint.${action}`)}>
        {/* span keeps the tooltip working on the disabled button */}
        <Stack component="span" sx={{ flex: fullWidth ? 1 : 'none' }}>
          <Button
            size="small"
            variant={action === REPORT_ACTION.VIEW ? 'outlined' : 'contained'}
            startIcon={ACTION_ICONS[action]}
            disabled={disabled}
            onClick={(e) => {
              stop(e)
              onOpen(study)
            }}
            sx={{ minWidth: 112, whiteSpace: 'nowrap' }}
          >
            {t(`actions.${action === REPORT_ACTION.AWAITING_AI ? REPORT_ACTION.VIEW_EDIT : action}`)}
          </Button>
        </Stack>
      </Tooltip>
      <ReportPdfMenu study={study} />
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
            sx={actionIconSx(actionIconTones.images)}
          >
            <ImageSearchRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <AssignMenu study={study} radiologists={radiologists} currentUserId={currentUserId} busy={busy} onAssign={(id) => onAssign(study.id, id)} onDelete={() => onDelete(study)} />
    </Stack>
  )
}
