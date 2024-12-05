export const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  uploadContract: '/upload/contract',
  uploadExpected: '/upload/expected',
  generateReport: '/generate_report',
  getHistory: '/history',
} as const;
