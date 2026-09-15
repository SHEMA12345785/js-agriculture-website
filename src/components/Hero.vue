<template>
  <section id="top" class="hero">
    <div class="container hero-inner">
      <div class="hero-copy">
        <p class="eyebrow-tag">
          <span class="dot" aria-hidden="true"></span>
          Kayonza / Nyamirama, Rwanda <span class="hero-site">www.jsagriculturaltd.com</span>
        </p>
        <h1>
          Better farmers.<br />
          Better products.<br />
          <span class="accent">A brighter future.</span>
        </h1>
        <p class="lede">
          J.S Agriculture Import and Export Company Ltd connects local farmers in Rwanda
          with dependable agricultural processing and international trade. We grow,
          collect and prepare chili and other products for markets beyond the farm.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#services">Explore our services <span aria-hidden="true">&rarr;</span></a>
          <a class="btn btn-outline" href="#contact">Contact us</a>
        </div>
        <div class="hero-stats">
          <div>
            <strong>8</strong>
            <span>core services, farm to export</span>
          </div>
          <div>
            <strong>2</strong>
            <span>direct phone lines for orders</span>
          </div>
          <div>
            <strong>1</strong>
            <span>home base in Eastern Rwanda</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: clamp(340px, 25vh, 380px);
  display: flex;
  align-items: center;
  background: var(--forest-deep);
  padding: 34px 0 38px;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: url('/Hero wallpaper.png');
  background-position: center center;
  background-size: cover;
  opacity: 1;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.42) 54%, rgba(0, 0, 0, 0.18) 100%);
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 32px;
  padding-right: 32px;
}

.hero-copy {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
  column-gap: clamp(28px, 5vw, 72px);
  align-items: center;
}

.eyebrow-tag {
  grid-column: 1 / -1;
  margin-bottom: 10px;
  color: #fff9f0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chili);
  display: inline-block;
}

.hero-site {
  color: rgba(255, 249, 240, 0.8);
  font-size: 0.78rem;
  letter-spacing: 0.03em;
  margin-left: 8px;
}

h1 {
  grid-column: 1;
  grid-row: 2 / span 2;
  font-size: clamp(2.15rem, 4.2vw, 3.35rem);
  color: #fff9f0;
}

.accent {
  color: var(--chili);
}

.lede {
  grid-column: 2;
  grid-row: 2;
  margin-top: 12px;
  max-width: 46ch;
  color: rgba(255, 249, 240, 0.92);
  font-size: 0.98rem;
}

.hero-actions {
  grid-column: 2;
  grid-row: 3;
  display: flex;
  gap: 16px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.btn-outline {
  background: transparent;
  border-color: rgba(255, 249, 240, 0.78);
  color: #fff9f0;
}

.btn-outline:hover {
  background: #fff9f0;
  color: var(--forest-deep);
}

.hero-actions .btn span {
  transition: transform 0.15s ease;
}

.hero-actions .btn:hover span {
  transform: translateX(4px);
}

.hero-stats {
  grid-column: 1 / -1;
  grid-row: 4;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 760px;
  gap: 0;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 249, 240, 0.42);
  flex-wrap: wrap;
}

.hero-stats strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--chili);
  line-height: 1;
}

.hero-stats > div {
  min-width: 0;
  padding-right: 24px;
}

.hero-stats > div + div {
  padding-left: 24px;
  border-left: 1px solid rgba(255, 249, 240, 0.25);
}

.hero-stats span {
  display: block;
  margin-top: 6px;
  max-width: 16ch;
  font-size: 0.85rem;
  color: rgba(255, 249, 240, 0.82);
}

@media (max-width: 900px) {
  .hero {
    min-height: 336px;
  }

  .hero-inner {
    grid-template-columns: 1fr;
  }

  .hero-copy {
    display: block;
  }

  .hero-stats {
    display: flex;
    gap: 24px;
  }

  .hero-stats > div,
  .hero-stats > div + div {
    padding-left: 0;
    padding-right: 0;
    border-left: 0;
  }
}

@media (max-width: 560px) {
  .hero {
    min-height: 408px;
    padding: 64px 0 76px;
  }

}
</style>
