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
const port = process.env.PORT || 4000

const adminEmail = process.env.ADMIN_EMAIL || 'jsagricultureimportexportco@gmail.com'
let adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123456', 10)
const jwtSecret = process.env.JWT_SECRET || 'local-dev-secret-change-this'
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

const smtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.SMTP_PASS !== 'your_16_character_app_password_here'
)

function createSmtpTransporter() {
  const port = Number(process.env.SMTP_PORT || 587)

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character])
}

const uploadsDir = path.join(__dirname, 'uploads')
const galleryDir = path.join(uploadsDir, 'gallery')

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true })

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '20mb' }))
app.use('/uploads', express.static(galleryDir))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, galleryDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '')
    cb(null, `${Date.now()}-${safeName}`)
  },
})

const upload = multer({ storage })

function generateToken(user) {
  return jwt.sign({ email: user.email, role: 'admin' }, jwtSecret, { expiresIn: '7d' })
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

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

function loadGalleryItems() {
  try {
    if (fs.existsSync(galleryFile)) {
      const saved = JSON.parse(fs.readFileSync(galleryFile, 'utf-8'))
      if (Array.isArray(saved) && saved.length > 0) return saved
    }
  } catch (error) {
    console.error('Failed to read gallery-items.json, falling back to defaults:', error.message)
  }
  return [...defaultGalleryItems]
}

function saveGalleryItems() {
  try {
    fs.writeFileSync(galleryFile, JSON.stringify(galleryItems, null, 2))
  } catch (error) {
    console.error('Failed to persist gallery-items.json:', error.message)
  }
}

const galleryItems = loadGalleryItems()

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Backend is running' })
})

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(401).json({ message: 'Invalid credentials.' })
  }

  const isValid = bcrypt.compareSync(password, adminPasswordHash)

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials.' })
  }

  return res.json({
    token: generateToken({ email: adminEmail }),
    user: { email: adminEmail },
  })
})

app.post('/api/admin/forgot-password', async (req, res) => {
  const { email } = req.body || {}

  if (!email || email.toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(404).json({ message: 'No admin account found for that email.' })
  }

  const resetToken = jwt.sign({ email: adminEmail, purpose: 'reset-password' }, jwtSecret, { expiresIn: '30m' })
  const resetUrl = `${clientUrl}/?reset=${encodeURIComponent(resetToken)}&type=recovery`
  if (!smtpConfigured) {
    console.log('Password reset requested for', adminEmail)
    console.log('Reset link (email not configured):', resetUrl)
    return res.json({
      message: 'Email delivery is not configured on this server. Use the reset link below instead.',
      resetUrl,
      smtpConfigured: false,
    })
  }

  try {
    const transporter = createSmtpTransporter()

    await transporter.sendMail({
      from: process.env.SMTP_FROM || adminEmail,
      to: adminEmail,
      subject: 'Password reset for JS Agriculture admin',
      text: `Reset your password here: ${resetUrl}`,
      html: `<p>Reset your password here:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    })

    return res.json({
      message: 'If this email is registered, a reset link has been sent.',
      resetUrl,
      smtpConfigured: true,
    })
  } catch (error) {
    console.error('Email send failed', error)
    return res.status(500).json({
      message: 'The reset email could not be sent. Please check the SMTP configuration.',
    })
  }
})

app.post('/api/admin/reset-password', (req, res) => {
  const { token, password } = req.body || {}

  if (!token || !password || password.length < 6) {
    return res.status(400).json({ message: 'A valid reset token and a password of at least 6 characters are required.' })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)

    if (decoded.email !== adminEmail || decoded.purpose !== 'reset-password') {
      return res.status(401).json({ message: 'Invalid reset token.' })
    }

    const newHash = bcrypt.hashSync(password, 10)
    adminPasswordHash = newHash

    return res.json({ message: 'Password updated successfully.' })
  } catch (error) {
    return res.status(401).json({ message: 'Reset link is invalid or expired.' })
  }
})

app.get('/api/gallery', (_req, res) => {
  res.json({ items: galleryItems })
})

app.post('/api/gallery', authMiddleware, upload.single('image'), (req, res) => {
  const { title, description } = req.body || {}
  const file = req.file

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' })
  }

  if (!file) {
    return res.status(400).json({ message: 'Image is required.' })
  }

  const imageUrl = `${process.env.VITE_API_URL || 'http://localhost:4000'}/uploads/gallery/${file.filename}`
  const item = {
    id: `gallery-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    image: imageUrl,
  }

  galleryItems.unshift(item)
  saveGalleryItems()
  return res.status(201).json({ item })
})

app.put('/api/gallery/:id', authMiddleware, upload.single('image'), (req, res) => {
  const { id } = req.params
  const { title, description } = req.body || {}
  const index = galleryItems.findIndex((item) => item.id === id)

  if (index === -1) {
    return res.status(404).json({ message: 'Gallery item not found.' })
  }

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' })
  }

  const currentItem = galleryItems[index]
  const imageUrl = req.file ? `${process.env.VITE_API_URL || 'http://localhost:4000'}/uploads/gallery/${req.file.filename}` : currentItem.image

  galleryItems[index] = {
    ...currentItem,
    title: title.trim(),
    description: description.trim(),
    image: imageUrl,
  }

  saveGalleryItems()
  return res.json({ item: galleryItems[index] })
})

app.delete('/api/gallery/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const index = galleryItems.findIndex((item) => item.id === id)

  if (index === -1) {
    return res.status(404).json({ message: 'Gallery item not found.' })
  }

  galleryItems.splice(index, 1)
  saveGalleryItems()
  return res.json({ message: 'Gallery item deleted.' })
})

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' })
  }

  const submission = {
    id: Date.now(),
    name,
    email,
    phone: phone || 'Not provided',
    message,
    timestamp: new Date().toISOString(),
  }

  // Save to file as backup
  const submissionsFile = path.join(__dirname, 'submissions.json')
  try {
    let submissions = []
    if (fs.existsSync(submissionsFile)) {
      submissions = JSON.parse(fs.readFileSync(submissionsFile, 'utf-8'))
    }
    submissions.push(submission)
    fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2))
  } catch (err) {
    console.error('Error saving submission to file:', err)
  }

  if (!smtpConfigured) {
    console.log('Contact form submission received and saved locally:', submission)
    return res.json({
      message: 'Thank you for your message! We have received your submission and will contact you soon.',
      smtpConfigured: false,
    })
  }

  try {
    const transporter = createSmtpTransporter()

    const mailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM || adminEmail,
      to: adminEmail,
      replyTo: email,
      subject: `Website enquiry from ${name}`,
      html: mailContent,
    })

    console.log('Contact email sent successfully to:', adminEmail)
    return res.status(201).json({ message: 'Your message has been sent successfully.' })
  } catch (error) {
    console.error('Contact form email send failed:', error.message)
    return res.status(503).json({
      message: 'Your message was saved, but email delivery failed. Please contact us directly.',
      smtpConfigured: true,
    })
  }
})

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
