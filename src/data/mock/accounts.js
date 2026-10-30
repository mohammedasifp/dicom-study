// Test sign-in accounts for the mock API. Each maps to a mock radiologist (data/mock/radiologists.js).
// Development only: real credentials are checked by the backend.
export const MOCK_PASSWORD = 'test@123'

export const mockAccounts = [
  { username: 'dr.kavya.rao', radiologistId: 'rad-1' },
  { username: 'dr.arjun.menon', radiologistId: 'rad-2' },
  { username: 'dr.jhansi.reddy', radiologistId: 'rad-3' },
  { username: 'dr.sameer.khan', radiologistId: 'rad-4' },
]
