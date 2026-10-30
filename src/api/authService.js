import { appConfig } from '../config/appConfig.js'
import { mockAuthApi } from './mock/mockAuthApi.js'
import { httpAuthApi } from './httpAuthApi.js'
import { backendAuthApi } from './backendAuthApi.js'

// The only module the UI imports for sign-in. Follows the worklist data source (config/appConfig.js).
const SOURCES = { backend: backendAuthApi, http: httpAuthApi, mock: mockAuthApi }
const api = SOURCES[appConfig.worklistSource] || backendAuthApi

/** @returns {Promise<{ token: string, user: import('./models.js').Radiologist }>} */
export const login = (username, password) => api.login(username, password)
export const logout = () => api.logout()
