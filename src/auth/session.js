import { setAuthTokenProvider } from '../api/httpClient.js'

// The signed-in session ({ token, user }) lives in sessionStorage: it survives a page refresh but not closing
// the tab, which suits shared reporting workstations.
const KEY = 'seebetter.session'

export function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function saveSession(session) {
  sessionStorage.setItem(KEY, JSON.stringify(session))
}

// Signing out also drops the saved worklist view, so the next user starts clean.
export function clearSession() {
  sessionStorage.clear()
}

setAuthTokenProvider(() => readSession()?.token ?? null)
