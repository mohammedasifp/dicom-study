import { appConfig } from '../config/appConfig.js'
import { mockAuthApi } from './mock/mockAuthApi.js'
import { httpAuthApi } from './httpAuthApi.js'

// The only module the UI imports for sign-in. Switching to the backend is a config change.
const api = appConfig.useMockApi ? mockAuthApi : httpAuthApi

/** @returns {Promise<{ token: string, user: import('./models.js').Radiologist }>} */
export const login = (username, password) => api.login(username, password)
export const logout = () => api.logout()
