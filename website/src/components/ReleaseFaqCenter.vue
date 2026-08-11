<script setup>
import { computed, reactive, ref } from 'vue'

import { releasePortalCopy } from '../data/releasePortal'
import MarkdownRenderer from './MarkdownRenderer.vue'
import { submitFaqFeedback } from '../services/faqFeedback'

const CATEGORY_VALUES = ['general', 'product', 'installation', 'science']

const props = defineProps({
  faqs: {
    type: Array,
    default: () => [],
  },
  products: {
    type: Array,
    default: () => [],
  },
  language: {
    type: String,
    default: 'zh',
  },
})

const emit = defineEmits(['select-timeline'])

const search = ref('')
const category = ref('')
const productId = ref('')
const version = ref('')
const feedback = reactive({})
const copy = computed(() => releasePortalCopy[props.language] || releasePortalCopy.zh)

/** 读取 FAQ 双语字段。
 *
 * @param {unknown} value 双语字段。
 * @returns {string} 当前语言文本。
 */
const localized = (value) => (
  typeof value === 'string' ? value : value?.[props.language] || value?.zh || ''
)

/** 将 Markdown 转为用于搜索的纯文本。
 *
 * @param {string} value Markdown 文本。
 * @returns {string} 小写纯文本。
 */
const searchable = (value) => String(value || '')
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/[#*_>`]/g, ' ')
  .toLocaleLowerCase()

/** 根据搜索词切分问题文本，避免把关键词拼进 HTML。
 *
 * @param {string} value 问题文本。
 * @returns {{ text: string, match: boolean }[]} 文本片段。
 */
const highlight = (value) => {
  const text = String(value || '')
  const keyword = search.value.trim()
  if (!keyword) {
    return [{ text, match: false }]
  }
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(${escaped})`, 'ig')
  return text.split(pattern).filter(Boolean).map((part) => ({
    text: part,
    match: part.toLocaleLowerCase() === keyword.toLocaleLowerCase(),
  }))
}

const filteredFaqs = computed(() => {
  const keyword = search.value.trim().toLocaleLowerCase()
  const selectedVersion = version.value.trim().toLocaleLowerCase()
  return props.faqs.filter((faq) => {
    const question = localized(faq.question)
    const answer = localized(faq.answerMarkdown)
    const matchesSearch = !keyword || searchable(`${question} ${answer}`).includes(keyword)
    const matchesCategory = !category.value || faq.category === category.value
    const matchesProduct = !productId.value || faq.productId === productId.value
    const matchesVersion = !selectedVersion
      || String(faq.versionRange || '').toLocaleLowerCase().includes(selectedVersion)
    return matchesSearch && matchesCategory && matchesProduct && matchesVersion
  })
})

/** 获取产品本地化名称。
 *
 * @param {object} product 产品记录。
 * @returns {string} 产品名称。
 */
const productName = (product) => (
  product?.name?.[props.language] || product?.name?.zh || product?.id || ''
)

/** 提交单条 FAQ 反馈并保留可恢复失败状态。
 *
 * @param {object} faq FAQ 记录。
 * @param {boolean} helpful 是否有帮助。
 * @returns {Promise<void>} 提交完成。
 */
const sendFeedback = async (faq, helpful) => {
  feedback[faq.id] = { pending: true }
  const result = await submitFaqFeedback({ faqId: faq.id, helpful })
  feedback[faq.id] = result.ok
    ? { pending: false, status: 'success', counts: result.counts }
    : { pending: false, status: 'error', error: result.error }
}

/** 切换到技术演进并请求定位关联事件。
 *
 * @param {MouseEvent} event 链接点击事件。
 * @param {string} timelineId 关联时间线事件 ID。
 */
const openTimeline = (event, timelineId) => {
  event.preventDefault()
  emit('select-timeline', timelineId)
}
</script>

<template>
  <section class="release-faq" aria-labelledby="release-faq-title">
    <div class="release-faq__head">
      <div>
        <span class="section-label">{{ language === 'en' ? 'SUPPORT' : '使用支持' }}</span>
        <h2 id="release-faq-title">{{ copy.faq.title }}</h2>
      </div>
      <input v-model="search" type="search" data-faq-search :placeholder="copy.faq.search" />
    </div>

    <div class="release-faq__filters">
      <label>
        <span>{{ copy.faq.category }}</span>
        <select v-model="category" data-faq-category>
          <option value="">{{ copy.faq.allCategories }}</option>
          <option v-for="item in CATEGORY_VALUES" :key="item" :value="item">
            {{ copy.faq.categories[item] }}
          </option>
        </select>
      </label>
      <label>
        <span>{{ copy.faq.product }}</span>
        <select v-model="productId" data-faq-product>
          <option value="">{{ copy.faq.allProducts }}</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ productName(product) }}
          </option>
        </select>
      </label>
      <label>
        <span>{{ copy.faq.version }}</span>
        <input v-model="version" data-faq-version :placeholder="copy.faq.versionPlaceholder" />
      </label>
    </div>

    <div v-if="filteredFaqs.length" class="release-faq__list">
      <details v-for="faq in filteredFaqs" :key="faq.id" class="release-faq-item" data-faq-item>
        <summary>
          <span v-for="(part, index) in highlight(localized(faq.question))" :key="index">
            <mark v-if="part.match">{{ part.text }}</mark>
            <span v-else>{{ part.text }}</span>
          </span>
          <span class="release-faq-item__category">{{ copy.faq.categories[faq.category] || faq.category }}</span>
        </summary>
        <div class="release-faq-item__body" data-faq-answer>
          <MarkdownRenderer :source="localized(faq.answerMarkdown)" />
          <nav v-if="faq.relatedTimelineIds?.length" class="release-faq-item__related" :aria-label="copy.faq.related">
            <a
              v-for="timelineId in faq.relatedTimelineIds"
              :key="timelineId"
              href="#evolution"
              :data-timeline-id="timelineId"
              data-faq-timeline-link
              @click="openTimeline($event, timelineId)"
            >
              {{ copy.faq.related }} · {{ timelineId }}
            </a>
          </nav>
          <div v-if="faq.feedbackEnabled" class="release-faq-item__feedback">
            <span>{{ copy.faq.helpfulQuestion }}</span>
            <button type="button" data-faq-helpful :disabled="feedback[faq.id]?.pending" @click="sendFeedback(faq, true)">
              {{ copy.faq.helpful }}
            </button>
            <button type="button" data-faq-unhelpful :disabled="feedback[faq.id]?.pending" @click="sendFeedback(faq, false)">
              {{ copy.faq.unhelpful }}
            </button>
            <span v-if="feedback[faq.id]?.status === 'success'" data-faq-feedback-status>
              {{ copy.faq.thanks }} ({{ feedback[faq.id].counts.helpful }}/{{ feedback[faq.id].counts.unhelpful }})
            </span>
            <span v-if="feedback[faq.id]?.status === 'error'" data-faq-feedback-error role="status">
              {{ copy.faq.feedbackError }}
              <a href="#faq">{{ copy.faq.support }}</a>
            </span>
          </div>
        </div>
      </details>
    </div>
    <div v-else class="release-state" data-faq-empty>{{ copy.faq.empty }}</div>
  </section>
</template>
