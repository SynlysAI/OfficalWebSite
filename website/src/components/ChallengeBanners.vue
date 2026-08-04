<script setup>
defineProps({
  content: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="challenge-band">
    <div class="section-shell">
      <div class="section-head section-head--stacked">
        <span class="section-label">{{ content.eyebrow }}</span>
        <div>
          <h2>{{ content.title }}</h2>
          <p>{{ content.summary }}</p>
        </div>
      </div>

      <div class="challenge-list">
        <article
          v-for="banner in content.banners"
          :key="banner.code"
          class="challenge-banner"
          :class="`challenge-banner--${banner.accent}`"
        >
          <span class="challenge-banner__code">{{ banner.code }}</span>

          <div class="challenge-banner__body">
            <div class="challenge-banner__meta">
              <strong>{{ banner.title }}</strong>
            </div>

            <h3>{{ banner.question }}</h3>
            <p>{{ banner.answer }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
