import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

const port = Number(process.env.PORT || 4000)
// Bind to every network interface so other machines can reach the API.
// Binding to 127.0.0.1 would make the backend reachable only from this machine.
const host = process.env.HOST || '0.0.0.0'
const distDir = path.join(__dirname, '..', 'dist')

app.set('trust proxy', 1)
app.disable('x-powered-by')

/* ---------------------------- Admin credentials ---------------------------- */

const adminEmail = (process.env.ADMIN_EMAIL || 'jsagricultureimportexportco@gmail.com').trim()
const jwtSecret = process.env.JWT_SECRET || 'local-dev-secret-change-this'
const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '')
const adminFile = path.join(__dirname, 'admin.json')

// The password hash used to live only in memory, so a password change was lost
// on every restart. It is now persisted to disk.
function loadAdminPasswordHash() {
  try {
    if (fs.existsSync(adminFile)) {
      const saved = JSON.parse(fs.readFileSync(adminFile, 'utf-8'))
      if (saved && typeof saved.passwordHash === 'string' && saved.passwordHash.length > 0) {
        return saved.passwordHash
      }
    }
  } catch (error) {
    console.error('Could not read admin.json, using ADMIN_PASSWORD from .env:', error.message)
  }
  return bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123456', 10)
}

let adminPasswordHash = loadAdminPasswordHash()

function saveAdminPasswordHash(hash) {
  adminPasswordHash = hash
  try {
    fs.writeFileSync(adminFile, JSON.stringify({ email: adminEmail, passwordHash: hash }, null, 2))
  } catch (error) {
    console.error('Could not persist admin.json:', error.message)
  }
}

/* ---------------------------------- Email --------------------------------- */

// Gmail displays app passwords with spaces; strip them so a pasted value works.
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '')

const smtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  smtpPass &&
  smtpPass !== 'your_16_character_app_password_here',
)

function createSmtpTransporter() {
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
    auth: { user: process.env.SMTP_USER, pass: smtpPass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  })
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character])
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim())
}

function getPublicBase(req) {
  const configured = (clientUrl || process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (configured) return configured

  // When the frontend and API share a host, the proxy's Host header can still
  // be localhost:4000. Prefer the browser origin so reset links work from
  // other devices on the LAN and from the public website domain.
  const origin = String(req.get('origin') || '').replace(/\/$/, '')
  if (/^https?:\/\/[^/]+$/i.test(origin)) return origin

  const forwardedProtocol = String(req.get('x-forwarded-proto') || '').split(',')[0].trim()
  const forwardedHost = String(req.get('x-forwarded-host') || '').split(',')[0].trim()
  if (/^https?$/i.test(forwardedProtocol) && forwardedHost) {
    return `${forwardedProtocol}://${forwardedHost}`
  }

  return `${req.protocol}://${req.get('host')}`.replace(/\/$/, '')
}

/* --------------------------------- Uploads -------------------------------- */

const uploadsDir = path.join(__dirname, 'uploads')
const galleryDir = path.join(uploadsDir, 'gallery')
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true })

// The API is public by design (public website + one JWT-protected admin), and
// browsers must be allowed to send the Authorization header from the site domain.
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json({ limit: '20mb' }))
app.use('/uploads/gallery', express.static(galleryDir, { maxAge: '7d' }))

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, galleryDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9_.-]/g, '')
        .slice(-80)
      cb(null, `${Date.now()}-${safeName || 'image'}`)
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed.'))
    return cb(null, true)
  },
})

/* ------------------------------- Auth helpers ------------------------------ */

function generateToken(user) {
  return jwt.sign({ email: user.email, role: 'admin' }, jwtSecret, { expiresIn: '7d' })
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null

  if (!token) return res.status(401).json({ message: 'You are not signed in.' })

  try {
    req.user = jwt.verify(token, jwtSecret)
    return next()
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }
}

/* ------------------------------ Gallery storage ---------------------------- */

const galleryFile = path.join(__dirname, 'gallery-items.json')

const defaultGalleryItems = [
  { id: 'default-1', title: 'Partnership handshake', description: 'Sealing new partnerships with growers', image: '/gallery/partnership-handshake.jpg' },
  { id: 'default-2', title: 'Cooperative planting day', description: 'Cooperative planting day in Nyamirama', image: '/gallery/cooperative-planting.jpg' },
  { id: 'default-3', title: 'Land preparation', description: 'Mechanised land preparation ahead of planting', image: '/gallery/mechanized-ploughing.jpg' },
  { id: 'default-4', title: 'Farmer training', description: 'Pre-season training for partner farmers', image: '/gallery/farmer-training.jpg' },
  { id: 'default-5', title: 'Field monitoring', description: 'Field monitoring and harvest record-keeping', image: '/gallery/field-monitoring.jpg' },
  { id: 'default-6', title: 'Drying yard', description: 'Drying yards at peak harvest', image: '/gallery/chili-drying-yard.jpg' },
  { id: 'default-7', title: 'Cooperative meeting', description: 'Cooperative meetings with grower families', image: '/gallery/cooperative-meeting.jpg' },
  { id: 'default-8', title: 'Community launch day', description: 'Community launch day with our field team', image: '/gallery/community-launch-day.jpg' },
]

// Older versions saved absolute URLs like "http://localhost:4000/uploads/...",
// which break on every other machine. Store a relative path and repair old rows.
function toRelativeImagePath(image) {
  if (!image || typeof image !== 'string') return image
  if (image.startsWith('data:')) return image

  if (/^https?:\/\//i.test(image)) {
    try {
      const { pathname } = new URL(image)
      return pathname.startsWith('/uploads/') ? pathname : image
    } catch {
      return image
    }
  }
  return image
}

function loadGalleryItems() {
  try {
    if (fs.existsSync(galleryFile)) {
      const saved = JSON.parse(fs.readFileSync(galleryFile, 'utf-8'))
      if (Array.isArray(saved) && saved.length > 0) {
        return saved.map((item) => ({ ...item, image: toRelativeImagePath(item.image) }))
      }
    }
  } catch (error) {
    console.error('Could not read gallery-items.json, using defaults:', error.message)
  }
  return [...defaultGalleryItems]
}

const galleryItems = loadGalleryItems()

function saveGalleryItems() {
  try {
    fs.writeFileSync(galleryFile, JSON.stringify(galleryItems, null, 2))
  } catch (error) {
    console.error('Could not save gallery-items.json:', error.message)
  }
}

saveGalleryItems() // persist migration of any legacy absolute URLs

/* ---------------------------------- Routes --------------------------------- */

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Backend is running', smtpConfigured })
})

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const emailMatches = String(email).trim().toLowerCase() === adminEmail.toLowerCase()
  const passwordMatches = bcrypt.compareSync(String(password), adminPasswordHash)

  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  return res.json({ token: generateToken({ email: adminEmail }), user: { email: adminEmail } })
})

// Lets the frontend confirm a stored token is still valid on this device.
app.get('/api/admin/me', authMiddleware, (req, res) => {
  res.json({ user: { email: req.user.email, role: req.user.role } })
})

app.post('/api/admin/forgot-password', async (req, res) => {
  const { email } = req.body || {}

  if (!email || String(email).trim().toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(404).json({ message: 'No admin account found for that email.' })
  }

  const resetToken = jwt.sign({ email: adminEmail, purpose: 'reset-password' }, jwtSecret, { expiresIn: '30m' })
  const resetUrl = `${getPublicBase(req)}/?reset=${encodeURIComponent(resetToken)}&type=recovery`

  if (!smtpConfigured) {
    console.log('Password reset link (email not configured):', resetUrl)
    return res.json({
      message: 'Email is not configured on this server. Use the reset link below instead.',
      resetUrl,
      smtpConfigured: false,
    })
  }

  try {
    await createSmtpTransporter().sendMail({
      from: process.env.SMTP_FROM || adminEmail,
      to: adminEmail,
      subject: 'Password reset for JS Agriculture admin',
      text: `Reset your password here: ${resetUrl}`,
      html: `<p>Reset your password here:</p><p><a href="${resetUrl}">${escapeHtml(resetUrl)}</a></p>`,
    })
    return res.json({ message: 'A reset link has been sent to the admin email.', smtpConfigured: true })
  } catch (error) {
    console.error('Reset email failed:', error.message)
    // Still return the link so the admin can never be locked out.
    return res.json({
      message: 'The reset email could not be sent. Use the reset link below instead.',
      resetUrl,
      smtpConfigured: true,
      emailDelivered: false,
    })
  }
})

app.post('/api/admin/reset-password', (req, res) => {
  const { token, password } = req.body || {}

  if (!token || !password || String(password).length < 6) {
    return res.status(400).json({ message: 'A valid reset link and a password of at least 6 characters are required.' })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)

    if (decoded.email !== adminEmail || decoded.purpose !== 'reset-password') {
      return res.status(401).json({ message: 'Invalid reset link.' })
    }

    saveAdminPasswordHash(bcrypt.hashSync(String(password), 10))
    return res.json({ message: 'Password updated. You can now sign in from any device.' })
  } catch {
    return res.status(401).json({ message: 'This reset link is invalid or has expired.' })
  }
})

app.get('/api/gallery', (_req, res) => {
  res.json({ items: galleryItems })
})

app.post('/api/gallery', authMiddleware, upload.single('image'), (req, res) => {
  const { title, description } = req.body || {}

  if (!title || !description) return res.status(400).json({ message: 'Title and description are required.' })
  if (!req.file) return res.status(400).json({ message: 'An image is required.' })

  const item = {
    id: `gallery-${Date.now()}`,
    title: String(title).trim(),
    description: String(description).trim(),
    image: `/uploads/gallery/${req.file.filename}`,
  }

  galleryItems.unshift(item)
  saveGalleryItems()
  return res.status(201).json({ item })
})

app.put('/api/gallery/:id', authMiddleware, upload.single('image'), (req, res) => {
  const { title, description } = req.body || {}
  const index = galleryItems.findIndex((item) => item.id === req.params.id)

  if (index === -1) return res.status(404).json({ message: 'Gallery item not found.' })
  if (!title || !description) return res.status(400).json({ message: 'Title and description are required.' })

  galleryItems[index] = {
    ...galleryItems[index],
    title: String(title).trim(),
    description: String(description).trim(),
    image: req.file ? `/uploads/gallery/${req.file.filename}` : galleryItems[index].image,
  }

  saveGalleryItems()
  return res.json({ item: galleryItems[index] })
})

app.delete('/api/gallery/:id', authMiddleware, (req, res) => {
  const index = galleryItems.findIndex((item) => item.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Gallery item not found.' })

  galleryItems.splice(index, 1)
  saveGalleryItems()
  return res.json({ message: 'Gallery item deleted.' })
})

/* ------------------------------- Contact form ------------------------------ */

const submissionsFile = path.join(__dirname, 'submissions.json')

function saveSubmission(submission) {
  try {
    let submissions = []
    if (fs.existsSync(submissionsFile)) {
      const parsed = JSON.parse(fs.readFileSync(submissionsFile, 'utf-8'))
      if (Array.isArray(parsed)) submissions = parsed
    }
    submissions.push(submission)
    fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2))
    return true
  } catch (error) {
    console.error('Could not save contact submission:', error.message)
    return false
  }
}

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill in your name, email and message.' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' })
  }

  const submission = {
    id: Date.now(),
    name: String(name).trim().slice(0, 200),
    email: String(email).trim().slice(0, 200),
    phone: String(phone || '').trim().slice(0, 60) || 'Not provided',
    message: String(message).trim().slice(0, 5000),
    timestamp: new Date().toISOString(),
    emailDelivered: false,
  }

  if (!saveSubmission(submission)) {
    return res.status(500).json({ message: `We could not record your message. Please email us directly at ${adminEmail}` })
  }

  if (!smtpConfigured) {
    console.log('Contact submission saved (SMTP not configured):', submission.email)
    return res.status(201).json({
      message: 'Thank you for your message. We have received it and will contact you soon.',
      emailDelivered: false,
    })
  }

  try {
    await createSmtpTransporter().sendMail({
      from: process.env.SMTP_FROM || adminEmail,
      to: adminEmail,
      replyTo: submission.email,
      subject: `Website enquiry from ${submission.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(submission.phone)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(submission.message).replace(/\n/g, '<br>')}</p>
      `,
    })

    submission.emailDelivered = true
    console.log('Contact email delivered to', adminEmail)
    return res.status(201).json({ message: 'Thank you for your message. It has been sent to our team.', emailDelivered: true })
  } catch (error) {
    // The enquiry is already saved on the server, so it is NOT lost. Previously
    // this returned 503 and showed the visitor a failure message.
    console.error('Contact email delivery failed (submission still saved):', error.message)
    return res.status(201).json({
      message: 'Thank you for your message. We have received it and will contact you soon.',
      emailDelivered: false,
    })
  }
})

// Admin-only view of every enquiry, useful if SMTP delivery ever fails.
app.get('/api/contact/submissions', authMiddleware, (_req, res) => {
  try {
    const submissions = fs.existsSync(submissionsFile)
      ? JSON.parse(fs.readFileSync(submissionsFile, 'utf-8'))
      : []
    return res.json({ submissions: Array.isArray(submissions) ? submissions.slice().reverse() : [] })
  } catch {
    return res.status(500).json({ message: 'Could not read submissions.' })
  }
})

/* --------------------------- Static frontend / errors ---------------------- */

app.use('/api', (_req, res) => res.status(404).json({ message: 'Endpoint not found.' }))

if (fs.existsSync(distDir)) {
  // config.js must never be cached, so the backend URL can be changed on the
  // server and picked up on the next page load.
  app.get('/config.js', (_req, res) => {
    res.set('Cache-Control', 'no-store')
    res.sendFile(path.join(distDir, 'config.js'))
  })

  app.use(express.static(distDir))

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next()
    return res.sendFile(path.join(distDir, 'index.html'))
  })
} else {
  console.warn('dist/ not found. Run "npm run build" so the server can serve the website.')
}

// Turn upload/multer errors into JSON instead of an HTML error page.
app.use((error, _req, res, _next) => {
  console.error('Unhandled error:', error.message)
  const status = /Only image files|File too large/i.test(error.message || '') ? 400 : 500
  res.status(status).json({ message: error.message || 'Unexpected server error.' })
})

app.listen(port, host, () => {
  console.log(`Backend running on http://${host}:${port}`)
  console.log(`Admin email: ${adminEmail}`)
  console.log(`SMTP configured: ${smtpConfigured ? 'yes' : 'no'}`)

  if (smtpConfigured) {
    createSmtpTransporter()
      .verify()
      .then(() => console.log('SMTP connection verified.'))
      .catch((error) => console.warn('SMTP check failed:', error.message, '- enquiries will still be saved to server/submissions.json'))
  }
})
