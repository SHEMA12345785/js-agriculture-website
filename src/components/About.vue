<template>
  <section id="about" class="about">
    <div class="container about-inner">
      <div class="about-copy">
        <p class="eyebrow-tag"><span class="dot" aria-hidden="true"></span>About us</p>
        <h2>Rooted with farmers. Ready for the world.</h2>
        <p>
          J.S Agriculture Import and Export Company Ltd — known through our
          brand mark, Dongfangxiaolaotou (东方小老头) — works directly with
          growers in the Kayonza and Nyamirama area to build a dependable chili
          supply chain. We combine hands-on farmer support with the logistics
          and trade experience needed to move quality produce into global
          markets.
        </p>
        <p>
          Our approach starts in the field: training growers, purchasing their
          harvest at fair terms, and processing produce to export standard —
          then handling the international trade that gets it there.
        </p>
        <ul class="pillars">
          <li>
            <strong>Quality produce</strong>
            <span>Consistent grading and post-harvest handling</span>
          </li>
          <li>
            <strong>Global markets</strong>
            <span>Export relationships across international trade routes</span>
          </li>
          <li>
            <strong>Sustainable future</strong>
            <span>Cooperative farming that reinvests in growers</span>
          </li>
        </ul>
      </div>

      <div class="about-panel">
        <img class="about-image" src="/about-farmer-partnership.jpg" alt="Cooperative farmers planting chili seedlings together with J.S Agriculture field staff" />
        <div class="about-image-caption">
          <span>Farmer partnership</span>
          <strong>Working side by side, season after season.</strong>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  padding: 88px 0;
  background: var(--paper-dim);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.about-inner {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
  align-items: start;
}

h2 {
  font-size: clamp(2rem, 3.6vw, 2.8rem);
  margin: 14px 0 24px;
  color: var(--forest-deep);
  max-width: 16ch;
}

.about-copy p {
  color: var(--ink-soft);
  margin-bottom: 16px;
  max-width: 62ch;
}

.pillars {
  list-style: none;
  margin: 30px 0 0;
  padding: 0;
  display: grid;
  gap: 16px;
}

.pillars li {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  background: var(--paper);
  border-left: 3px solid var(--leaf);
  border-radius: 2px;
}

.pillars strong {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  color: var(--forest-deep);
  min-width: 150px;
}

.pillars span {
  color: var(--ink-soft);
  font-size: 0.92rem;
}

.about-panel {
  position: sticky;
  top: 100px;
}

.about-image {
  width: 100%;
  height: 420px;
  border-radius: 16px;
  object-fit: cover;
  object-position: center;
}

.about-image-caption {
  display: grid;
  gap: 5px;
  margin-top: -75px;
  position: relative;
  min-height: 75px;
  padding: 14px 18px;
  background: rgba(6, 67, 74, 0.94);
  border-radius: 0 0 16px 16px;
  color: #fff9f0;
}

.about-image-caption span {
  color: var(--sun);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.about-image-caption strong {
  font-family: var(--font-display);
  font-size: 1.2rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chili);
  display: inline-block;
}

@media (max-width: 900px) {
  .about-inner {
    grid-template-columns: 1fr;
  }

  .about-panel {
    position: static;
    max-width: 360px;
  }

  .pillars li {
    flex-direction: column;
  }
}
</style>
