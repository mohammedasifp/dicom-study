import { MOCK_PASSWORD, mockAccounts } from '../../data/mock/accounts.js'
import { mockRadiologists } from '../../data/mock/radiologists.js'
import { appConfig } from '../../config/appConfig.js'
import { ApiError } from '../httpClient.js'

// In-memory stand-in for the auth backend. Same method signatures as httpAuthApi.js.
const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), appConfig.mockLatencyMs))

export const mockAuthApi = {
  login: async (username, password) => {
    const account = mockAccounts.find((a) => a.username === username.trim().toLowerCase())
    if (!account || password !== MOCK_PASSWORD) {
      await delay(null)
      throw new ApiError('Invalid username or password', { status: 401, code: 'INVALID_CREDENTIALS' })
    }
    const user = mockRadiologists.find((r) => r.id === account.radiologistId)
    return delay({ token: `mock-token-${user.id}`, user })
  },
  logout: () => delay(null),
}
