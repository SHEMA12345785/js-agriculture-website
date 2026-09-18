<script setup>
import NavBar from './components/NavBar.vue'
import Hero from './components/Hero.vue'
import About from './components/About.vue'
import Services from './components/Services.vue'
import Products from './components/Products.vue'
import Gallery from './components/Gallery.vue'
import Process from './components/Process.vue'
import Contact from './components/Contact.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <NavBar />
  <main id="main-content">
    <Hero />
    <About />
    <Services />
    <Products />
    <Gallery />
    <Process />
    <Contact />
  </main>
  <a class="whatsapp-float" href="https://wa.me/250795398553" target="_blank" rel="noreferrer" aria-label="Chat with J.S Agriculture on WhatsApp">
    <span aria-hidden="true">WA</span>
    <span>WhatsApp us</span>
  </a>
  <Footer />
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 100;
  padding: 9px 14px;
  background: var(--sun);
  color: var(--forest-deep);
  font-weight: 700;
  transform: translateY(-150%);
}

.skip-link:focus {
  transform: translateY(0);
}

.whatsapp-float {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 35;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 11px 15px 11px 11px;
  border-radius: 999px;
  background: #1d8f59;
  color: #fff;
  box-shadow: 0 10px 24px rgba(6, 67, 74, 0.24);
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
}

.whatsapp-float span:first-child {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  font-size: 0.6rem;
}

.whatsapp-float:hover {
  background: #167246;
}

@media (max-width: 560px) {
  .whatsapp-float {
    right: 16px;
    bottom: 16px;
  }
}
</style>
