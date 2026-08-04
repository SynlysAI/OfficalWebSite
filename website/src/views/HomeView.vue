<script setup>
import HeroSection from '../components/HeroSection.vue'
import ProofStrip from '../components/ProofStrip.vue'
import ChallengeBanners from '../components/ChallengeBanners.vue'
import ProductMatrix from '../components/ProductMatrix.vue'
import LayerGrid from '../components/LayerGrid.vue'
import AssetShowcase from '../components/AssetShowcase.vue'
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

    <ProofStrip id="about" :content="content.about" :language="language" />

    <ProductMatrix id="products" :content="content.products" />

    <LayerGrid id="workflow" :content="content.workflow" :language="language" />

    <AssetShowcase :content="content.showcase" />

    <ModuleGrid id="matrix" :content="content.matrix" :language="language" />
  </main>
</template>
