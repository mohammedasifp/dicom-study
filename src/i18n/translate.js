import { LOCALES } from './locales/index.js'
import { appConfig } from '../config/appConfig.js'

const lookup = (messages, key) => key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), messages)

const interpolate = (text, params) =>
  text.replace(/\{\{(\w+)\}\}/g, (match, name) => (params[name] === undefined ? match : String(params[name])))

// t('worklist.count', { count: 3 }) — plural entries are objects with `one` / `other` (and optional `zero`).
export function createTranslator(locale) {
  const messages = LOCALES[locale]?.messages || {}
  const fallback = LOCALES[appConfig.defaultLocale].messages

  return function t(key, params = {}) {
    let value = lookup(messages, key)
    if (value === undefined) value = lookup(fallback, key)
    if (value === undefined) {
      if (import.meta.env.DEV) console.warn(`[i18n] missing key "${key}"`)
      return key
    }
    if (typeof value === 'object') {
      const count = Number(params.count ?? 0)
      value = (count === 0 && value.zero) || (count === 1 ? value.one : value.other) || ''
    }
    return interpolate(value, params)
  }
}
