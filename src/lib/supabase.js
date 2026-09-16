const defaultApiBase = typeof window !== 'undefined' && window.location?.origin
  ? window.location.origin
  : 'http://localhost:5173'

export const apiBase = import.meta.env.VITE_API_URL || defaultApiBase

export function getAuthHeaders(token, isFormData = false) {
  const headers = { Authorization: `Bearer ${token}` }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}
