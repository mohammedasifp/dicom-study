import { useState } from 'react'
import { Button, Divider, Menu, MenuItem } from '@mui/material'
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded'
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded'
import { useI18n } from '../../i18n/I18nContext.js'

const TYPES = ['MISSED_SCAN', 'PACS_TRANSFER_STUCK', 'PARTIAL_TRANSFER', 'ID_MISMATCH', 'NOT_VIEWED', 'REPORT_OVERDUE', 'DELIVERY_PENDING']

export default function DemoInjectButton({ busy, onInject }) {
  const { t } = useI18n()
  const [anchor, setAnchor] = useState(null)
  const inject = (types) => {
    setAnchor(null)
    onInject(types)
  }
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="error"
        disabled={busy}
        startIcon={<BugReportRoundedIcon />}
        endIcon={<ArrowDropDownRoundedIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        {t('ops.demo.inject')}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem dense onClick={() => inject()}>
          {t('ops.demo.injectFive')}
        </MenuItem>
        <Divider />
        {TYPES.map((type) => (
          <MenuItem key={type} dense onClick={() => inject([type])}>
            {t(`ops.type.${type}`)}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
