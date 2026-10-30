// Runtime configuration read from Vite env vars (see .env.example). Nothing else should read import.meta.env.

const env = import.meta.env

export const appConfig = {
  // Base URL of the RIS / worklist REST backend. Empty = same origin.
  apiBaseUrl: env.VITE_API_BASE_URL || '',
  // Worklist data source: 'backend' (dicom-study-backend /api/studies), 'mock' (in-browser data) or 'http' (api/endpoints.js contract).
  worklistSource: env.VITE_WORKLIST_SOURCE || (env.VITE_USE_MOCK_API === 'true' ? 'mock' : 'backend'),
  // Sign-in: 'mock' (test accounts in data/mock/accounts.js) until a backend login exists, or 'http' (api/endpoints.js).
  authSource: env.VITE_AUTH_SOURCE || 'mock',
  // Simulated network latency for the mock API, in ms.
  mockLatencyMs: Number(env.VITE_MOCK_LATENCY_MS ?? 350),
  requestTimeoutMs: 20000,
  // OHIF and DICOMweb are served through the Vite proxy to Orthanc (vite.config.js).
  ohifBasePath: '/ohif',
  dicomWebBasePath: '/dicom-web',
  defaultLocale: 'en',
  worklistRefreshMs: 60000,
}
