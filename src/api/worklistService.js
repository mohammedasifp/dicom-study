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
/** Opens the review (claims the study when unassigned). Fails with code AI_REPORT_NOT_READY while AI is working. */
export const startReview = (id, userId) => api.startReview(id, userId)
/** reviewed = every AI finding has a decision (REVIEWED); false moves it back to UNDER_REVIEW. */
export const setReviewProgress = (id, reviewed) => api.setReviewProgress(id, reviewed)
export const finalizeReport = (id, reviewer) => api.finalizeReport(id, reviewer)
export const reopenReport = (id) => api.reopenReport(id)
/** Editor input: the AI-generated report when READY, an empty manual report when AI FAILED. @returns {Promise<import('./models.js').ReportDraft>} */
export const getReportDraft = (id) => api.getReportDraft(id)
