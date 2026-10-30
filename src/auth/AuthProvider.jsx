import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { clearSession, readSession, saveSession } from './session.js'
import { login as apiLogin, logout as apiLogout } from '../api/authService.js'
import { setUnauthorizedHandler } from '../api/httpClient.js'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const login = useCallback(async (username, password) => {
    const next = await apiLogin(username, password)
    saveSession(next)
    setSession(next)
  }, [])

  // Sign-out is local first: the user is never kept on screen waiting for the server.
  const endSession = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const logout = useCallback(() => {
    apiLogout().catch(() => {})
    endSession()
  }, [endSession])

  useEffect(() => setUnauthorizedHandler(endSession), [endSession])

  const value = useMemo(() => ({ user: session?.user ?? null, login, logout }), [session, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
