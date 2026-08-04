<script setup>
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
</script>

<template>
  <section class="hero-band" :style="{ '--hero-bg': `url(${brand.heroVisual})` }">
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

        <div class="hero-highlight-grid">
          <article v-for="item in content.highlights" :key="item.value" class="hero-highlight">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </article>
        </div>
      </article>
    </div>
  </section>
</template>
