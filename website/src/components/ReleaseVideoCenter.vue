<script setup>
import { computed, ref } from 'vue'

import { introVideos } from '../data/introVideos'
import { releasePortalCopy } from '../data/releasePortal'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  language: {
    type: String,
    default: 'zh',
  },
})

const copy = computed(() => releasePortalCopy[props.language] || releasePortalCopy.zh)

/** 读取产品的本地化名称。
 *
 * @param {string} productId 产品 ID。
 * @returns {string} 当前语言产品名，未命中时返回产品 ID。
 */
const productName = (productId) => {
  const product = props.products.find((item) => item?.productId === productId)
  return product?.name?.[props.language] || product?.name?.zh || productId
}

/** 组装带播放地址的视频卡片数据。
 *
 * @returns {object[]} 视频卡片列表。
 */
const videoCards = computed(() => introVideos.map((video) => ({
  ...video,
  productName: productName(video.productId),
  videoTitle: video.title?.[props.language] || video.title?.zh || '',
  src: `/api/video/${encodeURIComponent(video.productId)}/${encodeURIComponent(video.file)}`,
})))

const activeProductId = ref(introVideos[0]?.productId || '')

/** 当前选中的产品视频。
 *
 * @returns {object|undefined} 选中的视频卡片，列表为空时为 undefined。
 */
const activeVideo = computed(() => (
  videoCards.value.find((video) => video.productId === activeProductId.value)
  || videoCards.value[0]
))

/** 切换当前展示的产品视频。
 *
 * @param {string} productId 产品 ID。
 * @returns {void}
 */
const selectVideo = (productId) => {
  activeProductId.value = productId
}
</script>

<template>
  <section class="release-videos" aria-labelledby="release-videos-title">
    <div class="release-videos__head">
      <span class="section-label">{{ copy.videos.eyebrow }}</span>
      <h2 id="release-videos-title">{{ copy.videos.title }}</h2>
    </div>

    <template v-if="videoCards.length">
      <div class="release-videos__switch" role="tablist" :aria-label="copy.videos.title">
        <button
          v-for="video in videoCards"
          :key="video.productId"
          type="button"
          role="tab"
          :data-video-tab="video.productId"
          :aria-selected="video.productId === activeVideo?.productId"
          :class="{ 'is-active': video.productId === activeVideo?.productId }"
          @click="selectVideo(video.productId)"
        >
          {{ video.productName }}
        </button>
      </div>

      <article
        v-if="activeVideo"
        class="release-video-card release-video-card--featured"
        :data-video-product="activeVideo.productId"
      >
        <div class="release-video-card__media">
          <video
            :key="activeVideo.productId"
            controls
            preload="metadata"
            playsinline
            :src="activeVideo.src"
            :aria-label="`${activeVideo.productName} ${activeVideo.videoTitle}`"
          ></video>
        </div>
        <div class="release-video-card__meta">
          <strong>{{ activeVideo.productName }}</strong>
          <span v-if="activeVideo.videoTitle">{{ activeVideo.videoTitle }}</span>
        </div>
      </article>
    </template>

    <div v-else class="release-state" data-video-empty>
      {{ copy.videos.empty }}
    </div>
  </section>
</template>
