// Runtime configuration read from Vite env vars (see .env.example). Nothing else should read import.meta.env.

const env = import.meta.env

export const appConfig = {
  // Base URL of the RIS / worklist REST backend. Empty = same origin.
  apiBaseUrl: env.VITE_API_BASE_URL || '',
  // Serve worklist data from the in-browser mock until the backend is available.
  useMockApi: env.VITE_USE_MOCK_API !== 'false',
  // Simulated network latency for the mock API, in ms.
  mockLatencyMs: Number(env.VITE_MOCK_LATENCY_MS ?? 350),
  requestTimeoutMs: 20000,
  // OHIF and DICOMweb are served through the Vite proxy to Orthanc (vite.config.js).
  ohifBasePath: '/ohif',
  dicomWebBasePath: '/dicom-web',
  defaultLocale: 'en',
  worklistRefreshMs: 60000,
  // Faster poll while any study is still with the AI service, so Ready / Failed shows up promptly.
  // Replace with a push channel (SSE / WebSocket) when the backend offers one.
  aiStatusRefreshMs: 15000,
}
