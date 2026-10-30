import { createContext, useContext } from 'react'

export const NotifyContext = createContext(null)

// notify({ severity: 'success' | 'error' | 'warning' | 'info', message, action? })
export function useNotify() {
  const notify = useContext(NotifyContext)
  if (!notify) throw new Error('useNotify must be used inside <NotificationProvider>')
  return notify
}
