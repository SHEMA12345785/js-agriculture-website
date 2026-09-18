# J.S Agriculture Website - Project Summary for ChatGPT

## PROJECT OVERVIEW
- **Project Name:** J.S Agriculture Import and Export Co. Ltd — Website
- **Tech Stack:** Vue 3 + Vite (Frontend), Express.js + Node.js (Backend)
- **Purpose:** Company website for agricultural import/export business
- **Current Status:** Development in progress
- **Date Created:** September 17, 2026

---

## PROJECT STRUCTURE

```
js-agriculture-website improvement/
├── .env                          # Environment variables (SMTP config)
├── .env.example                  # Example env file
├── .git/                         # Git repository
├── .gitignore                    # Git ignore rules
├── .vscode/                      # VS Code settings
├── index.html                    # Main HTML entry point
├── package.json                  # NPM dependencies and scripts
├── package-lock.json             # Dependency lock file
├── README.md                     # Project documentation
├── vite.config.js                # Vite configuration
├── supabase-gallery-schema.sql   # Database schema
│
├── public/                       # Static assets
│   ├── robots.txt
│   ├── sitemap.xml
│   └── gallery/                  # Gallery images folder
│
├── server/                       # Backend (Express.js)
│   ├── index.js                  # Main server file with API endpoints
│   ├── submissions.json          # Saved contact form submissions
│   └── uploads/
│       └── gallery/              # Uploaded gallery images
│
└── src/                          # Frontend (Vue 3)
    ├── App.vue                   # Root Vue component
    ├── main.js                   # Entry point
    ├── style.css                 # Global styles and design tokens
    ├── assets/                   # Asset files
    │
    └── components/               # Vue components
        ├── About.vue             # About section
        ├── Contact.vue           # Contact form (MAIN FOCUS)
        ├── Footer.vue            # Footer
        ├── Gallery.vue           # Gallery with admin upload
        ├── Hero.vue              # Hero/header section
        ├── NavBar.vue            # Navigation bar
        ├── Process.vue           # 6-step workflow
        ├── Products.vue          # Product catalogue
        └── Services.vue          # 8 services list
    
    └── lib/
        └── supabase.js           # Supabase configuration
```

---

## CURRENT PROJECT STATE

### Frontend (Vue 3)
- ✅ Home page with hero section
- ✅ About section
- ✅ Services section (8 services)
- ✅ Products/Catalogue section
- ✅ Process/Workflow section (6 steps)
- ✅ Contact form component
- ✅ Footer with company details
- ✅ Navigation bar
- ✅ Gallery section
- ✅ WhatsApp integration link
- ✅ Google Map integration
- ✅ Responsive design

### Backend (Express.js)
- ✅ Admin login system with JWT
- ✅ Password reset functionality
- ✅ Gallery management (CRUD operations)
- ✅ File upload handling (multer)
- ✅ CORS configured
- ✅ **NEW:** Contact form API endpoint (`/api/contact`)
- ✅ Contact submissions saved to `submissions.json` (local backup)
- ✅ Nodemailer configured for SMTP

### Contact Form Functionality
- ✅ Form fields: Name, Email, Phone (optional), Message
- ✅ Frontend validation
- ✅ Submit to backend API: `POST /api/contact`
- ✅ Local backup: Submissions saved to `server/submissions.json`
- ⚠️ **ISSUE:** Email delivery not working - SMTP password not configured

---

## CURRENT ISSUE & WISHES

### ISSUE: Contact Form Emails Not Delivering
**Problem:** 
- Contact form shows "success" message
- Messages are saved locally in `submissions.json`
- But emails are NOT being sent to jsagricultureimportexportco@gmail.com
- Reason: SMTP_PASS in `.env` is still a placeholder: `your_16_character_app_password_here`

**Solution Needed:**
- Configure Gmail SMTP with actual App Password
- Test email delivery
- Ensure admins receive emails when clients submit contact form

### .ENV CONFIGURATION
Current `.env` file:
```env
VITE_API_URL=http://localhost:4000
PORT=4000
CLIENT_URL=http://localhost:5173
JWT_SECRET=local-dev-secret-change-this
ADMIN_EMAIL=jsagricultureimportexportco@gmail.com
ADMIN_PASSWORD=Admin@123456
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jsagricultureimportexportco@gmail.com
SMTP_PASS=your_16_character_app_password_here     ← NEEDS TO BE REPLACED
SMTP_FROM=jsagricultureimportexportco@gmail.com
```

---

## DEPENDENCIES

### Production Dependencies
```json
{
  "bcryptjs": "^2.4.3",           // Password hashing
  "cors": "^2.8.5",               // CORS middleware
  "dotenv": "^17.4.2",            // Environment variables
  "express": "^4.21.2",           // Web framework
  "jsonwebtoken": "^9.0.2",       // JWT authentication
  "multer": "^1.4.5-lts.1",       // File upload handling
  "nodemailer": "^6.9.16",        // Email sending
  "vue": "^3.5.42"                // Frontend framework
}
```

### Dev Dependencies
```json
{
  "@rollup/wasm-node": "^4.63.3",
  "@vitejs/plugin-vue": "^4.3.4", // Vite Vue plugin
  "rollup": "^4.52.5",            // Module bundler
  "vite": "^5.4.10"               // Build tool
}
```

---

## CONTACT FORM FEATURE DETAILS

### Frontend (Contact.vue)
```javascript
// Current implementation:
async function submit() {
  // Sends POST request to: http://localhost:4000/api/contact
  // With payload: { name, email, phone, message }
  // Expected response: { message: "Success" }
}
```

### Backend (server/index.js)
```javascript
app.post('/api/contact', async (req, res) => {
  // 1. Validates required fields (name, email, message)
  // 2. Saves submission to submissions.json file
  // 3. Checks if SMTP is configured
  // 4. If SMTP configured: Sends email via nodemailer
  // 5. If SMTP not configured: Returns success message (local backup)
  // 6. On error: Still returns success (fallback to local storage)
})
```

### Contact Submissions Saved To
- File: `server/submissions.json`
- Format: JSON array of submission objects
- Each submission contains: id, name, email, phone, message, timestamp

---

## RUNNING THE PROJECT

### Development Mode
```bash
# Terminal 1 - Frontend (Vite)
npm run dev
# Runs on: http://localhost:5174/ (or 5173)

# Terminal 2 - Backend (Express)
npm run server
# Runs on: http://localhost:4000
```

### Build for Production
```bash
npm run build
# Output: dist/ folder (deploy to hosting)
```

---

## THINGS TO ASK CHATGPT

1. **Email Configuration Help:**
   - How to generate Google App Password for Gmail SMTP
   - Alternative email services if Gmail doesn't work
   - Testing SMTP configuration

2. **Code Improvements:**
   - Better error handling in contact form
   - Email validation
   - Rate limiting for contact form submissions
   - Sending auto-reply emails to customers

3. **Features to Add:**
   - Contact form notifications in admin dashboard
   - Email templates for contact submissions
   - Database storage instead of JSON file
   - SMS notifications via Twilio
   - Admin email digest of submissions
   - Honeypot field for spam prevention

4. **Deployment:**
   - How to deploy to production
   - Environment setup for production
   - HTTPS configuration
   - Email service recommendations for production
   - Database setup (currently using JSON file)

5. **Testing:**
   - How to test email functionality locally
   - Testing contact form with fake SMTP
   - Unit tests for email sending

6. **Security:**
   - Protecting API endpoints
   - Email validation
   - CSRF protection
   - Rate limiting

---

## COMPANY INFORMATION

**Company:** J.S Agriculture Import and Export Company Ltd  
**Email:** jsagricultureimportexportco@gmail.com
**Phone:** 0791 945 206 / 0795 398 553  
**WhatsApp:** https://wa.me/250791945206  
**Location:** Kayonza / Nyamirama, Rwanda  
**Website:** https://www.jsagriculturaltd.com

---

## QUICK REFERENCE

### Important Files to Edit
- Contact form: `src/components/Contact.vue`
- Backend API: `server/index.js`
- Email config: `.env` file
- Styles: `src/style.css`
- Other components: `src/components/*.vue`

### Key Ports
- Frontend: 5173 (or 5174 if 5173 is busy)
- Backend: 4000
- API URL: http://localhost:4000/api

### Admin Credentials (for local development)
- Email: jsagricultureimportexportco@gmail.com
- Password: Admin@123456 (change in `.env`)
