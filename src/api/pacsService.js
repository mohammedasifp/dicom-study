import { appConfig } from '../config/appConfig.js'

// OHIF viewer and DICOMweb access (proxied to Orthanc by vite.config.js).

export function viewerUrl(studyInstanceUID, target) {
  const params = new URLSearchParams({ StudyInstanceUIDs: studyInstanceUID })
  if (target) {
    params.set('initialSeriesInstanceUID', target.seriesInstanceUID)
    params.set('initialSOPInstanceUID', target.sopInstanceUID)
  }
  return `${appConfig.ohifBasePath}/viewer?${params.toString()}`
}

// Resolves to 'ready' | 'missing' | 'offline'.
export function checkStudyOnPacs(studyInstanceUID, signal) {
  return fetch(`${appConfig.dicomWebBasePath}/studies?StudyInstanceUID=${encodeURIComponent(studyInstanceUID)}`, { signal })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((rows) => (Array.isArray(rows) && rows.length ? 'ready' : 'missing'))
    .catch((error) => (error.name === 'AbortError' ? null : 'offline'))
}
