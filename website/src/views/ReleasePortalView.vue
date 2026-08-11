<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useSiteContent } from '../composables/useSiteContent'
import ReleaseFilters from '../components/ReleaseFilters.vue'
import ReleaseDownloadCenter from '../components/ReleaseDownloadCenter.vue'
import ReleaseFaqCenter from '../components/ReleaseFaqCenter.vue'
import ReleaseProductGrid from '../components/ReleaseProductGrid.vue'
import ReleaseTimeline from '../components/ReleaseTimeline.vue'
import { releasePortalCopy } from '../data/releasePortal'
import { releasePortalFallback } from '../data/releasePortalFallback'
import { fetchReleaseManifest, filterTimeline } from '../services/releasePortal'

const PORTAL_TAB_IDS = ['overview', 'evolution', 'releases', 'downloads', 'faq']

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
const selectedChangeTypes = computed(() => {
  const value = readQueryValue(route.query.types)
  return value ? value.split(',').filter(Boolean) : []
})
const selectedTimelineId = computed(() => readQueryValue(route.query.timeline))
const filters = computed(() => ({
  productId: selectedProduct.value,
  dateFrom: readQueryValue(route.query.from),
  dateTo: readQueryValue(route.query.to),
  changeTypes: selectedChangeTypes.value,
  view: viewMode.value,
}))
const pageCopy = computed(() => content.value.releases)
const portalCopy = computed(() => releasePortalCopy[language.value] || releasePortalCopy.zh)
const portalTabs = computed(() => PORTAL_TAB_IDS.map((id) => ({
  id,
  label: pageCopy.value.tabs?.[id] || id,
})))
const activeTab = computed(() => {
  const tabId = route.hash.slice(1)
  return PORTAL_TAB_IDS.includes(tabId) ? tabId : 'overview'
})
const manifest = ref(releasePortalFallback)
const loading = ref(true)
const errorMessage = ref('')
const changeTypes = computed(() => Array.from(new Set(
  manifest.value.timeline
    .map((event) => event?.changeType)
    .filter((value) => typeof value === 'string' && value),
)).sort())

/** 生成用于关联 Release 与子节点的稳定键。
 *
 * @param {object} event 时间线事件。
 * @returns {string} 产品与版本组合键。
 */
const eventGroupKey = (event) => (
  typeof event?.productId === 'string' && typeof event?.version === 'string'
    ? `${event.productId}\u0000${event.version}`
    : ''
)

const filteredTimeline = computed(() => {
  const filtered = filterTimeline(manifest.value.timeline, filters.value)
  if (filters.value.view !== 'panorama') {
    return filtered
  }

  const childGroupKeys = new Set(
    filtered
      .filter((event) => event.level !== 'release')
      .map(eventGroupKey)
      .filter(Boolean),
  )
  const selectedIds = new Set(filtered.map((event) => event.id))
  const contextualParents = manifest.value.timeline.filter((event) => (
    event?.level === 'release'
    && !selectedIds.has(event.id)
    && childGroupKeys.has(eventGroupKey(event))
    && typeof event.occurredAt === 'string'
    && !Number.isNaN(Date.parse(event.occurredAt))
  ))

  return [...filtered, ...contextualParents].sort((left, right) => (
    Date.parse(right.occurredAt) - Date.parse(left.occurredAt)
  ))
})

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

/** 打开技术演进并定位到指定事件。
 *
 * @param {string} timelineId 时间线事件 ID。
 * @returns {Promise<void>} 路由和滚动更新完成。
 */
const selectTimeline = async (timelineId) => {
  if (!timelineId) {
    return
  }

  const targetEvent = manifest.value.timeline.find((event) => event?.id === timelineId)
  const query = { ...route.query, timeline: timelineId }
  delete query.from
  delete query.to
  delete query.types

  if (targetEvent?.productId) {
    query.product = targetEvent.productId
  }
  if (targetEvent && targetEvent.level !== 'release') {
    query.view = 'panorama'
  }

  await router.replace({
    query,
    hash: '#evolution',
  })
  await nextTick()
  window.requestAnimationFrame(() => {
    document.getElementById(`timeline-${timelineId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
}

/** 切换发布中心一级视图并保留筛选参数。
 *
 * @param {string} tabId 发布中心 Tab ID。
 * @returns {Promise<void>} 路由更新完成。
 */
const selectTab = async (tabId) => {
  if (!PORTAL_TAB_IDS.includes(tabId)) {
    return
  }

  await router.replace({ query: route.query, hash: `#${tabId}` })
}

/** 使用方向键循环切换 Tab 并同步焦点。
 *
 * @param {string} tabId 当前 Tab ID。
 * @param {KeyboardEvent} event 键盘事件。
 * @returns {Promise<void>} 路由和焦点更新完成。
 */
const moveTabFocus = async (tabId, event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    return
  }

  event.preventDefault()
  const currentIndex = PORTAL_TAB_IDS.indexOf(tabId)
  const targetIndex = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? PORTAL_TAB_IDS.length - 1
      : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + PORTAL_TAB_IDS.length)
        % PORTAL_TAB_IDS.length
  const targetId = PORTAL_TAB_IDS[targetIndex]

  await selectTab(targetId)
  await nextTick()
  document.getElementById(targetId)?.focus()
}

/** 将筛选状态序列化到 URL query。
 *
 * @param {object} nextFilters 下一组筛选状态。
 * @returns {Promise<void>} 路由更新完成。
 */
const updateFilters = async (nextFilters) => {
  const query = { ...route.query }
  delete query.product
  delete query.from
  delete query.to
  delete query.types
  delete query.view

  if (nextFilters.productId) {
    query.product = nextFilters.productId
  }
  if (nextFilters.dateFrom) {
    query.from = nextFilters.dateFrom
  }
  if (nextFilters.dateTo) {
    query.to = nextFilters.dateTo
  }
  if (nextFilters.changeTypes.length) {
    query.types = nextFilters.changeTypes.join(',')
  }
  if (nextFilters.view === 'panorama') {
    query.view = 'panorama'
  }

  await router.replace({ query, hash: route.hash })
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

    <section class="release-portal__navigation" :aria-label="pageCopy.navigationLabel">
      <div class="section-shell">
        <div class="release-portal-tabs" role="tablist" :aria-label="pageCopy.title">
          <button
            v-for="tab in portalTabs"
            :id="tab.id"
            :key="tab.id"
            type="button"
            role="tab"
            :data-portal-tab="tab.id"
            :aria-controls="`portal-panel-${tab.id}`"
            :aria-selected="activeTab === tab.id"
            :tabindex="activeTab === tab.id ? 0 : -1"
            :class="{ 'is-active': activeTab === tab.id }"
            @click="selectTab(tab.id)"
            @keydown="moveTabFocus(tab.id, $event)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="section-band release-portal__content">
      <div class="section-shell">
        <div v-if="loading" class="release-state" data-portal-state="loading">
          <strong>{{ pageCopy.loading }}</strong>
          <div class="release-loading-skeleton" aria-hidden="true">
            <span v-for="item in 3" :key="item"></span>
          </div>
        </div>

        <div v-else-if="errorMessage" class="release-state release-state--warning" data-portal-state="error">
          <strong>{{ pageCopy.errorTitle }}</strong>
          <span>{{ pageCopy.errorBody }}</span>
          <button type="button" class="syn-button syn-button--ghost" @click="loadManifest">
            {{ pageCopy.retry }}
          </button>
        </div>

        <div
          :id="`portal-panel-${activeTab}`"
          role="tabpanel"
          class="release-portal-panel"
          :data-portal-panel="activeTab"
          :aria-labelledby="activeTab"
        >
          <ReleaseProductGrid
            v-if="activeTab === 'overview'"
            :products="manifest.products"
            :releases="manifest.releases"
            :language="language"
            @select-product="selectProduct"
          />

          <template v-else-if="activeTab === 'evolution'">
            <ReleaseFilters
              :model-value="filters"
              :products="manifest.products"
              :change-types="changeTypes"
              :language="language"
              @update:model-value="updateFilters"
            />

            <ReleaseTimeline
              :events="filteredTimeline"
              :releases="manifest.releases"
              :language="language"
              :target-id="selectedTimelineId"
              :view="viewMode"
            />
          </template>

          <ReleaseTimeline
            v-else-if="activeTab === 'releases'"
            :events="manifest.timeline"
            :releases="manifest.releases"
            :language="language"
            :title="portalCopy.timeline.releaseTitle"
            view="release"
          />

          <ReleaseDownloadCenter
            v-else-if="activeTab === 'downloads'"
            :products="manifest.products"
            :releases="manifest.releases"
            :language="language"
            :product-id="selectedProduct"
          />

          <ReleaseFaqCenter
            v-else
            :faqs="manifest.faqs"
            :products="manifest.products"
            :language="language"
            @select-timeline="selectTimeline"
          />
        </div>
      </div>
    </section>
  </main>
</template>
