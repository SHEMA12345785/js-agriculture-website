<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { apiUrl } from '../lib/api'
import { AsYouType, getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js'

const name = ref('')
const email = ref('')
const phone = ref('')
const residenceCountry = ref('RW')
const countrySearch = ref('')
const countryOpen = ref(false)
const countryPicker = ref(null)
const countrySearchInput = ref(null)
const autoHideMs = ref(24 * 60 * 60 * 1000)
const message = ref('')
const sent = ref(false)
const sending = ref(false)
const error = ref('')

const confirmation = ref('')
const contactHidden = ref(false)
const hidePending = ref(false)
const contactShareToken = ref('')
const submissionId = ref('')
const phoneExpiresAt = ref('')
const sharedPhone = ref('')
let contactHideTimer

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const countries = getCountries().map((code) => ({
  code,
  name: regionNames.of(code) || code,
  callingCode: `+${getCountryCallingCode(code)}`,
  flag: String.fromCodePoint(...[...code].map((letter) => letter.charCodeAt(0) + 127397)),
})).sort((a, b) => a.name.localeCompare(b.name))
const selectedCountry = computed(() => countries.find((country) => country.code === residenceCountry.value))
const filteredCountries = computed(() => {
  const query = countrySearch.value.trim().toLocaleLowerCase()
  return query
    ? countries.filter((country) => `${country.name} ${country.callingCode}`.toLocaleLowerCase().includes(query))
    : countries
})
const formattedPhone = computed(() => phone.value ? new AsYouType(residenceCountry.value).input(phone.value) : '')
const validPhone = computed(() => !phone.value || isValidPhoneNumber(phone.value, residenceCountry.value))

function openCountryPicker() {
  countryOpen.value = true
  countrySearch.value = ''
  nextTick(() => countrySearchInput.value?.focus())
}

function closeCountryPicker() {
  countryOpen.value = false
  countrySearch.value = ''
}

function selectCountry(country) {
  residenceCountry.value = country.code
  updateCountry()
  closeCountryPicker()
}

function handleCountryOutsideClick(event) {
  if (countryOpen.value && !countryPicker.value?.contains(event.target)) closeCountryPicker()
}

function handleCountryKeydown(event) {
  if (event.key === 'Escape') closeCountryPicker()
}

onMounted(() => document.addEventListener('pointerdown', handleCountryOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleCountryOutsideClick))

function updateCountry() {
  phone.value = formattedPhone.value
}

function onPhoneInput(event) {
  phone.value = new AsYouType(residenceCountry.value).input(event.target.value)
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim())
}

async function submit() {
  error.value = ''

  // Validate in the browser first so visitors get instant feedback instead of
  // a failed request.
  if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
    error.value = 'Please fill in your name, email and message.'
    return
  }

  if (!isValidEmail(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  if (!phone.value.trim() || !validPhone.value) {
    error.value = phone.value.trim()
      ? 'Please enter a valid phone number for your selected country.'
      : 'Please enter your contact number.'
    return
  }

  sending.value = true

  // Abort rather than hanging forever on a slow or unreachable network.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(apiUrl('/api/contact'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim(),
        country: `${selectedCountry.value?.flag || ''} ${selectedCountry.value?.name || residenceCountry.value}`,
        countryCode: residenceCountry.value,
        phone: parsePhoneNumberFromString(phone.value, residenceCountry.value)?.formatInternational() || phone.value.trim(),
        autoHideMs: autoHideMs.value,
        message: message.value.trim(),
      }),
      signal: controller.signal,
    })

    let payload = null

    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    if (!response.ok) {
      // Show the server's own explanation when it gives one.
      throw new Error(payload?.message || 'The message could not be sent.')
    }

    confirmation.value = payload?.message || 'Thank you for your message. We will contact you soon.'
    contactShareToken.value = payload?.shareToken || ''
    submissionId.value = payload?.submissionId || ''
    phoneExpiresAt.value = payload?.phoneExpiresAt || new Date(Date.now() + autoHideMs.value).toISOString()
    sharedPhone.value = parsePhoneNumberFromString(phone.value, residenceCountry.value)?.formatInternational() || phone.value
    contactHidden.value = false
    hidePending.value = false
    sent.value = true
    clearTimeout(contactHideTimer)
    contactHideTimer = setTimeout(() => hideContact(), Math.max(0, Date.parse(phoneExpiresAt.value) - Date.now()))
  } catch (requestError) {
    if (requestError.name === 'AbortError') {
      error.value = 'The request timed out. Please check your internet connection and try again.'
    } else {
      error.value =
        requestError.message ||
        'We could not send your message. Please email us directly at jsagricultureimportexportco@gmail.com.'
    }
  } finally {
    clearTimeout(timeout)
    sending.value = false
  }
}

async function hideContact() {
  if (contactHidden.value && !hidePending.value) return
  clearTimeout(contactHideTimer)
  contactHidden.value = true
  sharedPhone.value = ''
  phone.value = ''
  if (!submissionId.value || !contactShareToken.value) return
  try {
    const response = await fetch(apiUrl(`/api/contact/${encodeURIComponent(submissionId.value)}/hide-phone`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareToken: contactShareToken.value }),
    })
    if (response.ok || response.status === 404) {
      hidePending.value = false
      contactShareToken.value = ''
    } else {
      hidePending.value = true
    }
  } catch {
    hidePending.value = true
  }
}

function startNewMessage() {
  clearTimeout(contactHideTimer)
  sent.value = false
  error.value = ''
  confirmation.value = ''
  name.value = ''
  email.value = ''
  phone.value = ''
  residenceCountry.value = 'RW'
  countrySearch.value = ''
  autoHideMs.value = 24 * 60 * 60 * 1000
  contactHidden.value = false
  hidePending.value = false
  contactShareToken.value = ''
  submissionId.value = ''
  phoneExpiresAt.value = ''
  sharedPhone.value = ''
  message.value = ''
}
</script>

<template>
  <section id="contact" class="contact">
    <div class="container contact-inner">
      <div class="contact-info">
        <p class="eyebrow-tag"><span class="dot" aria-hidden="true"></span>Get in touch</p>
        <h2>Talk to us about your next shipment.</h2>
        <p class="lede">
          Whether you're a grower looking to partner with us or a buyer sourcing
          quality chili, reach out directly.
        </p>

        <ul class="details">
          <li>
            <span class="label">Phone</span>
            <a href="tel:0791945206">0791 945 206</a>
            <a href="tel:0795398553">0795 398 553</a>
          </li>
          <li>
            <span class="label">WhatsApp</span>
            <a href="https://wa.me/250795398553" target="_blank" rel="noreferrer">Chat with our team</a>
          </li>
          <li>
            <span class="label">Email</span>
            <a href="mailto:jsagricultureimportexportco@gmail.com">jsagricultureimportexportco@gmail.com</a>
          </li>
          <li>
            <span class="label">Location</span>
            <a href="https://maps.app.goo.gl/CGA9MP4jTpU4HhGEA" target="_blank" rel="noreferrer">Kayonza / Nyamirama, Rwanda</a>
          </li>
          <li>
            <span class="label">Website</span>
            <a href="https://www.jsagricultureltd.com" target="_blank" rel="noreferrer">www.jsagricultureltd.com</a>
          </li>
        </ul>

        <div class="location-map">
          <iframe
            src="https://www.google.com/maps?q=-1.9670162,30.546278&z=17&output=embed"
            title="J.S Agriculture location map"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      <form class="contact-form" @submit.prevent="submit" v-if="!sent">
        <label>
          Name
          <input v-model="name" type="text" name="name" required placeholder="Your name" />
        </label>
        <label>
          Email
          <input v-model="email" type="email" name="email" required placeholder="you@example.com" autocomplete="email" />
        </label>
        <div class="country-field">
          <span class="field-label" id="country-residence-label">Country of residence</span>
          <div class="country-picker" ref="countryPicker">
            <button
              class="country-trigger"
              type="button"
              aria-labelledby="country-residence-label"
              aria-haspopup="listbox"
              :aria-expanded="countryOpen"
              @click="countryOpen ? closeCountryPicker() : openCountryPicker()"
              @keydown="handleCountryKeydown"
            >
              <span>{{ selectedCountry?.flag }} {{ selectedCountry?.name }}</span>
              <strong>{{ selectedCountry?.callingCode }}</strong>
              <span class="country-chevron" aria-hidden="true">{{ countryOpen ? '⌃' : '⌄' }}</span>
            </button>
            <div v-if="countryOpen" class="country-dropdown">
              <input
                ref="countrySearchInput"
                v-model="countrySearch"
                type="search"
                placeholder="Search countries"
                autocomplete="off"
                aria-label="Search countries"
                @keydown="handleCountryKeydown"
              />
              <div class="country-options" role="listbox" aria-label="Countries">
                <button
                  v-for="country in filteredCountries"
                  :key="country.code"
                  class="country-option"
                  :class="{ 'is-selected': country.code === residenceCountry }"
                  type="button"
                  role="option"
                  :aria-selected="country.code === residenceCountry"
                  @click="selectCountry(country)"
                >
                  <span>{{ country.flag }} {{ country.name }}</span>
                  <strong>{{ country.callingCode }}</strong>
                </button>
                <p v-if="!filteredCountries.length" class="country-empty">No countries found.</p>
              </div>
            </div>
          </div>
        </div>
        <label>
          Phone number
          <span class="phone-input">
            <span class="calling-code" aria-label="International calling code">{{ selectedCountry?.callingCode }}</span>
            <input :value="formattedPhone" @input="onPhoneInput" type="tel" name="phone" :placeholder="selectedCountry ? `Number in ${selectedCountry.name}` : 'Your phone number'" autocomplete="tel-national" inputmode="tel" required :aria-invalid="phone && !validPhone" />
          </span>
          <span class="phone-hint" :class="{ 'phone-invalid': phone && !validPhone }" aria-live="polite">
            {{ phone && !validPhone ? 'Enter a valid number for this country.' : `Your number will be shared as ${selectedCountry?.callingCode || ''} plus your local number.` }}
          </span>
        </label>
        <label>
          Hide contact after
          <select v-model.number="autoHideMs" name="autoHideMs" required>
            <option :value="60 * 60 * 1000">1 hour</option>
            <option :value="24 * 60 * 60 * 1000">24 hours</option>
            <option :value="7 * 24 * 60 * 60 * 1000">7 days</option>
            <option :value="30 * 24 * 60 * 60 * 1000">30 days</option>
          </select>
          <span class="phone-hint">Your number is removed from submission history when it expires. You can hide it sooner.</span>
        </label>
        <label>
          Message
          <textarea v-model="message" name="message" rows="5" required placeholder="Tell us about your farm, order or partnership"></textarea>
        </label>
        <button class="btn btn-primary" type="submit" :disabled="sending">
          {{ sending ? 'Sending...' : 'Send message' }}
        </button>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <p v-else class="form-note">Your message will be sent securely to our team.</p>
      </form>

      <div class="contact-confirm" v-else>
        <span class="reply-label">Message sent</span>
        <h3>Thanks for reaching out, {{ name }}.</h3>
        <p>{{ confirmation || 'Your enquiry has been received. Our team will get back to you by phone or email as soon as possible.' }}</p>
        <div class="shared-contact" aria-live="polite">
          <strong>Contact shared</strong>
          <span>{{ selectedCountry?.flag }} {{ selectedCountry?.name }} · {{ selectedCountry?.callingCode }}</span>
          <span class="shared-phone">{{ contactHidden ? 'Contact hidden' : sharedPhone }}</span>
          <span class="phone-hint" v-if="!contactHidden && phoneExpiresAt">Auto-hides {{ new Date(phoneExpiresAt).toLocaleString() }}</span>
          <span class="phone-hint phone-invalid" v-if="hidePending">Hidden on this device; server removal is pending. Reconnect to retry.</span>
        </div>
        <button v-if="!contactHidden" class="btn btn-secondary" type="button" @click="hideContact">Hide contact now</button>
        <button v-if="hidePending" class="btn btn-secondary" type="button" @click="hideContact">Retry hiding contact</button>
        <button class="btn btn-secondary" type="button" @click="startNewMessage">Send another message</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  width: 100%;
  scroll-margin-top: 84px;
  padding: 72px 0;
  background: var(--paper-dim);
  border-top: 1px solid var(--line);
}

.contact-inner {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: clamp(32px, 6vw, 88px);
  align-items: start;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chili);
  display: inline-block;
}

h2 {
  font-size: clamp(1.9rem, 3.2vw, 2.5rem);
  margin: 14px 0 16px;
  color: var(--forest-deep);
  max-width: 18ch;
}

.lede {
  color: var(--ink-soft);
  max-width: 46ch;
  margin-bottom: 34px;
}

.details {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 32px;
}

.details li {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.details a,
.details span:not(.label) {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--forest-deep);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.details a:hover {
  color: var(--chili);
}

.location-map {
  margin-top: 30px;
  aspect-ratio: 16 / 9;
  min-height: 220px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--paper);
}

.location-map iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--leaf);
}

.contact-form {
  width: 100%;
  min-height: 100%;
  background: var(--paper);
  padding: clamp(24px, 4vw, 40px);
  border-radius: 6px;
  border: 1px solid var(--line);
  display: grid;
  gap: 18px;
  align-self: start;
}

.contact-form label {
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-soft);
}

.optional,
.form-note {
  color: var(--ink-soft);
  font-size: 0.78rem;
  font-weight: 400;
}

.form-note {
  margin: -4px 0 0;
}

.form-error {
  margin: -4px 0 0;
  color: var(--chili-deep);
  font-size: 0.85rem;
}

.contact-form button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.contact-form input,
.contact-form select,
.contact-form textarea {
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: #fff;
  color: var(--ink);
  resize: vertical;
}

.phone-input {
  display: grid;
  grid-template-columns: minmax(92px, 0.3fr) minmax(0, 1fr);
  gap: 8px;
}

.calling-code {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: #f8f7f2;
  color: var(--forest-deep);
  font-weight: 700;
  white-space: nowrap;
}

.phone-hint {
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 500;
}

.phone-invalid {
  color: var(--chili-deep);
}

.contact-form select {
  font: inherit;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: #fff;
  color: var(--ink);
  width: 100%;
}

.country-field {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-soft);
}

.country-picker {
  position: relative;
  min-width: 0;
}

.country-trigger {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  padding: 11px 14px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: #fff;
  color: var(--ink);
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.country-trigger > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.country-trigger strong,
.country-option strong {
  color: var(--forest-deep);
  white-space: nowrap;
}

.country-chevron {
  color: var(--ink-soft);
}

.country-trigger:focus-visible,
.country-option:focus-visible {
  outline: 2px solid var(--leaf);
  outline-offset: 2px;
}

.country-dropdown {
  position: absolute;
  z-index: 20;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  display: grid;
  gap: 6px;
  max-height: min(270px, 42vh);
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--paper);
  box-shadow: 0 10px 28px rgb(24 40 30 / 18%);
}

.country-dropdown > input {
  width: 100%;
  padding: 9px 11px;
}

.country-options {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.country-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
}

.country-option:hover,
.country-option.is-selected {
  background: var(--paper-dim);
}

.country-empty {
  margin: 0;
  padding: 10px;
  color: var(--ink-soft);
  font-size: 0.85rem;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: 2px solid var(--leaf);
  outline-offset: 1px;
}

.contact-form button {
  justify-self: start;
}

.contact-form::before {
  content: 'Send an enquiry';
  font-family: var(--font-display);
  font-size: 1.55rem;
  color: var(--forest-deep);
}

.contact-confirm {
  background: var(--paper);
  padding: 32px;
  border-radius: 6px;
  border: 1px solid var(--line);
  align-self: start;
}

.contact-confirm h3 {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--forest-deep);
  margin-bottom: 8px;
}

.contact-confirm p {
  color: var(--ink-soft);
}

.shared-contact {
  display: grid;
  gap: 8px;
  margin: 22px 0 4px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--paper-dim);
  overflow-wrap: anywhere;
}

.shared-contact strong {
  color: var(--forest-deep);
}

.shared-phone {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--forest-deep);
}

.reply-label {
  display: block;
  margin-bottom: 10px;
  color: var(--leaf);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.btn-secondary {
  margin-top: 22px;
  border-color: var(--forest-deep);
  background: transparent;
  color: var(--forest-deep);
}

.btn-secondary:hover {
  background: var(--forest-deep);
  color: #fff9f0;
}

@media (max-width: 820px) {
  .contact-inner {
    grid-template-columns: 1fr;
  }

  .details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .contact {
    padding: 56px 0;
  }

  .details {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}
</style>
