<script setup>
import { computed, ref } from 'vue'

import { releasePortalCopy } from '../data/releasePortal'
import {
  collectDownloadOptions,
  formatFileSize,
  isPrerelease,
  prepareDownloadGroups,
} from '../services/downloads'

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
  productId: {
    type: String,
    default: '',
  },
})

const platform = ref('')
const architecture = ref('')
const copy = computed(() => releasePortalCopy[props.language] || releasePortalCopy.zh)
const options = computed(() => collectDownloadOptions(props.releases))
const groups = computed(() => prepareDownloadGroups(props.products, props.releases, {
  productId: props.productId,
  platform: platform.value,
  arch: architecture.value,
}))

/** 读取产品的本地化名称。
 *
 * @param {object} product 产品记录。
 * @returns {string} 当前语言产品名。
 */
const productName = (product) => (
  product?.name?.[props.language] || product?.name?.zh || product?.productId || ''
)

/** 判断版本是否来自手工发布源。
 *
 * @param {object} release 发布记录。
 * @returns {boolean} 是否为手工来源。
 */
const isManualRelease = (release) => (
  release?.source === 'manual' || release?.source?.type === 'manual'
)
</script>

<template>
  <section class="release-downloads" aria-labelledby="release-downloads-title">
    <div class="release-downloads__head">
      <div>
        <span class="section-label">{{ language === 'en' ? 'OFFICIAL RESOURCES' : '官方资源' }}</span>
        <h2 id="release-downloads-title">{{ copy.downloads.title }}</h2>
      </div>
      <div class="release-downloads__filters">
        <label>
          <span>{{ copy.downloads.platform }}</span>
          <select v-model="platform" data-download-platform>
            <option value="">{{ copy.downloads.allPlatforms }}</option>
            <option v-for="item in options.platforms" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label>
          <span>{{ copy.downloads.architecture }}</span>
          <select v-model="architecture" data-download-arch>
            <option value="">{{ copy.downloads.allArchitectures }}</option>
            <option v-for="item in options.architectures" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
      </div>
    </div>

    <div v-if="groups.length" class="release-downloads__groups">
      <section
        v-for="group in groups"
        :key="group.product.productId"
        class="release-download-group"
        :data-download-product="group.product.productId"
      >
        <h3>{{ productName(group.product) }}</h3>
        <details
          v-for="release in group.releases"
          :key="release.id || release.tagName"
          class="release-download-version"
          :data-download-release="release.tagName"
          :open="Boolean(release.isLatestStable)"
        >
          <summary>
            <strong>{{ release.tagName }}</strong>
            <span v-if="release.isLatestStable" class="release-download-version__latest">
              {{ copy.downloads.latest }}
            </span>
            <span v-if="isPrerelease(release)" class="release-download-version__preview">
              {{ copy.downloads.preview }}
            </span>
            <span v-if="isManualRelease(release)" class="release-download-version__source">
              {{ copy.downloads.manual }}
            </span>
          </summary>

          <div class="release-download-assets">
            <article
              v-for="asset in release.assets"
              :key="asset.downloadPath || asset.name"
              class="release-download-asset"
              data-download-asset
            >
              <div>
                <strong>{{ asset.name }}</strong>
                <div class="release-download-asset__meta">
                  <span v-if="asset.platform">{{ asset.platform }}</span>
                  <span v-if="asset.arch">{{ asset.arch }}</span>
                  <span v-if="formatFileSize(asset.size, language)">
                    {{ formatFileSize(asset.size, language) }}
                  </span>
                </div>
                <code v-if="asset.sha256">SHA-256 {{ asset.sha256 }}</code>
                <span v-else class="release-download-asset__checksum">
                  {{ copy.downloads.noChecksum }}
                </span>
              </div>
              <div class="release-download-asset__actions">
                <a href="#evolution">{{ copy.downloads.timeline }}</a>
                <a
                  v-if="asset.downloadUrl"
                  class="syn-button syn-button--primary"
                  :href="asset.downloadUrl"
                  data-download-link
                >
                  {{ copy.downloads.action }}
                </a>
                <div v-else class="release-download-asset__error" role="status">
                  <span>{{ copy.downloads.failed }}</span>
                  <a href="#downloads">{{ copy.downloads.retry }}</a>
                  <a href="#faq">{{ copy.downloads.support }}</a>
                </div>
              </div>
            </article>
          </div>
        </details>
      </section>
    </div>

    <div v-else class="release-state" data-download-empty>
      {{ copy.downloads.empty }}
    </div>
  </section>
</template>
