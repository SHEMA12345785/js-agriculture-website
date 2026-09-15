<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const sent = ref(false)

function submit() {
  const subject = encodeURIComponent(`Website enquiry from ${name.value}`)
  const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${email.value}\nPhone: ${phone.value || 'Not provided'}\n\n${message.value}`)
  window.location.href = `mailto:j.sagricultureimportexportco@gmail.com?subject=${subject}&body=${body}`
  sent.value = true
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
            <a href="mailto:j.sagricultureimportexportco@gmail.com">j.sagricultureimportexportco@gmail.com</a>
          </li>
          <li>
            <span class="label">Location</span>
            <a href="https://www.google.com/maps/search/?api=1&query=Kayonza%2C%20Rwanda" target="_blank" rel="noreferrer">Kayonza / Nyamirama, Rwanda</a>
          </li>
          <li>
            <span class="label">Website</span>
            <a href="https://www.jsagriculturaltd.com" target="_blank" rel="noreferrer">www.jsagriculturaltd.com</a>
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
        <label>
          Phone <span class="optional">(optional)</span>
          <input v-model="phone" type="tel" name="phone" placeholder="+250 ..." autocomplete="tel" />
        </label>
        <label>
          Message
          <textarea v-model="message" name="message" rows="5" required placeholder="Tell us about your farm, order or partnership"></textarea>
        </label>
        <button class="btn btn-primary" type="submit">Send message</button>
        <p class="form-note">This opens your email app with the enquiry details ready to send.</p>
      </form>

      <div class="contact-confirm" v-else>
        <h3>Thanks, {{ name }}.</h3>
        <p>We've noted your message and will follow up by phone or email shortly.</p>
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
