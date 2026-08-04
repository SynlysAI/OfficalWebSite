<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
})

const trackRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const activeIndex = ref(0)

const images = computed(() => props.content.images || [])

function checkScroll() {
  if (!trackRef.value) {
    canScrollLeft.value = false
    canScrollRight.value = false
    return
  }
  const el = trackRef.value
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 4

  // Update active index based on which card is most visible
  const cardWidth = el.children[0]?.offsetWidth || 0
  if (cardWidth > 0) {
    activeIndex.value = Math.round(el.scrollLeft / (cardWidth + 16))
  }
}

function scrollBy(direction) {
  if (!trackRef.value) return
  const card = trackRef.value.children[0]
  if (!card) return
  const delta = (card.offsetWidth + 16) * (direction === 'left' ? -1 : 1)
  trackRef.value.scrollBy({ left: delta, behavior: 'smooth' })
  // checkScroll runs via scroll event listener
}

function scrollTo(index) {
  if (!trackRef.value) return
  const card = trackRef.value.children[0]
  if (!card) return
  const delta = (card.offsetWidth + 16) * index
  trackRef.value.scrollTo({ left: delta, behavior: 'smooth' })
}

let scrollTimer = null
function onScroll() {
  // Debounce scroll events
  if (scrollTimer) return
  scrollTimer = requestAnimationFrame(() => {
    scrollTimer = null
    checkScroll()
  })
}

onMounted(() => {
  if (trackRef.value) {
    trackRef.value.addEventListener('scroll', onScroll, { passive: true })
    checkScroll()
  }
})

onUnmounted(() => {
  if (trackRef.value) {
    trackRef.value.removeEventListener('scroll', onScroll)
  }
})
</script>

<template>
  <section class="section-band">
    <div class="section-shell">
      <div class="section-head section-head--stacked">
        <span class="section-label">{{ content.eyebrow }}</span>
        <div>
          <h2>{{ content.title }}</h2>
          <p>{{ content.summary }}</p>
        </div>
      </div>

      <div v-if="images.length" class="gallery-wrap">
        <!-- Left arrow -->
        <button
          class="gallery-arrow gallery-arrow--left"
          :class="{ 'is-hidden': !canScrollLeft }"
          aria-label="向左滑动"
          @click="scrollBy('left')"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 5L7 10L12 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Scrollable track -->
        <div ref="trackRef" class="gallery-track">
          <figure
            v-for="(img, i) in images"
            :key="i"
            class="gallery-card"
            :class="{ 'is-active': i === activeIndex }"
          >
            <div class="gallery-card__frame">
              <img
                :src="img.src"
                :alt="img.alt"
                loading="lazy"
              />
            </div>
            <figcaption v-if="img.caption">{{ img.caption }}</figcaption>
          </figure>
        </div>

        <!-- Right arrow -->
        <button
          class="gallery-arrow gallery-arrow--right"
          :class="{ 'is-hidden': !canScrollRight }"
          aria-label="向右滑动"
          @click="scrollBy('right')"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Dot indicators -->
        <div v-if="images.length > 1" class="gallery-dots">
          <button
            v-for="(img, i) in images"
            :key="i"
            class="gallery-dot"
            :class="{ 'is-active': i === activeIndex }"
            :aria-label="`跳转到 ${img.alt}`"
            @click="scrollTo(i)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
