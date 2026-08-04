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
  <section class="section-band">
    <div class="section-shell">
      <div class="section-head section-head--stacked">
        <span class="section-label">{{ content.eyebrow }}</span>
        <div>
          <h2>{{ content.title }}</h2>
          <p>{{ content.summary }}</p>
        </div>
      </div>

      <div class="workflow-grid">
        <article v-for="step in content.steps" :key="step.code" class="workflow-card">
          <div class="workflow-card__top">
            <span class="workflow-card__code">{{ step.code }}</span>
            <strong>{{ step.title }}</strong>
          </div>
          <p>{{ step.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
