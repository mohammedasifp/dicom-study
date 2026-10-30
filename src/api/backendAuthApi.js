import { request } from './client.js'
import { ApiError } from './httpClient.js'

const initialsOf = (name) =>
  name
    .replace(/^dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

const toUser = (r) => ({
  id: r.id || String(r._id),
  name: r.name,
  initials: r.initials || initialsOf(r.name || ''),
  subspecialty: r.subspecialty || '',
})

export const backendAuthApi = {
  login: async (username, password) => {
    try {
      const data = await request('POST', '/api/auth/login', { username: username.trim(), password })
      return { token: data.token, user: toUser(data.user) }
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
        throw new ApiError('Invalid username or password', { status: 401, code: 'INVALID_CREDENTIALS' })
      }
      throw err
    }
  },
  logout: () => request('POST', '/api/auth/logout').catch(() => null),
}
