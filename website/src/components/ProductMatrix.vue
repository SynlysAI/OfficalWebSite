<script setup>
defineProps({
  content: {
    type: Object,
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

      <div class="product-grid">
        <article
          v-for="card in content.cards"
          :key="card.name"
          class="product-card"
          :class="`product-card--${card.accent}`"
        >
          <div class="product-card__top">
            <span class="product-card__code">{{ card.code }}</span>
            <span class="product-card__category">{{ card.category }}</span>
          </div>

          <h3>{{ card.name }}</h3>
          <p>{{ card.description }}</p>

          <div class="product-card__chips">
            <span v-for="bullet in card.bullets" :key="bullet">{{ bullet }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
