import { appConfig } from '../config/appConfig.js'
import { mockWorklistApi } from './mock/mockWorklistApi.js'
import { httpWorklistApi } from './httpWorklistApi.js'
import { backendWorklistApi } from './backendWorklistApi.js'

// The only module the UI imports for worklist data. Switching the source is a config change.
const SOURCES = { backend: backendWorklistApi, http: httpWorklistApi, mock: mockWorklistApi }
const api = SOURCES[appConfig.worklistSource] || backendWorklistApi

/** @returns {Promise<import('./models.js').Study[]>} */
export const listStudies = (query) => api.listStudies(query)
/** @returns {Promise<import('./models.js').Study>} */
export const getStudy = (id) => api.getStudy(id)
/** @returns {Promise<import('./models.js').Radiologist[]>} */
export const listRadiologists = () => api.listRadiologists()
/** @returns {Promise<import('./models.js').Radiologist>} */
export const getCurrentUser = () => api.getCurrentUser()
/** radiologistId null = unassign. @returns {Promise<import('./models.js').Study>} */
export const assignStudy = (id, radiologistId) => api.assignStudy(id, radiologistId)
export const startReporting = (id, userId) => api.startReporting(id, userId)
export const completeReport = (id, reviewer) => api.completeReport(id, reviewer)
export const reopenReport = (id) => api.reopenReport(id)
/** @returns {Promise<import('./models.js').ReportDraft>} */
export const getReportDraft = (id) => api.getReportDraft(id)
