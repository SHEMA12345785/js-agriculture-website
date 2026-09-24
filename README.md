# J.S Agriculture Import and Export Co. Ltd — Website

A Vue 3 + Vite company website built from the company information and flyer. The public site includes home, about, eight services, products, farmer/export process, contact form, WhatsApp, map and company contact details.

## Run locally

```bash
npm install
cp .env.example .env   # first time only - fill in real values afterwards
npm run dev
```

`npm run dev` starts **both** the backend (port 4000) and the frontend (port
5173) together, so admin login and the contact form work immediately. Open
the printed `http://localhost:5173/` link.

If you ever see `ECONNREFUSED` or `http proxy error` in the terminal, it
means only the frontend is running. Either use `npm run dev` (starts both) or
run the two processes yourself in separate terminals:

```bash
npm run dev:server   # terminal 1 - backend on port 4000
npm run dev:client   # terminal 2 - frontend on port 5173
```

The Vite development proxy forwards `/api` requests to the backend on port
4000, so local login and contact form requests do not depend on a
device-specific `localhost` URL.

## Build for production

```bash
npm run build
npm start
```

`npm run build` writes the website into `dist/`. `npm start` runs the Express
server, which serves **both** `dist/` and the `/api` endpoints from the same
address. Open the server's public URL from any computer or phone and the
gallery admin login and contact form will work.

### Important: this site needs a Node host

Do **not** deploy `dist/` on its own to Netlify, Vercel or GitHub Pages. Those
are static hosts with no backend, so every `/api/...` request returns 404 and
both the admin login and the contact form fail on every machine except the one
running the backend locally. Use a host that runs Node (Railway, Render,
Fly.io, a VPS, cPanel with Node support) and run `npm start` there.

### Never hard-code localhost

`localhost` means "the computer the visitor is sitting at". If the frontend is
built with `VITE_API_URL=http://localhost:4000`, every other machine tries to
reach its own port 4000 and fails. This is what previously made admin login
appear to be locked to a single machine.

The backend URL is now resolved at runtime in `dist/config.js`:

```js
window.__APP_CONFIG__ = {
  apiBase: '',
}
```

- Leave `apiBase` empty when the Express server serves the site (recommended).
- Set it to the public backend URL, e.g. `https://api.your-domain.com`, only
  when the frontend and backend are on different domains.

You can edit `dist/config.js` directly on the server and reload the page; no
rebuild is needed. As a safety net, the app ignores any configured loopback
address when the page is served from a real hostname.

### After deploying, verify

```bash
curl https://your-domain.com/api/health
```

A JSON response means the backend is reachable and login will work from any
device. An HTML page or a 404 means only the static files are deployed.

## Where data is stored

- `server/admin.json` — the admin password hash. Created on first password
  reset so the new password survives restarts.
- `server/gallery-items.json` — gallery entries.
- `server/uploads/gallery/` — uploaded images.
- `server/submissions.json` — every contact enquiry.

Back these up, and keep them when redeploying.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/js-agriculture-website.git
git push -u origin main
```

## Where to edit content

- `src/components/Hero.vue` — headline and intro copy
- `src/components/About.vue` — company description
- `src/components/Services.vue` — the 8 services list
- `src/components/Products.vue` — product catalogue section
- `src/components/Process.vue` — the 6-step workflow
- `src/components/Contact.vue` — phone, email, location, form
- `src/style.css` — colors and fonts (design tokens at the top)

## Email setup

To send contact form enquiries and admin password reset emails to `ADMIN_EMAIL`, fill in the SMTP values in `.env` before starting the backend.

Example for Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jsagricultureimportexportco@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=jsagricultureimportexportco@gmail.com
```

For Gmail, enable 2-Step Verification and create an App Password. Do not use your normal Gmail password. After changing `.env`, restart the backend with `npm run server`. Contact submissions are saved to `server/submissions.json` before email is attempted. Phone numbers are kept only for the visitor-selected period (1 hour, 24 hours, 7 days or 30 days), can be hidden sooner, and are then replaced with `Contact hidden`. Email notifications do not include phone numbers. Signed-in admins can read active contact details at `GET /api/contact/submissions`; expired numbers are purged on a short server interval and whenever submissions are read.

## Notes

- The contact form posts to the backend at `/api/contact`, which sends the enquiry through SMTP to `ADMIN_EMAIL` and persists a local backup.
- Before handover, transfer company-owned domain, hosting, repository, email, analytics and database accounts. Enable HTTPS, configure a real business email, add backups, and replace the demo credentials.
- Recommended handover package: public website, source code, domain/hosting access, SSL, documentation, training, backup plan, security review and maintenance agreement.
- The logo is stored at `public/LOGO.png`. Replace the drawn product art with licensed farm/chili photography when approved by the company.
