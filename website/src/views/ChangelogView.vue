<script setup>
import { computed, onMounted, ref } from 'vue'

import { releaseSource } from '../data/site'
import { useSiteContent } from '../composables/useSiteContent'
import { buildReleasesPageUrl, fetchGitHubReleases } from '../services/githubReleases'

const { content, language } = useSiteContent()
const releases = ref([])
const loading = ref(true)
const errorMessage = ref('')

const sourceUrl = computed(() => buildReleasesPageUrl(releaseSource))
const latestRelease = computed(() => releases.value[0])
const pageCopy = computed(() => content.value.changelog)

const formatDate = (value) => {
  if (!value) {
    return pageCopy.value.unpublished
  }

  return new Intl.DateTimeFormat(language.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

onMounted(async () => {
  try {
    releases.value = await fetchGitHubReleases()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="release-page">
    <section class="release-hero">
      <div class="section-shell release-hero__inner">
        <div>
          <span class="section-label">{{ pageCopy.eyebrow }}</span>
          <h1>{{ pageCopy.title }}</h1>
          <p>{{ pageCopy.summary }}</p>
        </div>
        <a class="syn-button syn-button--ghost" :href="sourceUrl" target="_blank" rel="noreferrer">
          {{ pageCopy.sourceAction }}
        </a>
      </div>
    </section>

    <section class="section-band release-content">
      <div class="section-shell">
        <div v-if="loading" class="release-state">{{ pageCopy.loading }}</div>

        <div v-else-if="errorMessage" class="release-state release-state--warning">
          <strong>{{ pageCopy.errorTitle }}</strong>
          <span>{{ errorMessage }}</span>
          <a :href="sourceUrl" target="_blank" rel="noreferrer">{{ pageCopy.sourceLink }}</a>
        </div>

        <div v-else-if="!releases.length" class="release-state">
          <strong>{{ pageCopy.emptyTitle }}</strong>
          <span>{{ pageCopy.emptyBody }}</span>
          <a :href="sourceUrl" target="_blank" rel="noreferrer">{{ pageCopy.sourceLink }}</a>
        </div>

        <div v-else>
          <div class="release-summary-strip">
            <article>
              <span>{{ pageCopy.summaryLabels[0] }}</span>
              <strong>{{ latestRelease.tagName }}</strong>
            </article>
            <article>
              <span>{{ pageCopy.summaryLabels[1] }}</span>
              <strong>{{ formatDate(latestRelease.publishedAt) }}</strong>
            </article>
            <article>
              <span>{{ pageCopy.summaryLabels[2] }}</span>
              <strong>{{ releases.length }}</strong>
            </article>
          </div>

          <div class="changelog-list">
            <article v-for="release in releases" :key="release.id" class="changelog-item">
              <div class="changelog-item__date">{{ formatDate(release.publishedAt) }}</div>
              <div class="changelog-item__body">
                <div class="changelog-item__top">
                  <h2>{{ release.name }}</h2>
                  <span v-if="release.prerelease" class="release-badge">Pre-release</span>
                </div>
                <p>{{ release.summary || pageCopy.emptyReleaseBody }}</p>
                <div class="release-links">
                  <a :href="release.htmlUrl" target="_blank" rel="noreferrer">{{ pageCopy.originalAction }}</a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
