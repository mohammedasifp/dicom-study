// REST paths of the worklist backend. Placeholders until the backend contract is agreed;
// update them here only — services build every URL from this file.
export const endpoints = {
  studies: '/api/worklist/studies',
  study: (id) => `/api/worklist/studies/${encodeURIComponent(id)}`,
  assign: (id) => `/api/worklist/studies/${encodeURIComponent(id)}/assignment`,
  review: (id) => `/api/worklist/studies/${encodeURIComponent(id)}/review`,
  // AI-generated report (read-only for the UI; produced by the backend AI pipeline).
  aiReport: (id) => `/api/worklist/studies/${encodeURIComponent(id)}/ai-report`,
  radiologists: '/api/radiologists',
  currentUser: '/api/me',
}
