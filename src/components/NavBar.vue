<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const open = ref(false)
const activeSection = ref('top')
const links = [
  { href: '#top', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#products', label: 'Products' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#process', label: 'How We Work' },
  { href: '#contact', label: 'Contact' },
]

function close() {
  open.value = false
}

function updateActiveSection() {
  const sections = links
    .map(({ href }) => document.querySelector(href))
    .filter(Boolean)
  const current = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= 100)
  activeSection.value = current?.id || 'top'
}

function handleKeydown(event) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  updateActiveSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <header class="nav">
    <div class="container nav-inner">
      <a href="#top" class="brand" @click="close">
        <img class="brand-logo" src="/LOGO.png" alt="J.S Agriculture logo" />
        <span class="brand-text">
          <strong>J.S Agriculture</strong>
          <em>Import &amp; Export Co. Ltd</em>
        </span>
      </a>

      <nav id="primary-navigation" class="nav-links" :class="{ open }" aria-label="Primary navigation">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          :class="{ active: activeSection === l.href.slice(1) }"
          :aria-current="activeSection === l.href.slice(1) ? 'location' : undefined"
          @click="close"
        >{{ l.label }}</a>
        <a href="tel:+250791945206" class="nav-phone" @click="close">Call us</a>
      </nav>

      <button
        class="nav-toggle"
        type="button"
        @click="open = !open"
        :aria-expanded="open"
        aria-controls="primary-navigation"
        aria-label="Toggle navigation menu"
      >
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  text-decoration: none;
  color: var(--forest-deep);
}

.brand-logo {
  width: 58px;
  height: 58px;
  object-fit: contain;
  flex: 0 0 auto;
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.15;
}

.brand-text strong {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.brand-text em {
  font-style: normal;
  font-size: 0.72rem;
  color: var(--ink-soft);
  letter-spacing: 0.02em;
}

.nav-links {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 28px;
  font-weight: 600;
  font-size: 0.95rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--ink);
  padding: 4px 2px;
  border-bottom: 2px solid transparent;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.nav-links a:hover {
  color: var(--forest-deep);
  border-color: var(--chili);
}

.nav-links a.active {
  color: var(--forest-deep);
  border-color: var(--chili);
}

.nav-links a:focus-visible,
.brand:focus-visible,
.nav-toggle:focus-visible {
  outline: 3px solid var(--sun);
  outline-offset: 4px;
}

.nav-phone {
  background: var(--chili);
  color: #fff9f0 !important;
  padding: 8px 16px;
  border-radius: 3px;
  border-bottom: none !important;
}

.nav-phone:hover {
  background: var(--forest-deep);
  border-color: transparent !important;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 6px;
}

.nav-toggle span {
  width: 24px;
  height: 2px;
  background: var(--forest-deep);
}

@media (max-width: 820px) {
  .nav-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--paper);
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 10px 20px 20px;
    border-bottom: 1px solid var(--line);
    box-shadow: 0 14px 24px rgba(6, 67, 74, 0.1);
    display: none;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links a {
    width: 100%;
    padding: 10px 0;
  }

  .nav-phone {
    margin-top: 6px;
    text-align: center;
  }
}

@media (max-width: 980px) and (min-width: 821px) {
  .nav-inner {
    gap: 18px;
  }

  .nav-links {
    gap: 16px;
    font-size: 0.88rem;
  }
}

@media (max-width: 480px) {
  .brand-logo {
    width: 60px;
    height: 60px;
  }

  .brand-text strong {
    font-size: 1rem;
  }

  .brand-text em {
    font-size: 0.64rem;
  }
}
</style>
