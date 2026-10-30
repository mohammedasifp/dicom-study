import { useCallback, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { NotifyContext } from '../../hooks/useNotify.js'

const DURATION = { success: 3500, info: 4000, warning: 6000, error: 7000 }

// One app-wide toast queue so success / error / warning messages look and behave the same everywhere.
export default function NotificationProvider({ children }) {
  const [queue, setQueue] = useState([])
  const current = queue[0]

  const notify = useCallback((note) => {
    setQueue((q) => [...q, { id: `${Date.now()}-${Math.random()}`, severity: 'info', ...note }])
  }, [])

  const close = (_e, reason) => {
    if (reason === 'clickaway') return
    setQueue((q) => q.slice(1))
  }

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <Snackbar
        key={current?.id}
        open={Boolean(current)}
        autoHideDuration={current ? DURATION[current.severity] : null}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {current ? (
          <Alert severity={current.severity} variant="filled" onClose={close} action={current.action} sx={{ alignItems: 'center' }}>
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotifyContext.Provider>
  )
}
