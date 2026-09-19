<script setup>
const services = [
  {
    title: 'Farmer partnership & cooperative',
    text: 'Long-term partnerships with local growers built on fair terms and shared planning.',
  },
  {
    title: 'Farmer training & support',
    text: 'Hands-on guidance in planting, pest management and post-harvest handling.',
  },
  {
    title: 'Chili production',
    text: 'Coordinated cultivation across partner farms to a consistent quality standard.',
  },
  {
    title: 'Chili purchasing & collection',
    text: 'Scheduled buying and collection from farms, paid directly to growers.',
  },
  {
    title: 'Agricultural management',
    text: 'Planning and oversight across the growing season, from input supply to harvest.',
  },
  {
    title: 'Agricultural processing',
    text: 'Sorting, drying and grading produce to meet export specifications.',
  },
  {
    title: 'Export & international trade',
    text: 'Documentation, logistics and buyer relationships for cross-border shipment.',
  },
  {
    title: 'Agricultural product trading',
    text: 'Trading beyond chili, connecting Rwandan produce to wider markets.',
  },
]
</script>

<template>
  <section id="services" class="services">
    <div class="container">
      <div class="services-head">
        <p class="eyebrow-tag"><span class="dot" aria-hidden="true"></span>Our services</p>
        <h2>Everything between the field and the port.</h2>
      </div>

      <div class="grid">
        <article v-for="(s, i) in services" :key="s.title" class="card">
          <span class="mark">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.services {
  padding: 96px 0;
  background: var(--paper);
}

.services .container {
  max-width: 1080px;
}

.services-head {
  max-width: 46ch;
  margin-bottom: 48px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chili);
  display: inline-block;
}

h2 {
  font-size: clamp(2rem, 3.6vw, 2.8rem);
  margin-top: 14px;
  color: var(--forest-deep);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
}

.card {
  background: var(--paper);
  min-width: 0;
  padding: 26px 22px;
  transition: background 0.15s ease;
}

.card:hover {
  background: var(--paper-dim);
}

.mark {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--leaf);
  display: block;
}

.card h3 {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 1.05rem;
  margin: 14px 0 8px;
  color: var(--forest-deep);
  line-height: 1.25;
}

.card p {
  color: var(--ink-soft);
  font-size: 0.9rem;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
