import { appConfig } from '../config/appConfig.js'

export const wadoUrl = (source) =>
  source.frame
    ? `${appConfig.dicomWebBasePath}/studies/${source.studyInstanceUID}/series/${source.seriesInstanceUID}/instances/${source.sopInstanceUID}/frames/${source.frame}/rendered`
    : `/wado?requestType=WADO&studyUID=${source.studyInstanceUID}&seriesUID=${source.seriesInstanceUID}&objectUID=${source.sopInstanceUID}&contentType=image/jpeg`

export function confidenceLevel(confidence) {
  if (typeof confidence !== 'number') return { label: 'Not given', color: 'none' }
  if (confidence >= 0.8) return { label: 'High', color: 'success' }
  if (confidence >= 0.65) return { label: 'Moderate', color: 'warning' }
  return { label: 'Low', color: 'error' }
}

export const percent = (value) => `${Math.round(value * 100)}%`

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const sourceLabel = (source) =>
  `Series ${source.seriesNumber} · ${source.seriesDescription} · Img ${source.instanceNumber}`

export function roiFraction(roi, naturalWidth, naturalHeight) {
  if (!roi) return null
  if (roi.units !== 'px') return roi
  const w = roi.imageWidth || naturalWidth
  const h = roi.imageHeight || naturalHeight
  if (!w || !h) return null
  return { shape: roi.shape, x: roi.x / w, y: roi.y / h, width: roi.width / w, height: roi.height / h }
}

export function confidenceText(confidence) {
  return typeof confidence === 'number' ? percent(confidence) : 'n/a'
}
