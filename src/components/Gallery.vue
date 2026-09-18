<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { apiBase, getAuthHeaders } from '../lib/supabase'

const STORAGE_KEY = 'js-agriculture-gallery-v1'

const defaultPhotos = [
  { id: 'default-1', title: 'Partnership handshake', description: 'Sealing new partnerships with growers', image: '/gallery/partnership-handshake.jpg' },
  { id: 'default-2', title: 'Cooperative planting day', description: 'Cooperative planting day in Nyamirama', image: '/gallery/cooperative-planting.jpg' },
  { id: 'default-3', title: 'Land preparation', description: 'Mechanised land preparation ahead of planting', image: '/gallery/mechanized-ploughing.jpg' },
  { id: 'default-4', title: 'Farmer training', description: 'Pre-season training for partner farmers', image: '/gallery/farmer-training.jpg' },
  { id: 'default-5', title: 'Field monitoring', description: 'Field monitoring and harvest record-keeping', image: '/gallery/field-monitoring.jpg' },
  { id: 'default-6', title: 'Drying yard', description: 'Drying yards at peak harvest', image: '/gallery/chili-drying-yard.jpg' },
  { id: 'default-7', title: 'Cooperative meeting', description: 'Cooperative meetings with grower families', image: '/gallery/cooperative-meeting.jpg' },
  { id: 'default-8', title: 'Community launch day', description: 'Community launch day with our field team', image: '/gallery/community-launch-day.jpg' },
]

const photos = ref([])
const selectedPhoto = ref(null)
const isAdminOpen = ref(false)
const isLoading = ref(false)
const isAuthenticated = ref(false)
const authForm = ref({ email: '', password: '' })
const authError = ref('')
const passwordResetEmail = ref('')
const passwordResetMessage = ref('')
const passwordResetLink = ref('')
const newPassword = ref('')
const showForgotPassword = ref(false)
const showRecoveryForm = ref(false)
const notice = ref('')
const form = ref({
  id: null,
  title: '',
  description: '',
  image: '',
  file: null,
})

function buildId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readGallery() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      photos.value = [...defaultPhotos]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos.value))
      return
    }

    const parsed = JSON.parse(saved)
    photos.value = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultPhotos]
  } catch (error) {
    console.error('Failed to load gallery from local storage', error)
    photos.value = [...defaultPhotos]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos.value))
  }
}

function saveGallery() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos.value))
}

function setSession(token, user) {
  localStorage.setItem('js-agri-admin-token', token)
  localStorage.setItem('js-agri-admin-user', JSON.stringify(user))
  isAuthenticated.value = true
}

function clearSession() {
  localStorage.removeItem('js-agri-admin-token')
  localStorage.removeItem('js-agri-admin-user')
  isAuthenticated.value = false
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)

  if (!response.ok) {
    let message = 'Request failed.'

    try {
      const payload = await response.json()
      message = payload.message || message
    } catch {
      message = response.statusText || message
    }

    throw new Error(message)
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return null
}

function resetForm() {
  form.value = {
    id: null,
    title: '',
    description: '',
    image: '',
    file: null,
  }
  notice.value = ''
}

function openPhoto(photo) {
  selectedPhoto.value = photo
  document.body.classList.add('modal-open')
}

function closePhoto() {
  selectedPhoto.value = null
  document.body.classList.remove('modal-open')
}

function handleKeydown(event) {
  if (event.key === 'Escape' && selectedPhoto.value) closePhoto()
}

async function fetchRemoteGallery() {
  try {
    const data = await requestJson(`${apiBase}/api/gallery`)

    if (!data || !Array.isArray(data.items)) {
      readGallery()
      return
    }

    photos.value = data.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      image: item.image,
    }))
  } catch (error) {
    console.error('Unable to fetch gallery from backend', error)
    readGallery()
  }
}

async function refreshGallery() {
  await fetchRemoteGallery()
}

async function checkSession() {
  const token = localStorage.getItem('js-agri-admin-token')

  if (!token) {
    isAuthenticated.value = false
    readGallery()
    return
  }

  isAuthenticated.value = true
  await fetchRemoteGallery()
}

async function signIn() {
  authError.value = ''
  isLoading.value = true

  try {
    const response = await requestJson(`${apiBase}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: authForm.value.email,
        password: authForm.value.password,
      }),
    })

    if (!response?.token) {
      throw new Error('No token returned by backend.')
    }

    setSession(response.token, response.user)
    authForm.value.email = ''
    authForm.value.password = ''
    isAdminOpen.value = true
    await checkSession()
  } catch (error) {
    authError.value = error.message || 'Unable to sign in.'
  } finally {
    isLoading.value = false
  }
}

async function signOut() {
  clearSession()
  resetForm()
  await fetchRemoteGallery()
}

function detectRecoveryLink() {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const token = params.get('reset')
  const type = params.get('type')

  if (type === 'recovery' && token) {
    showRecoveryForm.value = true
    showForgotPassword.value = false
  }
}

async function requestPasswordReset() {
  const email = authForm.value.email.trim() || passwordResetEmail.value.trim()

  if (!email) {
    passwordResetMessage.value = 'Please enter your email address first.'
    return
  }

  isLoading.value = true
  passwordResetMessage.value = ''
  passwordResetLink.value = ''

  try {
    const response = await requestJson(`${apiBase}/api/admin/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    passwordResetMessage.value = response?.message || 'A password reset email has been sent.'
    passwordResetLink.value = response?.resetUrl || ''
    showForgotPassword.value = Boolean(response?.resetUrl) || false
    passwordResetEmail.value = ''
  } catch (error) {
    passwordResetMessage.value = error.message || 'Unable to send reset email.'
  } finally {
    isLoading.value = false
  }
}

async function updatePasswordAfterRecovery() {
  if (!newPassword.value || newPassword.value.length < 6) {
    passwordResetMessage.value = 'Password must be at least 6 characters long.'
    return
  }

  const params = new URLSearchParams(window.location.search)
  const token = params.get('reset')

  if (!token) {
    passwordResetMessage.value = 'No valid reset token was found in the URL.'
    return
  }

  isLoading.value = true
  passwordResetMessage.value = ''

  try {
    const response = await requestJson(`${apiBase}/api/admin/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        password: newPassword.value,
      }),
    })

    newPassword.value = ''
    showRecoveryForm.value = false
    showForgotPassword.value = false
    passwordResetMessage.value = response?.message || 'Password updated successfully.'
    window.history.replaceState({}, '', window.location.pathname)
  } catch (error) {
    passwordResetMessage.value = error.message || 'Password reset failed.'
  } finally {
    isLoading.value = false
  }
}

function onImageSelected(event) {
  const file = event.target.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    notice.value = 'Please choose a valid image file.'
    return
  }

  form.value.file = file

  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = String(reader.result)
    notice.value = ''
  }
  reader.readAsDataURL(file)
}

async function submitPhoto() {
  if (!form.value.title.trim() || !form.value.description.trim()) {
    notice.value = 'Please provide both a title and a description.'
    return
  }

  if (!form.value.image) {
    notice.value = 'Please upload an image before saving.'
    return
  }

  isLoading.value = true

  try {
    if (isAuthenticated.value) {
      const formData = new FormData()
      formData.append('title', form.value.title.trim())
      formData.append('description', form.value.description.trim())

      if (form.value.file) {
        formData.append('image', form.value.file)
      }

      const url = form.value.id ? `${apiBase}/api/gallery/${form.value.id}` : `${apiBase}/api/gallery`
      const method = form.value.id ? 'PUT' : 'POST'

      const response = await requestJson(url, {
        method,
        headers: getAuthHeaders(localStorage.getItem('js-agri-admin-token'), true),
        body: formData,
      })

      if (!response) {
        throw new Error('The backend did not respond with gallery data.')
      }
    } else {
      const payload = {
        id: form.value.id || buildId(),
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        image: form.value.image,
      }

      const existingIndex = photos.value.findIndex((photo) => photo.id === payload.id)

      if (existingIndex >= 0) {
        photos.value.splice(existingIndex, 1, payload)
      } else {
        photos.value.unshift(payload)
      }

      saveGallery()
    }

    resetForm()
    await refreshGallery()
  } catch (error) {
    notice.value = error.message || 'Could not save the gallery item.'
  } finally {
    isLoading.value = false
  }
}

function editPhoto(photo) {
  form.value = {
    id: photo.id,
    title: photo.title,
    description: photo.description,
    image: photo.image,
    file: null,
  }
  isAdminOpen.value = true
  notice.value = ''
}

async function deletePhoto(id) {
  if (isAuthenticated.value) {
    try {
      await requestJson(`${apiBase}/api/gallery/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(localStorage.getItem('js-agri-admin-token')),
      })
      await refreshGallery()
      if (form.value.id === id) resetForm()
      return
    } catch (error) {
      notice.value = error.message || 'Could not delete the gallery item.'
      return
    }
  }

  photos.value = photos.value.filter((photo) => photo.id !== id)
  saveGallery()

  if (form.value.id === id) {
    resetForm()
  }
}

onMounted(async () => {
  const adminEmail = 'jsagricultureltd.co@gmail.com'

  authForm.value.email = adminEmail
  passwordResetEmail.value = adminEmail

  window.addEventListener('keydown', handleKeydown)
  detectRecoveryLink()
  await checkSession()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('modal-open')
})
</script>

<template>
  <section id="gallery" class="gallery">
    <div class="container">
      <div class="gallery-head">
        <div class="gallery-header-row">
          <p class="eyebrow-tag"><span class="dot" aria-hidden="true"></span>In the field</p>
          <button class="btn btn-primary admin-toggle" type="button" @click="isAdminOpen = !isAdminOpen">
            {{ isAdminOpen ? 'Close admin' : 'Manage gallery' }}
          </button>
        </div>
        <h2>Real farms. Real partnerships. Real produce.</h2>
        <p class="gallery-intro">
          A look at the day-to-day work behind every shipment — from planting with
          cooperative families to drying yards at peak harvest.
        </p>
      </div>

      <div class="gallery-grid">
        <figure v-for="photo in photos" :key="photo.id" class="gallery-item">
          <img :src="photo.image" :alt="photo.title" loading="lazy" />
          <figcaption>{{ photo.description }}</figcaption>
          <button class="gallery-open" type="button" :aria-label="`View ${photo.title}`" @click="openPhoto(photo)">
            <span aria-hidden="true">+</span>
          </button>
        </figure>
      </div>
    </div>

    <div v-if="isAdminOpen" class="admin-panel">
      <div class="admin-panel-inner">
        <div v-if="!isAuthenticated" class="auth-card">
          <div class="auth-header">
            <h3>Admin login</h3>
            <button type="button" class="admin-close" @click="isAdminOpen = false">Close</button>
          </div>

          <p class="auth-tip">Sign in to add, update, or delete gallery photos.</p>

          <form v-if="!showRecoveryForm" class="auth-form" @submit.prevent="signIn">
            <div class="field-group">
              <label for="admin-email">Email</label>
              <input id="admin-email" v-model="authForm.email" type="email" placeholder="admin@example.com" required />
            </div>

            <div class="field-group">
              <label for="admin-password">Password</label>
              <input id="admin-password" v-model="authForm.password" type="password" placeholder="••••••••" required />
            </div>

            <p v-if="authError" class="notice">{{ authError }}</p>

            <div class="auth-actions">
              <button class="btn btn-primary" type="submit" :disabled="isLoading">
                {{ isLoading ? 'Signing in...' : 'Sign in' }}
              </button>
              <button class="btn btn-ghost" type="button" @click="showForgotPassword = !showForgotPassword">
                Forgot password?
              </button>
            </div>
          </form>

          <div v-if="showForgotPassword && !showRecoveryForm" class="reset-box">
            <div class="field-group">
              <label for="reset-email">Email address</label>
              <input id="reset-email" v-model="passwordResetEmail" type="email" placeholder="admin@example.com" />
            </div>

            <div class="auth-actions">
              <button class="btn btn-primary" type="button" @click="requestPasswordReset" :disabled="isLoading">
                {{ isLoading ? 'Sending...' : 'Send reset link' }}
              </button>
              <button class="btn btn-ghost" type="button" @click="showForgotPassword = false; passwordResetMessage = ''; passwordResetLink = ''">
                Cancel
              </button>
            </div>

            <p v-if="passwordResetMessage" class="notice">{{ passwordResetMessage }}</p>
            <p v-if="passwordResetLink" class="notice reset-link-box">
              <a :href="passwordResetLink" target="_blank" rel="noreferrer">Open reset link</a>
            </p>
          </div>

          <form v-if="showRecoveryForm" class="auth-form" @submit.prevent="updatePasswordAfterRecovery">
            <div class="field-group">
              <label for="new-password">New password</label>
              <input id="new-password" v-model="newPassword" type="password" placeholder="Enter a new password" required />
            </div>

            <p v-if="passwordResetMessage" class="notice">{{ passwordResetMessage }}</p>

            <button class="btn btn-primary" type="submit" :disabled="isLoading">
              {{ isLoading ? 'Updating...' : 'Update password' }}
            </button>
          </form>
        </div>

        <div v-else class="admin-content">
          <div class="admin-header">
            <h3>{{ form.id ? 'Edit gallery item' : 'Add gallery item' }}</h3>
            <button type="button" class="admin-close" @click="isAdminOpen = false; resetForm()">Close</button>
          </div>

          <form class="admin-form" @submit.prevent="submitPhoto">
            <div class="field-group">
              <label for="gallery-title">Title</label>
              <input id="gallery-title" v-model="form.title" type="text" placeholder="Example: Harvest day" />
            </div>

            <div class="field-group">
              <label for="gallery-description">Description</label>
              <textarea id="gallery-description" v-model="form.description" rows="4" placeholder="Add a short description for this photo"></textarea>
            </div>

            <div class="field-group">
              <label for="gallery-upload">Photo</label>
              <input id="gallery-upload" type="file" accept="image/*" @change="onImageSelected" />
            </div>

            <div v-if="form.image" class="preview-box">
              <img :src="form.image" :alt="form.title || 'Preview image'" />
            </div>

            <p v-if="notice" class="notice">{{ notice }}</p>

            <div class="admin-actions">
              <button class="btn btn-primary" type="submit" :disabled="isLoading">
                {{ isLoading ? 'Saving...' : (form.id ? 'Save changes' : 'Add photo') }}
              </button>
              <button v-if="form.id" class="btn btn-ghost" type="button" @click="resetForm">
                Cancel
              </button>
              <button class="btn btn-ghost" type="button" @click="signOut">
                Sign out
              </button>
            </div>
          </form>

          <div class="gallery-list-box">
            <h4>Current gallery list</h4>
            <ul class="gallery-list">
              <li v-for="photo in photos" :key="photo.id">
                <img :src="photo.image" :alt="photo.title" />
                <div class="gallery-item-copy">
                  <strong>{{ photo.title }}</strong>
                  <span>{{ photo.description }}</span>
                </div>
                <div class="small-actions">
                  <button type="button" @click="editPhoto(photo)">Edit</button>
                  <button type="button" class="danger" @click="deletePhoto(photo.id)">Delete</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedPhoto" class="lightbox" role="dialog" aria-modal="true" :aria-label="selectedPhoto.title" @click.self="closePhoto">
      <div class="lightbox-content">
        <button class="lightbox-close" type="button" aria-label="Close image viewer" @click="closePhoto">&times;</button>
        <img :src="selectedPhoto.image" :alt="selectedPhoto.title" />
        <p>{{ selectedPhoto.description }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery {
  padding: 72px 0;
  background: var(--paper);
}

.gallery-head {
  max-width: 56ch;
  margin-bottom: 44px;
}

.gallery-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chili);
  display: inline-block;
}

h2 {
  font-size: clamp(2rem, 3.6vw, 2.8rem);
  margin: 14px 0 16px;
  color: var(--forest-deep);
  max-width: 20ch;
}

.gallery-intro {
  color: var(--ink-soft);
  font-size: 1.05rem;
  max-width: 52ch;
}

.gallery-grid {
  column-count: 4;
  column-gap: 18px;
}

.gallery-item {
  margin: 0;
  margin-bottom: 18px;
  position: relative;
  display: block;
  break-inside: avoid;
  overflow: hidden;
  border-radius: 8px;
  background: var(--forest-deep);
  aspect-ratio: 4 / 3;
}

.gallery-item:nth-child(4n + 1),
.gallery-item:nth-child(4n + 4) {
  aspect-ratio: 3 / 4;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.35s ease;
}

.gallery-item:hover img {
  transform: scale(1.06);
}

.gallery-item figcaption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 14px 10px;
  background: linear-gradient(0deg, rgba(6, 67, 74, 0.92) 0%, rgba(6, 67, 74, 0) 100%);
  color: #fff9f0;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.3;
}

.gallery-open {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 249, 240, 0.7);
  border-radius: 50%;
  background: rgba(6, 67, 74, 0.72);
  color: #fff9f0;
  font-size: 1.5rem;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.gallery-item:hover .gallery-open,
.gallery-open:focus-visible {
  opacity: 1;
}

.gallery-open:hover {
  background: var(--chili);
}

.admin-panel {
  margin-top: 36px;
}

.admin-panel-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 22px 18px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fffdf9;
  box-shadow: 0 18px 38px rgba(6, 67, 74, 0.08);
}

.auth-card,
.admin-content {
  display: block;
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.auth-header h3,
.admin-header h3 {
  font-size: clamp(1.6rem, 2vw, 2rem);
}

.auth-tip {
  color: var(--ink-soft);
  margin-bottom: 18px;
}

.auth-form {
  display: grid;
  gap: 16px;
  max-width: 480px;
}

.auth-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.reset-box {
  display: grid;
  gap: 16px;
  max-width: 480px;
  margin-top: 16px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.admin-close {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--forest-deep);
  padding: 9px 12px;
  border-radius: 8px;
  font-weight: 700;
}

.admin-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 28px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group label {
  font-weight: 700;
  color: var(--forest-deep);
}

.field-group input,
.field-group textarea {
  width: 100%;
  border: 1px solid rgba(22, 38, 30, 0.18);
  border-radius: 10px;
  background: #fff;
  padding: 12px 14px;
  font: inherit;
  color: var(--ink);
}

.field-group textarea {
  resize: vertical;
  min-height: 120px;
}

#gallery-upload {
  display: block;
  padding: 10px 12px;
  border: 1px dashed rgba(22, 38, 30, 0.28);
  border-radius: 10px;
  background: #fff;
}

.preview-box {
  grid-column: 1 / -1;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  background: #f5f0e6;
}

.preview-box img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
}

.notice {
  grid-column: 1 / -1;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(178, 13, 53, 0.08);
  color: var(--chili-deep);
  font-weight: 700;
}

.admin-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.gallery-list-box {
  border-top: 1px solid var(--line);
  padding-top: 20px;
}

.gallery-list-box h4 {
  font-size: 1.5rem;
  margin-bottom: 16px;
}

.gallery-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.gallery-list li {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}

.gallery-list li img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 10px;
}

.gallery-item-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.gallery-item-copy strong {
  color: var(--forest-deep);
}

.gallery-item-copy span {
  color: var(--ink-soft);
  overflow-wrap: anywhere;
}

.small-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.small-actions button {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--forest-deep);
  padding: 8px 10px;
  font-weight: 700;
}

.small-actions .danger {
  color: var(--chili-deep);
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(6, 67, 74, 0.9);
}

.lightbox-content {
  position: relative;
  width: min(900px, 100%);
}

.lightbox-content img {
  width: 100%;
  max-height: 78vh;
  object-fit: contain;
  background: var(--forest-deep);
}

.lightbox-content p {
  padding-top: 12px;
  color: #fff9f0;
  font-weight: 600;
}

.lightbox-close {
  position: absolute;
  top: -46px;
  right: 0;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 249, 240, 0.75);
  border-radius: 50%;
  background: transparent;
  color: #fff9f0;
  font-size: 1.7rem;
  line-height: 1;
}

@media (max-width: 980px) {
  .gallery-grid {
    column-count: 2;
  }

  .gallery-item,
  .gallery-item:nth-child(4n + 1),
  .gallery-item:nth-child(4n + 4) {
    aspect-ratio: 4 / 3;
  }

  .admin-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .gallery-grid {
    column-count: 1;
  }

  .gallery-header-row,
  .admin-header,
  .auth-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gallery-list li {
    grid-template-columns: 1fr;
  }
}
</style>
