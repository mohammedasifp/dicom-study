import en from './en.js'

// To add a language: create <code>.js with the same key structure as en.js and register it here.
// Missing keys fall back to English.
export const LOCALES = {
  en: { name: 'English', intl: 'en-IN', messages: en },
}
