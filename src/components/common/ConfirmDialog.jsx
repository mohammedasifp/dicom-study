import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { useI18n } from '../../i18n/I18nContext.js'

export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  const { t } = useI18n()
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth aria-labelledby="confirm-dialog-title">
      <DialogTitle id="confirm-dialog-title" sx={{ pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: '0.875rem' }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained" autoFocus>
          {confirmLabel || t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
