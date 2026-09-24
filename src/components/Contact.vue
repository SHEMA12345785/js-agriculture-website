<script setup>
import { ref } from 'vue'
import { apiUrl } from '../lib/api'

const name = ref('')
const email = ref('')
const phone = ref('')
const residenceCountry = ref('RW')
const otherCountry = ref('')
const callingCode = ref('+250')
const message = ref('')
const sent = ref(false)
const sending = ref(false)
const error = ref('')

const confirmation = ref('')

// Keep the country and calling code together so the number can be reached
// internationally. The "Other" option supports countries not listed here.
const countries = [
  ['AF', 'Afghanistan', '+93'], ['AL', 'Albania', '+355'], ['DZ', 'Algeria', '+213'],
  ['AR', 'Argentina', '+54'], ['AU', 'Australia', '+61'], ['AT', 'Austria', '+43'],
  ['BD', 'Bangladesh', '+880'], ['BE', 'Belgium', '+32'], ['BR', 'Brazil', '+55'],
  ['CA', 'Canada', '+1'], ['CN', 'China', '+86'], ['CO', 'Colombia', '+57'],
  ['CD', 'Congo (DRC)', '+243'], ['DK', 'Denmark', '+45'], ['EG', 'Egypt', '+20'],
  ['ET', 'Ethiopia', '+251'], ['FR', 'France', '+33'], ['DE', 'Germany', '+49'],
  ['GH', 'Ghana', '+233'], ['IN', 'India', '+91'], ['ID', 'Indonesia', '+62'],
  ['IR', 'Iran', '+98'], ['IQ', 'Iraq', '+964'], ['IE', 'Ireland', '+353'],
  ['IL', 'Israel', '+972'], ['IT', 'Italy', '+39'], ['JP', 'Japan', '+81'],
  ['KE', 'Kenya', '+254'], ['MY', 'Malaysia', '+60'], ['MX', 'Mexico', '+52'],
  ['MA', 'Morocco', '+212'], ['MZ', 'Mozambique', '+258'], ['NP', 'Nepal', '+977'],
  ['NL', 'Netherlands', '+31'], ['NZ', 'New Zealand', '+64'], ['NG', 'Nigeria', '+234'],
  ['PK', 'Pakistan', '+92'], ['PH', 'Philippines', '+63'], ['PT', 'Portugal', '+351'],
  ['RW', 'Rwanda', '+250'], ['SA', 'Saudi Arabia', '+966'], ['SG', 'Singapore', '+65'],
  ['ZA', 'South Africa', '+27'], ['KR', 'South Korea', '+82'], ['ES', 'Spain', '+34'],
  ['LK', 'Sri Lanka', '+94'], ['TZ', 'Tanzania', '+255'], ['TH', 'Thailand', '+66'],
  ['TR', 'Türkiye', '+90'], ['UG', 'Uganda', '+256'], ['AE', 'United Arab Emirates', '+971'],
  ['GB', 'United Kingdom', '+44'], ['US', 'United States', '+1'], ['VN', 'Vietnam', '+84'],
]

function updateCountry() {
  const country = countries.find(([code]) => code === residenceCountry.value)
  if (country) callingCode.value = country[2]
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
        country: residenceCountry.value === 'OTHER' ? otherCountry.value.trim() : countries.find(([code]) => code === residenceCountry.value)?.[1],
        phone: phone.value.trim() ? `${callingCode.value.trim()} ${phone.value.trim()}` : '',
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
    sent.value = true
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

function startNewMessage() {
  sent.value = false
  error.value = ''
  confirmation.value = ''
  name.value = ''
  email.value = ''
  phone.value = ''
  residenceCountry.value = 'RW'
  otherCountry.value = ''
  callingCode.value = '+250'
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
        <label>
          Country of residence
          <select v-model="residenceCountry" name="country" required @change="updateCountry">
            <option v-for="country in countries" :key="country[0]" :value="country[0]">{{ country[1] }}</option>
            <option value="OTHER">Other / not listed</option>
          </select>
        </label>
        <label v-if="residenceCountry === 'OTHER'">
          Your country
          <input v-model="otherCountry" type="text" name="otherCountry" required placeholder="Country of residence" />
        </label>
        <label>
          Phone <span class="optional">(optional)</span>
          <span class="phone-input">
            <input v-model="callingCode" type="tel" name="callingCode" aria-label="International calling code" placeholder="+250" />
            <input v-model="phone" type="tel" name="phone" placeholder="Your phone number" autocomplete="tel-national" />
          </span>
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

.contact-form select {
  font: inherit;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: #fff;
  color: var(--ink);
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
