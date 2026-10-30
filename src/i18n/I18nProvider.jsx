import { useCallback, useMemo, useState } from 'react'
import { I18nContext } from './I18nContext.js'
import { createTranslator } from './translate.js'
import { LOCALES } from './locales/index.js'
import { appConfig } from '../config/appConfig.js'

const STORAGE_KEY = 'svaim.locale'

function initialLocale() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored && LOCALES[stored] ? stored : appConfig.defaultLocale
}

export default function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(initialLocale)

  const setLocale = useCallback((next) => {
    if (!LOCALES[next]) return
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
    setLocaleState(next)
  }, [])

  const value = useMemo(
    () => ({
      locale,
      intlLocale: LOCALES[locale].intl,
      locales: Object.entries(LOCALES).map(([code, def]) => ({ code, name: def.name })),
      setLocale,
      t: createTranslator(locale),
    }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
