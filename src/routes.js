export const ROUTE = { WORKLIST: 'worklist', STUDY_REPORT: 'studyReport' }

export const paths = {
  worklist: () => '#/worklist',
  studyReport: (studyId) => `#/report/${encodeURIComponent(studyId)}`,
}

export function parseHash(hash) {
  const match = hash.match(/^#\/report\/([^/]+)$/)
  if (match) return { name: ROUTE.STUDY_REPORT, studyId: decodeURIComponent(match[1]) }
  return { name: ROUTE.WORKLIST }
}

export const navigate = (path) => {
  window.location.hash = path
}
