// Runtime configuration. The backend and Orthanc addresses live in .env and are used by the Vite dev proxy (vite.config.js).

export const appConfig = {
  // OHIF and DICOMweb are served through the Vite proxy to Orthanc (vite.config.js).
  ohifBasePath: '/ohif',
  dicomWebBasePath: '/dicom-web',
  defaultLocale: 'en',
  worklistRefreshMs: 60000,
  // Faster poll while any study is still with the AI service, so Ready / Failed shows up promptly.
  // Replace with a push channel (SSE / WebSocket) when the backend offers one.
  aiStatusRefreshMs: 15000,
}
