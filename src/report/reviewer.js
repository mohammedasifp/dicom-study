import { readSession } from '../auth/session.js'

export const getReviewer = () => {
  const session = readSession()
  return (session && session.user && session.user.name) || undefined
}
