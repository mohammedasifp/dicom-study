import { readSession } from '../auth/session.js'
import { ApiError, codeFor, notifyUnauthorized } from './httpClient.js'

export { ApiError }

const TIMEOUT_MS = 20000

function headersFor(body, token) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function request(method, path, body) {
  const session = readSession()
  const token = session && session.token
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetch(path, {
      method,
      headers: headersFor(body, token),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    const timedOut = err.name === 'AbortError'
    throw new ApiError(timedOut ? 'The report server took too long to answer' : 'Cannot reach the report server', {
      code: timedOut ? 'TIMEOUT' : 'NETWORK',
    })
  } finally {
    clearTimeout(timer)
  }
  const json = await res.json().catch(() => null)
  if (res.status === 401 && token) notifyUnauthorized()
  if (!json) throw new ApiError(`Server error (${res.status})`, { status: res.status, code: codeFor(res.status) })
  if (json.code !== 0) {
    throw new ApiError(json.message || `Request failed (${res.status})`, { status: res.status, code: codeFor(res.status), details: json })
  }
  return json.data
}

// GET a file (e.g. the report PDF) with the same sign-in as request(). Errors arrive as the usual JSON envelope.
export async function requestFile(path) {
  const token = readSession()?.token
  let res
  try {
    res = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  } catch {
    throw new ApiError('Cannot reach the report server', { code: 'NETWORK' })
  }
  if (res.ok) return res.blob()
  if (res.status === 401 && token) notifyUnauthorized()
  const json = await res.json().catch(() => null)
  throw new ApiError((json && json.message) || `Request failed (${res.status})`, { status: res.status, code: codeFor(res.status), details: json })
}
