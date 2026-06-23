const DEFAULT_API_BASE_URL = '/api/v1'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  defaultBranchId: import.meta.env.VITE_DEFAULT_BRANCH_ID || '',
} as const
