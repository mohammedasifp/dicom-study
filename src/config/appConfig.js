// Runtime configuration. The backend and Orthanc addresses live in .env and are used by the Vite dev proxy (vite.config.js).

export const appConfig = {
  // OHIF and DICOMweb are served through the Vite proxy to Orthanc (vite.config.js).
  ohifBasePath: '/ohif',
  dicomWebBasePath: '/dicom-web',
  defaultLocale: 'en',
  worklistRefreshMs: 60000,
}
