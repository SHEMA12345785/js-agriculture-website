/**
 * Kept for backwards compatibility with existing imports.
 * The real implementation now lives in ./api.js, which resolves the backend
 * URL at runtime instead of hard-coding it at build time.
 */
export { apiBase, apiUrl, assetUrl, getAuthHeaders } from './api'
