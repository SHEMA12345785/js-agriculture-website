export const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function getAuthHeaders(token, isFormData = false) {
  const headers = { Authorization: `Bearer ${token}` }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}
