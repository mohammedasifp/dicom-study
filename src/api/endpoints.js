// REST paths of the worklist backend. Placeholders until the backend contract is agreed;
// update them here only — services build every URL from this file.
export const endpoints = {
  studies: '/api/worklist/studies',
  study: (id) => `/api/worklist/studies/${encodeURIComponent(id)}`,
  assign: (id) => `/api/worklist/studies/${encodeURIComponent(id)}/assignment`,
  status: (id) => `/api/worklist/studies/${encodeURIComponent(id)}/status`,
  reportDraft: (id) => `/api/worklist/studies/${encodeURIComponent(id)}/report-draft`,
  radiologists: '/api/radiologists',
  currentUser: '/api/me',
}
