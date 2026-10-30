// Locale-aware formatting. `intlLocale` comes from the active locale definition.

export function formatDateTime(iso, intlLocale) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(intlLocale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function formatDate(iso, intlLocale) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(intlLocale, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDayMonth(iso, intlLocale) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(intlLocale, { day: '2-digit', month: 'short' })
}

export function formatTime(iso, intlLocale) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(intlLocale, { hour: '2-digit', minute: '2-digit' })
}

// Compact elapsed time, e.g. "45m", "3h 10m", "2d 4h". Units come from the translator.
export function formatDuration(minutes, t) {
  const m = Math.max(0, Math.floor(minutes))
  if (m < 60) return t('time.minutes', { m })
  const h = Math.floor(m / 60)
  if (h < 24) return t('time.hoursMinutes', { h, m: m % 60 })
  return t('time.daysHours', { d: Math.floor(h / 24), h: h % 24 })
}
