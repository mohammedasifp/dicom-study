// Mock reporting radiologists. Shape matches the backend `Radiologist` model (see api/models.js).
export const mockRadiologists = [
  { id: 'rad-1', name: 'Dr. Kavya Rao', initials: 'KR', subspecialty: 'Neuro' },
  { id: 'rad-2', name: 'Dr. Arjun Menon', initials: 'AM', subspecialty: 'Body' },
  { id: 'rad-3', name: 'Dr. Jhansi Reddy', initials: 'JR', subspecialty: 'MSK' },
  { id: 'rad-4', name: 'Dr. Sameer Khan', initials: 'SK', subspecialty: 'Chest' },
]

export const mockCurrentUserId = 'rad-1'
