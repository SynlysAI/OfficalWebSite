<script setup>
import { ref, watch } from 'vue'

import { fetchProductReadme } from '../services/releasePortal'
import MarkdownRenderer from './MarkdownRenderer.vue'

const props = defineProps({
  productId: {
    type: String,
    default: '',
  },
  productName: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'zh',
  },
})

const emit = defineEmits(['close'])

const loading = ref(false)
const content = ref('')
const errorMessage = ref('')

const copy = {
  zh: {
    title: '产品信息',
    loading: '加载中...',
    error: '暂无产品信息',
    close: '关闭',
  },
  en: {
    title: 'Product Information',
    loading: 'Loading...',
    error: 'No product information available',
    close: 'Close',
  },
}

/** 加载 README 内容。
 *
 * @param {string} productId 产品 ID。
 * @returns {Promise<void>} 加载完成。
 */
const loadReadme = async (productId) => {
  if (!productId) {
    return
  }

  loading.value = true
  errorMessage.value = ''
  content.value = ''

  const result = await fetchProductReadme(productId)

  if (result.ok && result.content) {
    content.value = result.content
  } else {
    errorMessage.value = result.error || copy[props.language]?.error || copy.zh.error
  }

  loading.value = false
}

/** 处理 Escape 键关闭。
 *
 * @param {KeyboardEvent} event 键盘事件。
 */
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

watch(() => props.productId, (id) => {
  if (id) {
    loadReadme(id)
  }
}, { immediate: true })
</script>

<template>
  <Teleport to="body">
    <div
      class="readme-modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="productName || copy[language]?.title || copy.zh.title"
      @click.self="emit('close')"
      @keydown="handleKeydown"
    >
      <div class="readme-modal" data-readme-modal>
        <header class="readme-modal__header">
          <div>
            <h2>{{ productName || copy[language]?.title || copy.zh.title }}</h2>
          </div>
          <button
            type="button"
            class="readme-modal__close"
            :aria-label="copy[language]?.close || copy.zh.close"
            data-readme-close
            @click="emit('close')"
          >
            &times;
          </button>
        </header>

        <div class="readme-modal__body" data-readme-body>
          <div v-if="loading" class="readme-modal__state" data-readme-loading>
            <span>{{ copy[language]?.loading || copy.zh.loading }}</span>
          </div>

          <div v-else-if="errorMessage" class="readme-modal__state readme-modal__state--error" data-readme-error>
            <span>{{ errorMessage }}</span>
          </div>

          <MarkdownRenderer
            v-else-if="content"
            :source="content"
            data-readme-content
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
