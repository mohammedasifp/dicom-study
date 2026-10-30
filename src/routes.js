// Hash routes. The worklist is the home page; `#/report` (no id) keeps opening the original demo draft.
export const ROUTE = { WORKLIST: 'worklist', REPORT: 'report', STUDY_REPORT: 'studyReport' }

export const paths = {
  worklist: () => '#/worklist',
  report: () => '#/report',
  studyReport: (studyId) => `#/report/${encodeURIComponent(studyId)}`,
}

export function parseHash(hash) {
  if (hash === '#/report') return { name: ROUTE.REPORT }
  const match = hash.match(/^#\/report\/([^/]+)$/)
  if (match) return { name: ROUTE.STUDY_REPORT, studyId: decodeURIComponent(match[1]) }
  return { name: ROUTE.WORKLIST }
}

export const navigate = (path) => {
  window.location.hash = path
}
