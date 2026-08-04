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
  <section class="section-band section-band--matrix">
    <div class="section-shell">
      <div class="section-head section-head--stacked">
        <span class="section-label">{{ content.eyebrow }}</span>
        <div>
          <h2>{{ content.title }}</h2>
          <p>{{ content.summary }}</p>
        </div>
      </div>

      <div class="module-grid">
        <article v-for="module in content.modules" :key="module.name" class="module-card">
          <span class="module-card__category">{{ module.tag }}</span>
          <strong>{{ module.name }}</strong>
          <p>{{ module.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
