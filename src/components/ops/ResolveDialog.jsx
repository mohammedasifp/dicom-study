import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material'
import { useI18n } from '../../i18n/I18nContext.js'

const MIN_NOTE = 3

export default function ResolveDialog({ exception, onCancel, onConfirm }) {
  const { t } = useI18n()
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)
  const tooShort = note.trim().length < MIN_NOTE

  const submit = () => {
    setTouched(true)
    if (!tooShort) onConfirm(note.trim())
  }

  return (
    <Dialog open onClose={onCancel} maxWidth="sm" fullWidth aria-labelledby="resolve-dialog-title">
      <DialogTitle id="resolve-dialog-title" sx={{ pb: 1 }}>
        {t('ops.resolve.title', { type: t(`ops.type.${exception.type}`) })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: '0.875rem', mb: 1.5 }}>
          {exception.patient.name} · {exception.description}. {t('ops.resolve.message')}
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={3}
          label={t('ops.resolve.note')}
          placeholder={t('ops.resolve.placeholder')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => setTouched(true)}
          error={touched && tooShort}
          helperText={touched && tooShort ? t('ops.resolve.tooShort') : ' '}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={submit} variant="contained">
          {t('ops.resolve.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
