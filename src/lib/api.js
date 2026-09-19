/**
 * Resolves the backend API base URL at RUNTIME (not build time).
 *
 * Why this exists:
 * A previous build had `http://localhost:4000` compiled into the JS bundle.
 * On the developer's PC that works, because the backend really is on that
 * machine. On anybody else's computer, `localhost` means *their own* computer,
 * which is not running the backend - so admin login and the contact form
 * failed everywhere except the machine that built the site.
 *
 * Resolution order:
 *   1. window.__APP_CONFIG__.apiBase  (from /config.js - editable WITHOUT rebuilding)
 *   2. VITE_API_URL                   (build-time env var)
 *   3. '' = same origin               (recommended: backend serves dist/ too)
 *
 * Safety net: if either source resolves to a loopback address while the page
 * itself is being served from a real host, the value is ignored and we fall
 * back to same-origin. That makes the "works on my machine only" bug
 * impossible to reintroduce.
 */

const LOOPBACK = /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|::1|\[::1\])$/i

function isLoopbackHost(hostname) {
  return LOOPBACK.test(String(hostname || ''))
}

function clean(value) {
  return typeof value === 'string' ? value.trim().replace(/\/+$/, '') : ''
}

function pageIsLocal() {
  if (typeof window === 'undefined') return true
  return isLoopbackHost(window.location.hostname)
}

function resolveApiBase() {
  if (typeof window === 'undefined') return ''

  const runtimeValue = clean(window.__APP_CONFIG__ && window.__APP_CONFIG__.apiBase)
  const buildValue = clean(import.meta.env.VITE_API_URL)
  const candidate = runtimeValue || buildValue

  // Nothing configured -> same origin. This is the recommended setup, where
  // the Express server serves both the built frontend and /api.
  if (!candidate) return ''

  // Anything that is not an absolute http(s) URL is a configuration mistake.
  // Without this check a typo would be resolved as a relative path against the
  // current page, producing broken request URLs.
  if (!/^https?:\/\//i.test(candidate)) {
    console.warn(
      `[api] Ignoring API base "${candidate}": it must be a full URL starting with http:// or https://, ` +
      'or an empty string for same-origin requests. Falling back to same-origin.',
    )
    return ''
  }

  try {
    const url = new URL(candidate)

    if (isLoopbackHost(url.hostname) && !pageIsLocal()) {
      console.warn(
        `[api] Ignoring API base "${candidate}" because it points at this visitor's own machine. ` +
        'Falling back to same-origin /api requests. Set apiBase in /config.js to your public backend URL.',
      )
      return ''
    }

    return `${url.origin}${url.pathname}`.replace(/\/+$/, '')
  } catch {
    console.warn(`[api] Invalid API base "${candidate}". Falling back to same-origin requests.`)
    return ''
  }
}

export const apiBase = resolveApiBase()

/** Build a full URL for an API endpoint, e.g. apiUrl('/api/contact'). */
export function apiUrl(path) {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${apiBase}${suffix}`
}

/**
 * Resolve an image path coming from the backend or from static assets so it
 * loads correctly on every machine.
 *
 * Handles legacy records that were saved with an absolute
 * http://localhost:4000/uploads/... URL by rewriting them onto the current
 * backend host.
 */
export function assetUrl(image) {
  if (!image) return ''
  if (image.startsWith('data:') || image.startsWith('blob:')) return image

  if (/^https?:\/\//i.test(image)) {
    try {
      const url = new URL(image)

      // Legacy absolute localhost URL saved by an older version of the server.
      if (isLoopbackHost(url.hostname) && !pageIsLocal()) {
        return `${apiBase}${url.pathname}`
      }

      return image
    } catch {
      return image
    }
  }

  const path = image.startsWith('/') ? image : `/${image}`

  // Uploaded files live on the backend; everything else is a static file
  // shipped with the frontend (public/).
  return path.startsWith('/uploads/') ? `${apiBase}${path}` : path
}

export function getAuthHeaders(token, isFormData = false) {
  const headers = {}

  if (token) headers.Authorization = `Bearer ${token}`
  // Never set Content-Type for FormData - the browser must add the multipart boundary.
  if (!isFormData) headers['Content-Type'] = 'application/json'

  return headers
}
