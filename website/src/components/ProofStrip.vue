<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  content: {
    type: Object,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
})

const bodyRef = ref(null)
const mouseX = ref(50)
const mouseY = ref(50)

function onMouseMove(e) {
  if (!bodyRef.value) return
  const rect = bodyRef.value.getBoundingClientRect()
  mouseX.value = ((e.clientX - rect.left) / rect.width) * 100
  mouseY.value = ((e.clientY - rect.top) / rect.height) * 100
}

function onMouseLeave() {
  mouseX.value = 50
  mouseY.value = 50
}

onMounted(() => {
  if (bodyRef.value) {
    bodyRef.value.addEventListener('mousemove', onMouseMove, { passive: true })
    bodyRef.value.addEventListener('mouseleave', onMouseLeave)
  }
})

onUnmounted(() => {
  if (bodyRef.value) {
    bodyRef.value.removeEventListener('mousemove', onMouseMove)
    bodyRef.value.removeEventListener('mouseleave', onMouseLeave)
  }
})
</script>

<template>
  <section class="proof-band">
    <div class="section-shell proof-shell">
      <div class="section-head section-head--stacked">
        <span class="section-label">{{ content.eyebrow }}</span>
        <div>
          <h2>{{ content.title }}</h2>
          <p>{{ content.summary }}</p>
        </div>
      </div>

      <div
        ref="bodyRef"
        class="proof-body"
        :style="{
          '--proof-mx': `${mouseX}%`,
          '--proof-my': `${mouseY}%`,
        }"
      >
        <!-- 错落卡片区 -->
        <div class="proof-cards-area">
          <article
            v-for="(card, i) in content.cards"
            :key="card.title"
            class="proof-stat"
            :class="`proof-stat--stagger-${i}`"
          >
            <div class="proof-stat__glow" />
            <strong>{{ card.title }}</strong>
            <span>{{ card.text }}</span>
          </article>
        </div>

        <!-- 图片区 -->
        <figure v-if="content.image" class="proof-visual">
          <img
            :src="content.image.src"
            :alt="content.image.alt"
            loading="lazy"
          />
        </figure>
      </div>
    </div>
  </section>
</template>
