<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div>
        <strong>J.S Agriculture Import and Export Company Ltd</strong>
        <p>Better Farmers &rarr; Better Products &rarr; A Brighter Future</p>
        <a class="footer-email" href="mailto:jsagricultureimportexportco@gmail.com">jsagricultureimportexportco@gmail.com</a>
      </div>
      <div class="footer-links">
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#products">Products</a>
        <a href="#process">How We Work</a>
        <a href="#contact">Contact</a>
      </div>
      <nav class="social-links" aria-label="Social media links">
        <a href="https://web.facebook.com/profile.php?id=61594652273831" target="_blank" rel="noreferrer" aria-label="Follow J.S Agriculture on Facebook">
          <svg class="facebook-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 1.7-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.7.3-1 1-1Z" /></svg>
          <span>Facebook</span>
        </a>
        <a href="https://x.com/js64131?s=11" target="_blank" rel="noreferrer" aria-label="Follow J.S Agriculture on X">
          <svg class="x-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2h3.1l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.9h1.73L8.26 3.98H6.4L17.8 19.9Z" /></svg>
          <span>X</span>
        </a>
        <a href="https://www.instagram.com/jsagricultureimportexportcoltd?stkn=Z3hyY3JzODF6a3kw" target="_blank" rel="noreferrer" aria-label="Follow J.S Agriculture on Instagram">
          <svg class="instagram-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle class="social-dot" cx="17.5" cy="6.5" r="1" /></svg>
          <span>Instagram</span>
        </a>
        <a href="https://www.linkedin.com/in/js-agriculture-importexportcoltd-2121b9438" target="_blank" rel="noreferrer" aria-label="Connect with J.S Agriculture on LinkedIn">
          <svg class="linkedin-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5A2.5 2.5 0 1 0 5 3.5a2.5 2.5 0 0 0 0 5ZM3 10h4v11H3V10Zm6 0h4v1.7c.8-1.2 2.1-2.2 4.2-2.2 4 0 4.8 2.6 4.8 6v5.5h-4v-4.9c0-1.2 0-2.8-1.8-2.8s-2.1 1.3-2.1 2.7V21H9V10Z" /></svg>
          <span>LinkedIn</span>
        </a>
      </nav>
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

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  padding-top: 4px;
}

.social-links a {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: rgba(246, 241, 226, 0.85);
  font-size: 0.86rem;
  text-decoration: none;
}

.social-links a:hover {
  color: var(--sun);
}

.social-links svg {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 1.8;
}

.social-links .facebook-icon {
  color: #1877f2;
}

.social-links .x-icon {
  color: #f6f1e2;
}

.social-links .instagram-icon {
  color: #e4405f;
}

.social-links .linkedin-icon {
  color: #0a66c2;
}

.social-links svg rect,
.social-links svg circle {
  fill: none;
}

.social-links svg .social-dot {
  fill: currentColor;
  stroke: none;
}

.copyright {
  width: 100%;
  text-align: left;
  font-size: 0.78rem;
  margin-top: 18px;
  opacity: 0.6;
}
</style>
