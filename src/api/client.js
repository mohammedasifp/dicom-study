import { readSession } from '../auth/session.js'
import { notifyUnauthorized } from './httpClient.js'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

const OBJECT_ID = /^[a-f0-9]{24}$/i

function headersFor(body) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const session = readSession()
  const userId = session && session.user && session.user.id
  if (userId && OBJECT_ID.test(userId)) headers['X-User-Id'] = userId
  if (session && session.token) headers.Authorization = `Bearer ${session.token}`
  return headers
}

export async function request(method, path, body) {
  let res
  try {
    res = await fetch(path, {
      method,
      headers: headersFor(body),
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Cannot reach the report server', 0)
  }
  // The backend rejects an expired or unknown session token with 401: sign out so the user lands on the login screen.
  if (res.status === 401 && readSession()?.token) notifyUnauthorized()
  const json = await res.json().catch(() => null)
  if (!json) throw new ApiError(`Server error (${res.status})`, res.status)
  if (json.code !== 0) throw new ApiError(json.message || `Request failed (${res.status})`, res.status)
  return json.data
}
