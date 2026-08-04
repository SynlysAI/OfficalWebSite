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

      <!-- Showcase groups -->
      <div
        v-for="(group, gi) in content.groups"
        :key="gi"
        class="showcase-group"
      >
        <div class="showcase-group__header">
          <span class="showcase-group__index">{{ String(gi + 1).padStart(2, '0') }}</span>
          <strong>{{ group.label }}</strong>
        </div>

        <div :class="['showcase-row', `showcase-row--cols-${group.cols || 1}`]">
          <figure
            v-for="(img, ii) in group.images"
            :key="ii"
            class="showcase-figure"
          >
            <div class="showcase-figure__frame">
              <img
                :src="img.src"
                :alt="img.alt"
                loading="lazy"
              />
            </div>
            <figcaption v-if="img.caption">{{ img.caption }}</figcaption>
          </figure>
        </div>

        <!-- Visual edge below images — soft gradient instead of hard cut -->
        <div v-if="gi < content.groups.length - 1" class="showcase-edge" />
      </div>
    </div>
  </section>
</template>
