// Hash routes. `#/report` (no id) keeps opening the original demo draft.
export const ROUTE = { LANDING: 'landing', WORKLIST: 'worklist', REPORT: 'report', STUDY_REPORT: 'studyReport' }

export const paths = {
  landing: () => '',
  worklist: () => '#/worklist',
  report: () => '#/report',
  studyReport: (studyId) => `#/report/${encodeURIComponent(studyId)}`,
}

export function parseHash(hash) {
  if (hash === '#/worklist') return { name: ROUTE.WORKLIST }
  if (hash === '#/report') return { name: ROUTE.REPORT }
  const match = hash.match(/^#\/report\/([^/]+)$/)
  if (match) return { name: ROUTE.STUDY_REPORT, studyId: decodeURIComponent(match[1]) }
  return { name: ROUTE.LANDING }
}

export const navigate = (path) => {
  window.location.hash = path
}
