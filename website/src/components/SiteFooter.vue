<script setup>
import { brand } from '../data/site'
import { useSiteContent } from '../composables/useSiteContent'

const { content, language } = useSiteContent()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <strong>{{ brand.fullName }}</strong>
        <span>{{ language === 'zh' ? '企业可托付的 AI 自主科研伙伴' : 'Trusted AI research partner for enterprise R&D' }}</span>
      </div>

      <nav class="site-footer__links" :aria-label="language === 'zh' ? '页脚导航' : 'Footer navigation'">
        <a v-for="item in content.footerLinks.filter((link) => link.href)" :key="item.label" :href="item.href" target="_blank" rel="noreferrer">
          {{ item.label }}
        </a>
        <RouterLink v-for="item in content.footerLinks.filter((link) => link.to)" :key="item.label" :to="item.to">
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
  </footer>
</template>
