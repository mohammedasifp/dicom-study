import { useEffect, useState } from 'react'

// useState that survives navigating away and back within the browser session.
export function useSessionState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key)
      return stored === null ? initialValue : { ...initialValue, ...JSON.parse(stored) }
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
