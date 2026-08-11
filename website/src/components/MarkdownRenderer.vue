<script setup>
import DOMPurify from 'dompurify'
import katex from 'katex'
import { marked } from 'marked'
import { computed } from 'vue'

const props = defineProps({
  source: {
    type: String,
    default: '',
  },
})

/** 将 Markdown 中的公式替换为安全的 KaTeX HTML。
 *
 * @param {string} source Markdown 原文。
 * @returns {string} 清洗后的 HTML。
 */
const renderMarkdown = (source) => {
  const formulas = []
  const formulaSource = String(source || '').replace(
    /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g,
    (_match, block, inline) => {
      const index = formulas.length
      formulas.push({ value: block || inline, displayMode: Boolean(block) })
      return `KATEXFORMULA${index}TOKEN`
    },
  )
  const markdownHtml = marked.parse(formulaSource, { breaks: true, gfm: true })
  const cleanHtml = DOMPurify.sanitize(markdownHtml, {
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
    FORBID_TAGS: ['embed', 'iframe', 'object', 'script', 'style'],
  })

  return cleanHtml.replace(/KATEXFORMULA(\d+)TOKEN/g, (_match, index) => {
    const formula = formulas[Number(index)]
    try {
      return katex.renderToString(formula.value, {
        displayMode: formula.displayMode,
        throwOnError: false,
        strict: 'ignore',
      })
    } catch {
      return ''
    }
  })
}

const rendered = computed(() => renderMarkdown(props.source))
</script>

<template>
  <div class="markdown-renderer" v-html="rendered"></div>
</template>
