<script setup>
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { pageTitles } from './data/site'
import { language } from './composables/useLanguage'

const route = useRoute()

watchEffect(() => {
  const routeName = typeof route.name === 'string' ? route.name : 'home'
  const titles = pageTitles[language.value] || pageTitles.zh
  document.title = titles[routeName] || titles.home
})
</script>

<template>
  <div class="site-shell">
    <SiteHeader />
    <RouterView />
    <SiteFooter />
  </div>
</template>
