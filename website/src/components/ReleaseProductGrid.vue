<script setup>
import { computed, ref } from 'vue'

import { brand } from '../data/site'
import { getLatestStableRelease } from '../services/releasePortal'
import ReleaseReadmeModal from './ReleaseReadmeModal.vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  releases: {
    type: Array,
    default: () => [],
  },
  language: {
    type: String,
    default: 'zh',
  },
})

const emit = defineEmits(['select-product'])

const activeReadmeProduct = ref(null)

/** 读取双语字段，并在字段不完整时保持空值。
 *
 * @param {unknown} value 双语字段。
 * @param {string} language 当前语言。
 * @returns {string} 当前语言的文本。
 */
const localized = (value, language) => {
  if (typeof value === 'string') {
    return value
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  return typeof value[language] === 'string' ? value[language] : ''
}

/** 产品分类英文 key 对应的双语标签。 */
const categoryLabels = {
  'materials-informatics': { zh: '材料信息学', en: 'Materials Informatics' },
  spectroscopy: { zh: '光谱分析', en: 'Spectroscopy' },
  'polymer-science': { zh: '聚合物科学', en: 'Polymer Science' },
  'laboratory-platform': { zh: '实验室平台', en: 'Laboratory Platform' },
  'knowledge-retrieval': { zh: '知识检索', en: 'Knowledge Retrieval' },
  'developer-tools': { zh: '开发者工具', en: 'Developer Tools' },
}

/** 解析产品分类标签，未知分类回退为原始值。
 *
 * @param {unknown} category manifest 分类字段。
 * @param {string} language 当前语言。
 * @returns {string} 分类标签。
 */
const resolveCategory = (category, language) => (
  categoryLabels[category]?.[language] || localized(category, language)
)

/** 解析产品 logo，仅信任绝对路径与 http(s) URL，其他一律回退到品牌 logo。
 *
 * @param {unknown} logo manifest 中的 logo 字段。
 * @returns {string} 可直接用于 img src 的地址。
 */
const resolveLogo = (logo) => {
  if (typeof logo === 'string' && /^(?:https?:\/\/|\/)/i.test(logo)) {
    return logo
  }
  return brand.logo
}

/** 格式化发布日期。
 *
 * @param {string} value ISO 日期字符串。
 * @param {string} language 当前语言。
 * @returns {string} 本地化日期或空值。
 */
const formatDate = (value, language) => {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const copy = computed(() => (props.language === 'en'
  ? {
      eyebrow: 'Product Overview',
      title: 'SynlysAI Products and Services',
      open: 'Open platform',
      viewDownloads: 'View downloads',
      viewInfo: 'View product info',
      unavailable: 'Entry pending',
      noRelease: 'No public release yet',
      latest: 'Latest stable',
      updated: 'Updated',
    }
  : {
      eyebrow: '产品概览',
      title: 'SynlysAI 产品与服务',
      open: '打开平台',
      viewDownloads: '查看下载',
      viewInfo: '查看产品信息',
      unavailable: '入口待确认',
      noRelease: '暂无公开版本',
      latest: '最新稳定版',
      updated: '最近更新',
    }))

const normalizedProducts = computed(() => props.products.map((product) => {
  const entryType = product?.entryType
  const knownEntry = entryType === 'web' || entryType === 'download'
  const productId = product?.productId || product?.id

  if (!knownEntry) {
    console.warn(`[ReleaseProductGrid] 未知 entryType: ${String(entryType)}`)
  }

  const latestRelease = getLatestStableRelease(props.releases, productId)

  return {
    ...product,
    id: productId,
    entryType,
    knownEntry,
    latestRelease,
    name: localized(product?.name, props.language),
    alternateName: localized(product?.name, props.language === 'en' ? 'zh' : 'en'),
    category: resolveCategory(product?.category, props.language),
    description: localized(product?.tagline ?? product?.description, props.language),
    updatedAt: formatDate(latestRelease?.publishedAt, props.language),
  }
}))

/** 选择下载中心的产品并保留当前页锚点。
 *
 * @param {string} productId manifest 中的产品 ID。
 */
const selectDownloadProduct = (productId) => {
  emit('select-product', productId)
}
</script>

<template>
  <section class="release-products" aria-labelledby="release-products-title">
    <div class="release-products__header">
      <div>
        <span class="section-label">{{ copy.eyebrow }}</span>
        <h2 id="release-products-title">{{ copy.title }}</h2>
      </div>
      <span class="release-products__count">{{ normalizedProducts.length }} / 6</span>
    </div>

    <div class="release-product-grid">
      <article
        v-for="product in normalizedProducts"
        :key="product.id"
        class="release-product-card"
        :data-product-card="product.id"
      >
        <div class="release-product-card__topline">
          <div class="release-product-card__logo-wrap">
            <img
              class="release-product-card__logo"
              :src="resolveLogo(product.logo)"
              :alt="product.name || product.id"
            />
          </div>
          <span class="release-product-card__status">{{ product.status || (language === 'en' ? 'Catalogued' : '已收录') }}</span>
        </div>

        <div class="release-product-card__identity">
          <span class="release-product-card__category">{{ product.category || (language === 'en' ? 'Product' : '产品') }}</span>
          <h3>{{ product.name || product.id }}</h3>
          <span v-if="product.alternateName && product.alternateName !== product.name" class="release-product-card__alternate">
            {{ product.alternateName }}
          </span>
        </div>

        <p class="release-product-card__description">{{ product.description || (language === 'en' ? 'Release information will be available here.' : '发布信息将在此处展示。') }}</p>

        <div class="release-product-card__release">
          <template v-if="product.latestRelease">
            <span class="release-product-card__version">
              <strong>{{ product.latestRelease.version }}</strong>
              <span v-if="product.latestRelease.isLatestStable" class="release-product-card__latest">{{ copy.latest }}</span>
            </span>
            <span v-if="product.updatedAt" class="release-product-card__date">{{ copy.updated }} {{ product.updatedAt }}</span>
          </template>
          <span v-else class="release-product-card__empty">{{ copy.noRelease }}</span>
        </div>

        <div class="release-product-card__footer">
          <button
            type="button"
            class="syn-button syn-button--ghost release-product-card__action"
            :data-readme-button="product.id"
            @click="activeReadmeProduct = product"
          >
            {{ copy.viewInfo }}
          </button>
          <a
            v-if="product.knownEntry && product.entryType === 'web' && product.webUrl"
            class="syn-button syn-button--ghost release-product-card__action"
            :href="product.webUrl"
            target="_blank"
            rel="noreferrer"
          >
            {{ copy.open }}
          </a>
          <a
            v-else-if="product.knownEntry && product.entryType === 'download'"
            class="syn-button syn-button--primary release-product-card__action"
            href="#downloads"
            :data-download-product="product.id"
            @click.prevent="selectDownloadProduct(product.id)"
          >
            {{ copy.viewDownloads }}
          </a>
          <span v-else class="release-product-card__entry-error" data-entry-error>
            {{ copy.unavailable }}
          </span>
        </div>
      </article>
    </div>

    <ReleaseReadmeModal
      v-if="activeReadmeProduct"
      :product-id="activeReadmeProduct.id"
      :product-name="activeReadmeProduct.name"
      :language="language"
      @close="activeReadmeProduct = null"
    />
  </section>
</template>
