<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const photos = [
  {
    src: '/gallery/partnership-handshake.jpg',
    alt: 'J.S Agriculture team sealing a new farmer partnership beside a tractor',
    caption: 'Sealing new partnerships with growers',
  },
  {
    src: '/gallery/cooperative-planting.jpg',
    alt: 'Cooperative members planting chili seedlings along drip irrigation lines',
    caption: 'Cooperative planting day in Nyamirama',
  },
  {
    src: '/gallery/mechanized-ploughing.jpg',
    alt: 'Disc plough tractor preparing farmland for the planting season',
    caption: 'Mechanised land preparation ahead of planting',
  },
  {
    src: '/gallery/farmer-training.jpg',
    alt: 'Farmers seated for a pre-season training session',
    caption: 'Pre-season training for partner farmers',
  },
  {
    src: '/gallery/field-monitoring.jpg',
    alt: 'Field officer recording crop data on a tablet in a chili field',
    caption: 'Field monitoring and harvest record-keeping',
  },
  {
    src: '/gallery/chili-drying-yard.jpg',
    alt: 'Wide chili drying yard at peak harvest season',
    caption: 'Drying yards at peak harvest',
  },
  {
    src: '/gallery/cooperative-meeting.jpg',
    alt: 'Grower families gathered for a cooperative meeting under the J.S Agriculture banner',
    caption: 'Cooperative meetings with grower families',
  },
  {
    src: '/gallery/community-launch-day.jpg',
    alt: 'J.S Agriculture field team and local community on a project launch day',
    caption: 'Community launch day with our field team',
  },
]

const selectedPhoto = ref(null)

function openPhoto(photo) {
  selectedPhoto.value = photo
  document.body.classList.add('modal-open')
}

function closePhoto() {
  selectedPhoto.value = null
  document.body.classList.remove('modal-open')
}

function handleKeydown(event) {
  if (event.key === 'Escape' && selectedPhoto.value) closePhoto()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('modal-open')
})
</script>

<template>
  <section id="gallery" class="gallery">
    <div class="container">
      <div class="gallery-head">
        <p class="eyebrow-tag"><span class="dot" aria-hidden="true"></span>In the field</p>
        <h2>Real farms. Real partnerships. Real produce.</h2>
        <p class="gallery-intro">
          A look at the day-to-day work behind every shipment — from planting with
          cooperative families to drying yards at peak harvest.
        </p>
      </div>

      <div class="gallery-grid">
        <figure v-for="p in photos" :key="p.src" class="gallery-item">
          <img :src="p.src" :alt="p.alt" loading="lazy" />
          <figcaption>{{ p.caption }}</figcaption>
          <button class="gallery-open" type="button" :aria-label="`View ${p.caption}`" @click="openPhoto(p)">
            <span aria-hidden="true">+</span>
          </button>
        </figure>
      </div>
    </div>

    <div v-if="selectedPhoto" class="lightbox" role="dialog" aria-modal="true" :aria-label="selectedPhoto.caption" @click.self="closePhoto">
      <div class="lightbox-content">
        <button class="lightbox-close" type="button" aria-label="Close image viewer" @click="closePhoto">&times;</button>
        <img :src="selectedPhoto.src" :alt="selectedPhoto.alt" />
        <p>{{ selectedPhoto.caption }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery {
  padding: 72px 0;
  background: var(--paper);
}

.gallery-head {
  max-width: 56ch;
  margin-bottom: 44px;
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
  margin: 14px 0 16px;
  color: var(--forest-deep);
  max-width: 20ch;
}

.gallery-intro {
  color: var(--ink-soft);
  font-size: 1.05rem;
  max-width: 52ch;
}

.gallery-grid {
  column-count: 4;
  column-gap: 18px;
}

.gallery-item {
  margin: 0;
  margin-bottom: 18px;
  position: relative;
  display: block;
  break-inside: avoid;
  overflow: hidden;
  border-radius: 8px;
  background: var(--forest-deep);
  aspect-ratio: 4 / 3;
}

.gallery-item:nth-child(4n + 1),
.gallery-item:nth-child(4n + 4) {
  aspect-ratio: 3 / 4;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.35s ease;
}

.gallery-item:hover img {
  transform: scale(1.06);
}

.gallery-item figcaption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 14px 10px;
  background: linear-gradient(0deg, rgba(6, 67, 74, 0.92) 0%, rgba(6, 67, 74, 0) 100%);
  color: #fff9f0;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.3;
}

.gallery-open {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 249, 240, 0.7);
  border-radius: 50%;
  background: rgba(6, 67, 74, 0.72);
  color: #fff9f0;
  font-size: 1.5rem;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.gallery-item:hover .gallery-open,
.gallery-open:focus-visible {
  opacity: 1;
}

.gallery-open:hover {
  background: var(--chili);
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(6, 67, 74, 0.9);
}

.lightbox-content {
  position: relative;
  width: min(900px, 100%);
}

.lightbox-content img {
  width: 100%;
  max-height: 78vh;
  object-fit: contain;
  background: var(--forest-deep);
}

.lightbox-content p {
  padding-top: 12px;
  color: #fff9f0;
  font-weight: 600;
}

.lightbox-close {
  position: absolute;
  top: -46px;
  right: 0;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 249, 240, 0.75);
  border-radius: 50%;
  background: transparent;
  color: #fff9f0;
  font-size: 1.7rem;
  line-height: 1;
}

@media (max-width: 980px) {
  .gallery-grid {
    column-count: 2;
  }

  .gallery-item,
  .gallery-item:nth-child(4n + 1),
  .gallery-item:nth-child(4n + 4) {
    aspect-ratio: 4 / 3;
  }
}

@media (max-width: 560px) {
  .gallery-grid {
    column-count: 1;
  }
}
</style>
