<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useSiteContent } from '../composables/useSiteContent'
import ReleaseProductGrid from '../components/ReleaseProductGrid.vue'
import { releasePortalFallback } from '../data/releasePortalFallback'
import { fetchReleaseManifest } from '../services/releasePortal'

const route = useRoute()
const router = useRouter()
const { content, language } = useSiteContent()

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
const manifest = ref(releasePortalFallback)
const loading = ref(true)
const errorMessage = ref('')

/** 读取同域发布 manifest，并在失败时保持安全 fallback。
 *
 * @returns {Promise<void>} 异步加载完成。
 */
const loadManifest = async () => {
  loading.value = true
  const result = await fetchReleaseManifest()
  manifest.value = result.manifest
  errorMessage.value = result.ok ? '' : result.error?.message || pageCopy.value.errorBody
  loading.value = false
}

/** 选择产品并同步下载中心锚点。
 *
 * @param {string} productId manifest 中的产品 ID。
 * @returns {Promise<void>} 路由更新完成。
 */
const selectProduct = async (productId) => {
  await router.replace({
    query: { ...route.query, product: productId },
    hash: '#downloads',
  })
}

onMounted(loadManifest)
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

    <section class="section-band release-portal__content">
      <div class="section-shell">
        <div v-if="loading" class="release-state" data-portal-state="loading">
          <strong>{{ pageCopy.loading }}</strong>
        </div>

        <div v-else-if="errorMessage" class="release-state release-state--warning" data-portal-state="error">
          <strong>{{ pageCopy.errorTitle }}</strong>
          <span>{{ pageCopy.errorBody }}</span>
          <button type="button" class="syn-button syn-button--ghost" @click="loadManifest">
            {{ pageCopy.retry }}
          </button>
        </div>

        <ReleaseProductGrid
          :products="manifest.products"
          :releases="manifest.releases"
          :language="language"
          @select-product="selectProduct"
        />
        <div id="downloads" class="release-portal__anchor" aria-hidden="true"></div>
      </div>
    </section>
  </main>
</template>
