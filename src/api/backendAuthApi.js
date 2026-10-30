import { request } from './client.js'
import { ApiError } from './httpClient.js'
import { endpoints } from './endpoints.js'

// Sign-in against dicom-study-backend (B13): POST /api/auth/login { username, password } -> { token, user }.
// The token is a signed session the backend checks on every /api call (sent as `Authorization: Bearer`).
const toUser = (r) => ({ id: r.id || String(r._id), name: r.name, initials: r.initials || '', subspecialty: r.subspecialty || '' })

export const backendAuthApi = {
  login: async (username, password) => {
    try {
      const { token, user } = await request('POST', endpoints.login, { username: username.trim(), password })
      return { token, user: toUser(user) }
    } catch (err) {
      if (err.status === 401) throw new ApiError('Invalid username or password', { status: 401, code: 'INVALID_CREDENTIALS' })
      throw err
    }
  },
  logout: () => request('POST', endpoints.logout),
}
