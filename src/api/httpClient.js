import { appConfig } from '../config/appConfig.js'

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// auth/session.js installs the token provider. Returning null sends the request without a token.
let getAuthToken = () => null
export function setAuthTokenProvider(provider) {
  getAuthToken = provider
}

// Called when an authenticated request comes back 401 (expired or revoked session).
let onUnauthorized = () => {}
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}
// For the other request helper (api/client.js), so both end an invalid session the same way.
export const notifyUnauthorized = () => onUnauthorized()

function buildUrl(path, params) {
  const url = new URL(`${appConfig.apiBaseUrl}${path}`, window.location.origin)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, v))
    else url.searchParams.set(key, value)
  })
  return url.toString()
}

export async function apiRequest(path, { method = 'GET', params, body, signal } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), appConfig.requestTimeoutMs)
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true })

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (error) {
    throw new ApiError(error.name === 'AbortError' ? 'Request timed out' : 'Network error', {
      code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK',
    })
  } finally {
    clearTimeout(timeout)
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized()
    throw new ApiError(data?.message || `Request failed (${response.status})`, {
      status: response.status,
      // Domain errors (e.g. AI_REPORT_NOT_READY) come through as `code` in the response body.
      code: response.status === 401 ? 'UNAUTHORIZED' : response.status === 404 ? 'NOT_FOUND' : data?.code || 'HTTP',
      details: data,
    })
  }
  return data
}
