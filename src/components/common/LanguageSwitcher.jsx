import { MenuItem, TextField } from '@mui/material'
import { useI18n } from '../../i18n/I18nContext.js'

// Hidden until a second locale is registered in i18n/locales/index.js.
export default function LanguageSwitcher({ sx }) {
  const { t, locale, locales, setLocale } = useI18n()
  if (locales.length < 2) return null
  return (
    <TextField
      select
      size="small"
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      slotProps={{ htmlInput: { 'aria-label': t('common.language') } }}
      sx={sx}
    >
      {locales.map((l) => (
        <MenuItem key={l.code} value={l.code}>
          {l.name}
        </MenuItem>
      ))}
    </TextField>
  )
}
