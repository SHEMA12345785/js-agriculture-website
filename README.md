# J.S Agriculture Import and Export Co. Ltd — Website

A Vue 3 + Vite company website built from the company information and flyer. The public site includes home, about, eight services, products, farmer/export process, contact form, WhatsApp, map and company contact details.

## Run locally

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173/` link.

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy that folder to any static host (Netlify, Vercel, GitHub Pages, etc).

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

## Admin email setup

To enable the password reset email flow, fill in the SMTP values in `.env` before starting the backend.

Example for Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
```

Use an app password for Gmail. Without SMTP values, the app falls back to a generated reset link shown in the backend console and in the UI.

## Notes

- The contact form opens a pre-filled email in the visitor's email client. For production, connect it to a backend or form service and persist enquiries.
- Before handover, transfer company-owned domain, hosting, repository, email, analytics and database accounts. Enable HTTPS, configure a real business email, add backups, and replace the demo credentials.
- Recommended handover package: public website, source code, domain/hosting access, SSL, documentation, training, backup plan, security review and maintenance agreement.
- The logo is stored at `public/LOGO.png`. Replace the drawn product art with licensed farm/chili photography when approved by the company.
