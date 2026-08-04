<script setup>
import { brand, languages } from '../data/site'
import { useSiteContent } from '../composables/useSiteContent'

const { content, language, setLanguage } = useSiteContent()
</script>

<template>
  <header class="site-header">
    <RouterLink class="site-header__brand" :to="{ name: 'home' }">
      <img class="site-header__logo" :src="brand.logo" :alt="brand.fullName" />
      <div class="site-header__brand-copy">
        <strong>{{ brand.fullName }}</strong>
        <span>{{ language === 'zh' ? 'AI 自主科研伙伴' : 'AI research partner' }}</span>
      </div>
    </RouterLink>

    <nav class="site-header__nav" :aria-label="language === 'zh' ? '页面导航' : 'Site navigation'">
      <RouterLink v-for="item in content.navigation" :key="item.label" :to="item.to">
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="site-header__actions">
      <div class="language-switch" role="group" :aria-label="language === 'zh' ? '语言切换' : 'Language switcher'">
        <button
          v-for="item in languages"
          :key="item.code"
          type="button"
          class="language-switch__button"
          :class="{ 'is-active': language === item.code }"
          :aria-pressed="language === item.code"
          @click="setLanguage(item.code)"
        >
          {{ item.label }}
        </button>
      </div>

      <a class="syn-button syn-button--ghost" :href="content.hero.secondaryHref" target="_blank" rel="noreferrer">
        {{ content.actions.about }}
      </a>
      <a class="syn-button syn-button--primary" :href="content.hero.primaryHref" target="_blank" rel="noreferrer">
        {{ content.actions.demo }}
      </a>
    </div>
  </header>
</template>
