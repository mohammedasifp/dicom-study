// Maps any thrown error to an i18n key under `errors.*`, so every screen shows the same friendly wording.
export function errorMessageKey(error) {
  switch (error?.code) {
    case 'NETWORK':
      return 'errors.network'
    case 'TIMEOUT':
      return 'errors.timeout'
    case 'UNAUTHORIZED':
      return 'errors.unauthorized'
    case 'NOT_FOUND':
      return 'errors.notFound'
    case 'AI_REPORT_NOT_READY':
      return 'errors.aiReportNotReady'
    default:
      return error?.status === 403 ? 'errors.forbidden' : 'errors.generic'
  }
}

// Network failures and timeouts are worth retrying; client errors are not.
export const isRetryable = (error) => ['NETWORK', 'TIMEOUT'].includes(error?.code) || error?.status >= 500 || !error?.code
