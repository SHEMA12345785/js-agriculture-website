<script setup>
const steps = [
  { title: 'Partner', text: 'We onboard growers into the cooperative and agree on planting plans.' },
  { title: 'Train', text: 'Field teams support farmers through planting, care and harvest timing.' },
  { title: 'Grow', text: 'Chili is cultivated across partner farms to a shared quality standard.' },
  { title: 'Collect', text: 'Harvest is purchased and collected on a set schedule, paid to farmers directly.' },
  { title: 'Process', text: 'Produce is sorted, dried and graded to meet export specifications.' },
  { title: 'Export', text: 'Shipments move through international trade to buyers abroad.' },
]
</script>

<template>
  <section id="process" class="process">
    <div class="container">
      <p class="eyebrow-tag light"><span class="dot" aria-hidden="true"></span>How we work</p>
      <h2>From farm to port, with care at every step.</h2>

      <ol class="steps">
        <li v-for="(s, i) in steps" :key="s.title">
          <span class="num">{{ i + 1 }}</span>
          <div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.process {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--forest-deep);
  color: #f6f1e2;
  padding: 96px 0;
}

.process::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: url('/process-bg-drying.jpg');
  background-size: cover;
  background-position: center 25%;
  opacity: 0.16;
}

.process::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(180deg, rgba(6, 67, 74, 0.92) 0%, rgba(6, 67, 74, 0.97) 100%);
}

.eyebrow-tag.light {
  color: var(--sun);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sun);
  display: inline-block;
}

h2 {
  color: #f6f1e2;
  font-size: clamp(2rem, 3.6vw, 2.8rem);
  margin: 14px 0 46px;
  max-width: 20ch;
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 36px 40px;
}

.steps li {
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(246, 241, 226, 0.2);
}

.num {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--leaf-light);
  min-width: 32px;
}

.steps h3 {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 1.05rem;
  color: #f6f1e2;
  margin: 0 0 6px;
}

.steps p {
  color: rgba(246, 241, 226, 0.75);
  font-size: 0.9rem;
}

@media (max-width: 900px) {
  .steps {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .steps {
    grid-template-columns: 1fr;
  }
}
</style>
