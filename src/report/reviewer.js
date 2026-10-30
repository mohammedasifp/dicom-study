import { readSession } from '../auth/session.js'

const KEY = 'reviewerName'

export const getReviewer = () => {
  const session = readSession()
  return (session && session.user && session.user.name) || localStorage.getItem(KEY) || undefined
}

export const setReviewer = (name) => {
  if (name) localStorage.setItem(KEY, name)
}
