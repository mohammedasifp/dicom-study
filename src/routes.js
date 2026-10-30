export const ROUTE = { WORKLIST: 'worklist', OPERATIONS: 'operations', STUDY_REPORT: 'studyReport' }

export const paths = {
  worklist: () => '#/worklist',
  operations: () => '#/operations',
  studyReport: (studyId) => `#/report/${encodeURIComponent(studyId)}`,
}

export function parseHash(hash) {
  const match = hash.match(/^#\/report\/([^/]+)$/)
  if (match) return { name: ROUTE.STUDY_REPORT, studyId: decodeURIComponent(match[1]) }
  if (hash === paths.operations()) return { name: ROUTE.OPERATIONS }
  return { name: ROUTE.WORKLIST }
}

export const navigate = (path) => {
  window.location.hash = path
}
