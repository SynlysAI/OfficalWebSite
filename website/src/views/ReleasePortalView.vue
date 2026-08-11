<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useSiteContent } from '../composables/useSiteContent'

const route = useRoute()
const { content } = useSiteContent()

/** 读取单值 query 参数。
 *
 * @param {unknown} value 路由 query 值。
 * @returns {string} 可用于筛选的字符串。
 */
const readQueryValue = (value) => (
  typeof value === 'string' ? value : ''
)

const selectedProduct = computed(() => readQueryValue(route.query.product))
const viewMode = computed(() => (
  route.query.view === 'panorama' ? 'panorama' : 'release'
))
const pageCopy = computed(() => content.value.releases)
</script>

<template>
  <main
    class="release-portal"
    :data-product="selectedProduct"
    :data-view="viewMode"
  >
    <section class="release-hero">
      <div class="section-shell release-hero__inner">
        <div>
          <span class="section-label">{{ pageCopy.eyebrow }}</span>
          <h1>{{ pageCopy.title }}</h1>
          <p>{{ pageCopy.summary }}</p>
        </div>
      </div>
    </section>
  </main>
</template>
