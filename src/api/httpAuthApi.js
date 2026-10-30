import { apiRequest } from './httpClient.js'
import { endpoints } from './endpoints.js'

// Backend implementation of sign-in. Enabled with VITE_AUTH_SOURCE=http.
// login is expected to return { token, user } with user in the `Radiologist` shape (api/models.js).
export const httpAuthApi = {
  login: (username, password) => apiRequest(endpoints.login, { method: 'POST', body: { username, password } }),
  logout: () => apiRequest(endpoints.logout, { method: 'POST' }),
}
