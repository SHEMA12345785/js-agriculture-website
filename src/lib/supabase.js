export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function getAuthHeaders(token, isFormData = false) {
  const headers = { Authorization: `Bearer ${token}` }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}
