<script setup>
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

      <div class="proof-grid">
        <article v-for="card in content.cards" :key="card.title" class="proof-stat">
          <strong>{{ card.title }}</strong>
          <span>{{ card.text }}</span>
        </article>
      </div>
    </div>
  </section>
</template>
