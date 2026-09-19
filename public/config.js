/**
 * Runtime configuration for the J.S Agriculture website.
 *
 * This file is NOT bundled by Vite - it is copied as-is into dist/ and loaded
 * by index.html before the app starts. That means you can change the backend
 * URL on the server by editing dist/config.js and reloading the page. No
 * rebuild, no redeploy of the JS bundle.
 *
 * apiBase:
 *   ''                          -> same origin (RECOMMENDED).
 *                                  Use this when you run `npm run build` and
 *                                  then `npm start`, because the Express
 *                                  server serves the website AND the API from
 *                                  the same address.
 *
 *   'https://api.example.com'   -> use this only when the backend is hosted on
 *                                  a different domain from the website.
 *
 * NEVER put http://localhost:4000 here on a deployed site. "localhost" means
 * "the computer the visitor is sitting at", so the site would only work on the
 * machine running the backend.
 */
window.__APP_CONFIG__ = {
  apiBase: '',
}
