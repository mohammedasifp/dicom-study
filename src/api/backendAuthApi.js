import { listRadiologists } from './backend.js'
import { ApiError } from './httpClient.js'
import { MOCK_PASSWORD } from '../data/mock/accounts.js'

// BACKEND SPEC (B13): POST /api/auth/login { username, password } -> { token, user } (user = a radiologist from
// GET /api/radiologists) and POST /api/auth/logout. Until then sign-in matches the username to an active
// radiologist ("dr.kavya.rao" = "Dr. Kavya Rao", or the email name) and accepts the demo password.
const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')

const toUser = (r) => ({ id: r.id, name: r.name, initials: r.initials, subspecialty: r.subspecialty || '' })

export const backendAuthApi = {
  login: async (username, password) => {
    const wanted = username.trim().toLowerCase()
    const radiologists = await listRadiologists()
    const match = radiologists.find(
      (r) => slug(r.name) === wanted || (r.email && (r.email === wanted || r.email.split('@')[0] === wanted)),
    )
    if (!match || password !== MOCK_PASSWORD) {
      throw new ApiError('Invalid username or password', { status: 401, code: 'INVALID_CREDENTIALS' })
    }
    return { token: `demo-${match.id}`, user: toUser(match) }
  },
  logout: async () => null,
}
