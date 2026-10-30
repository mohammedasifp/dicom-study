import { backendWorklistApi as api } from './backendWorklistApi.js'

/** @returns {Promise<import('./models.js').Study[]>} */
export const listStudies = () => api.listStudies()
/** @returns {Promise<import('./models.js').Study>} */
export const getStudy = (id) => api.getStudy(id)
/** @returns {Promise<import('./models.js').Radiologist[]>} */
export const listRadiologists = () => api.listRadiologists()
/** @returns {Promise<import('./models.js').Radiologist>} */
export const getCurrentUser = () => api.getCurrentUser()
/** radiologistId null = unassign. @returns {Promise<import('./models.js').Study>} */
export const assignStudy = (id, radiologistId) => api.assignStudy(id, radiologistId)
