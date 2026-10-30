import { useState } from 'react'
import { CircularProgress, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { useI18n } from '../../i18n/I18nContext.js'
import { useNotify } from '../../hooks/useNotify.js'
import { getReportPdf } from '../../api/backend.js'
import { errorMessageKey } from '../../api/errors.js'
import { isAiPending } from '../../worklist/reviewWorkflow.js'
import { actionIconSx, actionIconTones } from '../../styles/tokens.js'

const fileName = (study) => `report_${(study.patient.uhid || study.id).replace(/[^\w-]+/g, '_')}_${study.studyDateTime.slice(0, 10)}.pdf`

// View or download the report PDF straight from the worklist, without opening the editor.
// The PDF is produced by the backend (GET /api/studies/:uid/report/pdf) for AI drafts and manual reports alike.
export default function ReportPdfMenu({ study }) {
  const { t } = useI18n()
  const notify = useNotify()
  const [anchor, setAnchor] = useState(null)
  const [busy, setBusy] = useState(false)
  const available = !isAiPending(study)

  const run = async (kind) => {
    setAnchor(null)
    if (busy) return
    // Open the tab inside the click so pop-up blockers allow it; the PDF is loaded into it when it arrives.
    const tab = kind === 'view' ? window.open('', '_blank') : null
    setBusy(true)
    try {
      const url = URL.createObjectURL(await getReportPdf(study.studyInstanceUID))
      if (tab) tab.location.href = url
      else {
        const a = document.createElement('a')
        a.href = url
        a.download = fileName(study)
        a.click()
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error) {
      if (tab) tab.close()
      notify({ severity: 'error', message: t('reportPdf.failed', { reason: t(errorMessageKey(error)) }) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Tooltip title={available ? t('reportPdf.menu') : t('reportPdf.unavailable')}>
        <span>
          <IconButton
            size="small"
            disabled={!available || busy}
            aria-label={t('reportPdf.menu')}
            aria-haspopup="menu"
            onClick={(e) => {
              e.stopPropagation()
              setAnchor(e.currentTarget)
            }}
            sx={actionIconSx(actionIconTones.pdf)}
          >
            {busy ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : <PictureAsPdfOutlinedIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => run('view')}>
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('reportPdf.view')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => run('download')}>
          <ListItemIcon>
            <FileDownloadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('reportPdf.download')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
