import { backendAuthApi } from './backendAuthApi.js'

/** @returns {Promise<{ token: string, user: import('./models.js').Radiologist }>} */
export const login = (username, password) => backendAuthApi.login(username, password)
export const logout = () => backendAuthApi.logout()
