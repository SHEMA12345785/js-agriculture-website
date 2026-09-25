<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { apiUrl } from '../lib/api'
import { AsYouType, getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js'

const name = ref('')
const email = ref('')
const phone = ref('')
const residenceCountry = ref('RW')
const message = ref('')
const sent = ref(false)
const sending = ref(false)
const error = ref('')
const countrySearch = ref('')
const autoHideMs = ref(24 * 60 * 60 * 1000)
const showCountries = ref(false)
const countryPicker = ref(null)
const countrySearchInput = ref(null)
const contactHidden = ref(false)
const hidePending = ref(false)
const contactShareToken = ref('')
const submissionId = ref('')
const phoneExpiresAt = ref('')
const sharedPhone = ref('')
let contactHideTimer

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const countries = getCountries().map(code => ({
  code,
  name: regionNames.of(code) || code,
  callingCode: `+${getCountryCallingCode(code)}`,
  flag: String.fromCodePoint(...[...code].map(letter => letter.charCodeAt(0) + 127397)),
})).sort((a, b) => a.name.localeCompare(b.name))
const selectedCountry = computed(() => countries.find(country => country.code === residenceCountry.value))
const formattedPhone = computed(() => phone.value ? new AsYouType(residenceCountry.value).input(phone.value) : '')
const validPhone = computed(() => !phone.value || isValidPhoneNumber(phone.value, residenceCountry.value))

const filteredCountries = computed(() => {
  const query = countrySearch.value.trim().toLowerCase()
  if (!query) return countries
  return countries.filter(country =>
    country.name.toLowerCase().includes(query) ||
    country.callingCode.includes(query) ||
    country.code.toLowerCase().includes(query)
  )
})

function selectCountry(country) {
  residenceCountry.value = country.code
  phone.value = formattedPhone.value
  showCountries.value = false
  countrySearch.value = ''
}

function countryFlag(code) {
  return code.toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()))
}

function openCountryPicker() {
  showCountries.value = true
  countrySearch.value = ''
  nextTick(() => countrySearchInput.value?.focus())
}

function closeCountryPicker() {
  showCountries.value = false
  countrySearch.value = ''
}

function handleCountryOutsideClick(event) {
  if (showCountries.value && !countryPicker.value?.contains(event.target)) closeCountryPicker()
}

function handleCountryKeydown(event) {
  if (event.key === 'Escape') closeCountryPicker()
}

function onPhoneInput(event) {
  phone.value = new AsYouType(residenceCountry.value).input(event.target.value)
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim())
}

onMounted(() => document.addEventListener('pointerdown', handleCountryOutsideClick))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleCountryOutsideClick)
  clearTimeout(contactHideTimer)
})

async function submit() {
  error.value = ''

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
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(apiUrl('/api/contact'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim(),
        phone: parsePhoneNumberFromString(phone.value, residenceCountry.value)?.formatInternational() || phone.value.trim(),
        country: `${selectedCountry.value.flag} ${selectedCountry.value.name}`,
        countryCode: residenceCountry.value,
        message: message.value.trim(),
        autoHideMs: autoHideMs.value,
      }),
      signal: controller.signal,
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) throw new Error(payload?.message || 'The message could not be sent.')

    contactShareToken.value = payload?.shareToken || ''
    submissionId.value = payload?.submissionId || ''
    phoneExpiresAt.value = payload?.phoneExpiresAt || new Date(Date.now() + autoHideMs.value).toISOString()
    sharedPhone.value = parsePhoneNumberFromString(phone.value, residenceCountry.value)?.formatInternational() || phone.value
    contactHidden.value = false
    hidePending.value = false
    sent.value = true
    clearTimeout(contactHideTimer)
    contactHideTimer = setTimeout(hideContact, Math.max(0, Date.parse(phoneExpiresAt.value) - Date.now()))
  } catch (requestError) {
    error.value = requestError.name === 'AbortError'
      ? 'The request timed out. Please check your connection and try again.'
      : requestError.message || 'We could not send your message. Please try again.'
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
  name.value = ''
  email.value = ''
  phone.value = ''
  residenceCountry.value = 'RW'
  autoHideMs.value = 24 * 60 * 60 * 1000
  contactHidden.value = false
  hidePending.value = false
  contactShareToken.value = ''
  submissionId.value = ''
  phoneExpiresAt.value = ''
  sharedPhone.value = ''
  countrySearch.value = ''
  showCountries.value = false
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
            <a href="https://wa.me/250791945206" target="_blank" rel="noreferrer">Chat with our team</a>
          </li>
          <li>
            <span class="label">Email</span>
            <a href="mailto:jsagricultureimportexportco@gmail.com">jsagricultureimportexportco@gmail.com</a>
          </li>
          <li>
            <span class="label">Location</span>
            <a href="https://www.google.com/maps/search/?api=1&query=Kayonza%2C%20Rwanda" target="_blank" rel="noreferrer">Kayonza / Nyamirama, Rwanda</a>
          </li>
          <li>
            <span class="label">Website</span>
            <a href="https://www.jsagricultureltd.com" target="_blank" rel="noreferrer">www.jsagricultureltd.com</a>
          </li>
        </ul>
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
        <label class="phone-field">
          Phone number
          <div class="phone-control">
            <div class="country-picker" ref="countryPicker">
              <button
                class="country-trigger"
                type="button"
                :aria-expanded="showCountries"
                aria-haspopup="listbox"
                :aria-label="`Country of residence: ${selectedCountry.name}, ${selectedCountry.callingCode}`"
                @click="showCountries ? closeCountryPicker() : openCountryPicker()"
                @keydown="handleCountryKeydown"
              >
                <span class="flag">{{ countryFlag(selectedCountry.code) }}</span>
                <span class="country-name-selected">{{ selectedCountry.name }}</span>
                <span class="country-code">{{ selectedCountry.callingCode }}</span>
                <span class="chevron" aria-hidden="true">⌄</span>
              </button>

              <div v-if="showCountries" class="country-menu">
                <input
                  ref="countrySearchInput"
                  v-model="countrySearch"
                  class="country-search"
                  type="search"
                  placeholder="Search country..."
                  autocomplete="off"
                  aria-label="Search countries"
                  @keydown="handleCountryKeydown"
                />
                <div class="country-list" role="listbox" aria-label="Countries">
                  <button
                    v-for="country in filteredCountries"
                    :key="country.code + country.name"
                    class="country-option"
                    type="button"
                    role="option"
                    :aria-selected="country.code === residenceCountry"
                    @click="selectCountry(country)"
                  >
                    <span class="flag">{{ country.flag }}</span>
                    <span class="country-name">{{ country.name }}</span>
                    <span class="country-option-code">{{ country.callingCode }}</span>
                  </button>
                  <p v-if="!filteredCountries.length" class="no-country">No country found.</p>
                </div>
              </div>
            </div>
            <input
              :value="formattedPhone"
              @input="onPhoneInput"
              type="tel"
              name="phone"
              :placeholder="`Number in ${selectedCountry.name}`"
              autocomplete="tel-national"
              inputmode="tel"
              required
              :aria-invalid="phone && !validPhone"
            />
          </div>
          <span class="country-hint" :class="{ 'phone-invalid': phone && !validPhone }" aria-live="polite">
            {{ phone && !validPhone ? `Enter a valid ${selectedCountry.name} phone number.` : `Country of residence: ${selectedCountry.name} (${selectedCountry.callingCode})` }}
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
          <span class="country-hint">Your contact is removed from the saved enquiry when it expires. You can hide it sooner.</span>
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
        <p>{{ confirmation || 'Your enquiry has been received. Our team will get back to you soon.' }}</p>
        <div class="shared-contact" aria-live="polite">
          <strong>Contact shared</strong>
          <span>{{ selectedCountry.flag }} {{ selectedCountry.name }} · {{ selectedCountry.callingCode }}</span>
          <span class="shared-phone">{{ contactHidden ? 'Contact hidden' : sharedPhone }}</span>
          <span class="country-hint" v-if="!contactHidden && phoneExpiresAt">Auto-hides {{ new Date(phoneExpiresAt).toLocaleString() }}</span>
          <span class="country-hint phone-invalid" v-if="hidePending">Hidden here; server removal is pending. Reconnect to retry.</span>
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

.contact-form input:focus,
.contact-form textarea:focus {
  outline: 2px solid var(--leaf);
  outline-offset: 1px;
}

.phone-control {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  align-items: stretch;
}

.country-picker {
  position: relative;
}

.country-trigger {
  height: 46px;
  min-width: 170px;
  max-width: 230px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: #fff;
  color: var(--forest-deep);
  font: 600 0.92rem var(--font-body);
  cursor: pointer;
}

.country-trigger:hover {
  border-color: var(--leaf);
}

.flag {
  font-size: 1.05rem;
  line-height: 1;
}

.country-code {
  white-space: nowrap;
}

.country-name-selected {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  font-size: 1rem;
  line-height: 1;
  transform: translateY(-2px);
}

.country-menu {
  position: absolute;
  z-index: 50;
  top: calc(100% + 6px);
  left: 0;
  width: min(300px, 78vw);
  padding: 8px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.country-search {
  width: 100%;
  height: 38px;
  padding: 8px 10px;
  margin-bottom: 6px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: #fff;
  font: 0.9rem var(--font-body);
}

.country-search:focus {
  outline: 2px solid var(--leaf);
  outline-offset: 0;
}

.country-list {
  max-height: 220px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.country-option {
  width: 100%;
  min-height: 36px;
  padding: 7px 8px;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  gap: 7px;
  align-items: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--ink);
  text-align: left;
  font: 0.88rem var(--font-body);
  cursor: pointer;
}

.country-option:hover {
  background: var(--paper-dim);
}

.country-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.country-option-code {
  color: var(--ink-soft);
  font-size: 0.82rem;
  white-space: nowrap;
}

.country-hint {
  margin-top: 4px;
  color: var(--ink-soft);
  font-size: 0.72rem;
  font-weight: 400;
}

.phone-invalid {
  color: var(--chili-deep);
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

.shared-contact strong,
.shared-phone {
  color: var(--forest-deep);
}

.shared-phone {
  font-family: var(--font-display);
  font-size: 1.2rem;
}

.no-country {
  padding: 12px 8px;
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.82rem;
}

@media (max-width: 560px) {
  .phone-control {
    grid-template-columns: 1fr;
  }

  .country-trigger {
    width: 100%;
    max-width: none;
    justify-content: flex-start;
  }

  .country-menu {
    width: 100%;
  }
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
