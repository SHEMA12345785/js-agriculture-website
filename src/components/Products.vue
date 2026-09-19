<script setup>
const products = [
  {
    number: '01',
    title: 'Fresh chili',
    text: 'Carefully collected from partner farms for buyers looking for vibrant, traceable produce.',
    className: 'fresh',
    image: '/fresh-chili-bush.jpg',
  },
  {
    number: '02',
    title: 'Dried chili',
    text: 'Sorted and dried with attention to consistency, quality and export-ready handling.',
    className: 'dried',
    image: '/dried-chili-drying.jpg',
  },
  {
    number: '03',
    title: 'Agricultural products',
    text: 'A growing range of Rwandan agricultural products connected to dependable trade partners.',
    className: 'produce',
    image: '/agricultural-products.jpeg',
  },
]
</script>

<template>
  <section id="products" class="products">
    <div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow-tag"><span class="dot" aria-hidden="true"></span>What we trade</p>
          <h2>Produce with a clear path to market.</h2>
        </div>
        <p class="section-intro">We bring together farmers, quality handling and international buyers to move good produce further.</p>
      </div>

      <div class="product-grid">
        <article v-for="product in products" :key="product.title" class="product-card">
          <div class="product-art" :class="product.className">
            <span class="product-number">{{ product.number }}</span>
            <img v-if="product.image" :src="product.image" :alt="`${product.title} handled by the J.S Agriculture team`" class="product-image" />
            <template v-else>
              <span class="sun-disc"></span>
              <span class="chili-shape chili-one"></span>
              <span class="chili-shape chili-two"></span>
              <span class="leaf-shape"></span>
            </template>
          </div>
          <div class="product-copy">
            <h3>{{ product.title }}</h3>
            <p>{{ product.text }}</p>
            <a href="#contact">Enquire about supply <span aria-hidden="true">&rarr;</span></a>
          </div>
        </article>
      </div>

      <div class="product-band">
        <div>
          <span class="band-label">Our promise</span>
          <strong>Quality Produce <span aria-hidden="true">•</span> Global Markets <span aria-hidden="true">•</span> Sustainable Future</strong>
        </div>
        <a class="btn btn-light" href="#contact">Start a conversation <span aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.products {
  padding: 96px 0;
  background: var(--paper-dim);
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  align-items: end;
  margin-bottom: 44px;
}

h2 {
  font-size: clamp(2rem, 3.6vw, 2.8rem);
  margin-top: 14px;
  max-width: 15ch;
}

.section-intro {
  max-width: 32ch;
  color: var(--ink-soft);
  font-size: 1.05rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chili);
  display: inline-block;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.product-card {
  background: var(--paper);
  border: 1px solid var(--line);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 30px rgba(6, 67, 74, 0.12);
}

.product-art {
  height: 220px;
  position: relative;
  overflow: hidden;
  background: var(--forest-deep);
}

.product-art::after {
  content: '';
  position: absolute;
  inset: auto -10% -44% -10%;
  height: 62%;
  background: var(--forest);
  border-radius: 50% 50% 0 0;
  transform: rotate(-5deg);
}

.product-art.fresh::after {
  display: none;
}

.product-art:has(.product-image)::after {
  display: none;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 56%;
}

.product-art.dried {
  background: var(--chili-deep);
}

.product-art.dried::after {
  background: var(--chili);
}

.product-art.produce {
  background: var(--sun);
}

.product-art.produce::after {
  background: var(--leaf);
}

.product-number {
  position: absolute;
  top: 20px;
  left: 22px;
  color: rgba(255, 249, 240, 0.8);
  font-family: var(--font-display);
  font-size: 1.6rem;
  z-index: 2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.sun-disc {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  position: absolute;
  top: 34px;
  right: 34px;
  background: #f8cf5a;
  opacity: 0.95;
}

.chili-shape {
  position: absolute;
  z-index: 2;
  width: 26px;
  height: 116px;
  border-radius: 80% 20% 80% 30%;
  background: var(--chili);
  transform: rotate(36deg);
  left: 38%;
  top: 82px;
}

.chili-two {
  left: 52%;
  top: 72px;
  transform: rotate(58deg) scale(0.78);
  background: #ecb23b;
}

.leaf-shape {
  position: absolute;
  z-index: 3;
  width: 64px;
  height: 24px;
  border-radius: 100% 0 100% 0;
  background: var(--leaf-light);
  left: 45%;
  top: 72px;
  transform: rotate(-24deg);
}

.product-art.dried .chili-shape {
  background: #f4c04c;
}

.product-art.produce .chili-shape {
  background: var(--forest-deep);
}

.product-art.produce .chili-two {
  background: var(--leaf-light);
}

.product-copy {
  padding: 24px 24px 26px;
}

.product-copy h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--forest-deep);
}

.product-copy p {
  color: var(--ink-soft);
  font-size: 0.94rem;
  margin: 10px 0 18px;
}

.product-copy a {
  color: var(--chili);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.product-copy a span {
  display: inline-block;
  margin-left: 5px;
  transition: transform 0.15s ease;
}

.product-copy a:hover span {
  transform: translateX(4px);
}

.product-band {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  padding: 28px 30px;
  position: relative;
  isolation: isolate;
  background: var(--forest-deep);
  color: #fff9f0;
  overflow: hidden;
}

.product-band::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: url('/products-band-bg.jpg');
  background-size: cover;
  background-position: center 30%;
  opacity: 0.28;
}

.product-band::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgba(6, 67, 74, 0.96) 0%, rgba(6, 67, 74, 0.75) 100%);
}

.band-label {
  display: block;
  margin-bottom: 8px;
  color: var(--sun);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-band strong {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
  letter-spacing: 0.01em;
}

.product-band strong span {
  color: var(--sun);
  padding: 0 4px;
}

.btn-light {
  background: #fff9f0;
  color: var(--forest-deep);
  white-space: nowrap;
}

.btn-light:hover {
  background: var(--sun);
}

@media (max-width: 820px) {
  .section-heading {
    display: block;
  }

  .section-intro {
    margin-top: 18px;
  }

  .product-grid {
    grid-template-columns: 1fr;
    max-width: 520px;
  }
}

@media (max-width: 560px) {
  .product-band {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
