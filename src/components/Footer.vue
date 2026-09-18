<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div>
        <strong>J.S Agriculture Import and Export Company Ltd</strong>
        <p>Better Farmers &rarr; Better Products &rarr; A Brighter Future</p>
        <a class="footer-email" href="mailto:jsagricultureltd.co@gmail.com">jsagricultureltd.co@gmail.com</a>
      </div>
      <div class="footer-links">
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#products">Products</a>
        <a href="#process">How We Work</a>
        <a href="#contact">Contact</a>
      </div>
      <p class="copyright">&copy; {{ year }} J.S Agriculture Import and Export Co. Ltd. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--forest-deep);
  color: rgba(246, 241, 226, 0.75);
  padding: 44px 0 30px;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid rgba(246, 241, 226, 0.15);
  padding-bottom: 26px;
}

.footer-inner strong {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: #f6f1e2;
  display: block;
}

.footer-inner p {
  margin-top: 4px;
  font-size: 0.88rem;
}

.footer-email {
  display: inline-block;
  margin-top: 10px;
  color: var(--sun);
  font-size: 0.86rem;
  text-decoration: none;
}

.footer-links {
  display: flex;
  gap: 22px;
  font-size: 0.9rem;
}

.footer-links a {
  text-decoration: none;
  color: rgba(246, 241, 226, 0.85);
}

.footer-links a:hover {
  color: var(--sun);
}

.copyright {
  width: 100%;
  text-align: left;
  font-size: 0.78rem;
  margin-top: 18px;
  opacity: 0.6;
}
</style>
