<script setup>
defineProps({
  source: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="markdown-renderer markdown-renderer--plain">{{ source }}</div>
</template>
