<script setup>
import HeroSection from '../components/HeroSection.vue'
import ProofStrip from '../components/ProofStrip.vue'
import ChallengeBanners from '../components/ChallengeBanners.vue'
import ProductMatrix from '../components/ProductMatrix.vue'
import ModuleGrid from '../components/ModuleGrid.vue'
import { brand } from '../data/site'
import { useSiteContent } from '../composables/useSiteContent'

const { content, language } = useSiteContent()
</script>

<template>
  <main>
    <HeroSection
      id="platform"
      :brand="brand"
      :content="content.hero"
    />

    <ChallengeBanners id="challenges" :content="content.challengeBanners" />

    <ProductMatrix id="products" :content="content.products" />

    <ModuleGrid id="matrix" :content="content.matrix" :language="language" :showcase="content.showcase" />

    <ProofStrip id="about" :content="content.about" :language="language" />
  </main>
</template>
