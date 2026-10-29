export const wadoUrl = (source) =>
  `/wado?requestType=WADO&studyUID=${source.studyInstanceUID}&seriesUID=${source.seriesInstanceUID}&objectUID=${source.sopInstanceUID}&contentType=image/jpeg`

export function confidenceLevel(confidence) {
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
