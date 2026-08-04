<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  brand: {
    type: Object,
    required: true,
  },
  content: {
    type: Object,
    required: true,
  },
})

const heroRef = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)

function onMouseMove(e) {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  mouseX.value = ((e.clientX - rect.left) / rect.width) * 100
  mouseY.value = ((e.clientY - rect.top) / rect.height) * 100
}

onMounted(() => {
  if (heroRef.value) {
    heroRef.value.addEventListener('mousemove', onMouseMove, { passive: true })
  }
})

onUnmounted(() => {
  if (heroRef.value) {
    heroRef.value.removeEventListener('mousemove', onMouseMove)
  }
})
</script>

<template>
  <section
    ref="heroRef"
    class="hero-band"
    :style="{
      '--hero-bg': `url(${brand.heroVisual})`,
      '--mouse-x': `${mouseX}%`,
      '--mouse-y': `${mouseY}%`,
    }"
  >
    <div class="hero-glow" />
    <div class="hero-layout">
      <article class="hero-copy">
        <div class="hero-kicker">
          <span class="hero-kicker__dot" />
          {{ content.kicker }}
        </div>

        <h1>{{ content.title }}</h1>
        <p class="hero-summary">{{ content.summary }}</p>

        <div class="hero-pill-row">
          <span v-for="badge in content.badges" :key="badge" class="hero-pill">
            {{ badge }}
          </span>
        </div>

        <div class="hero-actions">
          <a class="syn-button syn-button--primary" :href="content.primaryHref">
            {{ content.primaryAction }}
          </a>
          <a class="syn-button syn-button--ghost" :href="content.secondaryHref">
            {{ content.secondaryAction }}
          </a>
        </div>
      </article>
    </div>

    <div class="hero-capability-row">
      <article
        v-for="(item, i) in content.highlights"
        :key="i"
        class="hero-capability"
      >
        <span class="hero-capability__index">{{ String(i + 1).padStart(2, '0') }}</span>
        <div class="hero-capability__body">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
