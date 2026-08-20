<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { releasePortalCopy } from '../data/releasePortal'
import MarkdownRenderer from './MarkdownRenderer.vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  releases: {
    type: Array,
    default: () => [],
  },
  language: {
    type: String,
    default: 'zh',
  },
  view: {
    type: String,
    default: 'release',
  },
  title: {
    type: String,
    default: '',
  },
  targetId: {
    type: String,
    default: '',
  },
})

const expandedReleaseIds = ref(new Set())

/** 记录各发布节点正文是否超长（需要折叠）以及是否已展开。
 *
 * @type {import('vue').Ref<Record<string, { expandable: boolean, expanded: boolean }>>}
 */
const bodyStates = ref({})

/** 正文在折叠前允许显示的最大行数。
 *
 * @type {number}
 */
const CLAMP_LINES = 6

/** 获取事件的双语详情正文。
 *
 * @param {object} event 时间线事件。
 * @returns {string} 当前语言的 Markdown 正文。
 */
const detailsMarkdown = (event) => localized(event.detailsMarkdown)

/** 测量并记录每个发布节点正文是否超出折叠阈值。
 *
 * @returns {Promise<void>} 测量完成的异步工作。
 */
const measureBodies = async () => {
  await nextTick()
  const next = { ...bodyStates.value }
  const bodyEls = document.querySelectorAll('[data-release-body]')
  bodyEls.forEach((el) => {
    const eventId = el.getAttribute('data-release-body')
    if (!eventId) {
      return
    }
    const clampedHeight = parseFloat(getComputedStyle(el).lineHeight) * CLAMP_LINES
    const expandable = el.scrollHeight > Math.ceil(clampedHeight + 1)
    const current = next[eventId] || { expandable: false, expanded: false }
    if (current.expandable !== expandable) {
      next[eventId] = { expandable, expanded: current.expanded && expandable }
    }
  })
  bodyStates.value = next
}

/** 在事件或语言变化后重新测量正文高度。
 */
watch(
  () => [props.events, props.language],
  () => { measureBodies() },
  { flush: 'post', immediate: true, deep: true },
)

/** 切换单个发布节点正文的展开状态。
 *
 * @param {string} eventId Release 事件 ID。
 */
const toggleRelease = (eventId) => {
  const state = bodyStates.value[eventId]
  if (!state) {
    return
  }
  bodyStates.value = {
    ...bodyStates.value,
    [eventId]: { ...state, expanded: !state.expanded },
  }
}
const copy = computed(() => releasePortalCopy[props.language] || releasePortalCopy.zh)

/** 读取双语字段。
 *
 * @param {unknown} value 双语值。
 * @returns {string} 当前语言文本。
 */
const localized = (value) => {
  if (typeof value === 'string') {
    return value
  }
  return value?.[props.language] || value?.zh || ''
}

/** 格式化事件日期。
 *
 * @param {string} value ISO 日期。
 * @returns {string} 本地化日期。
 */
const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat(props.language === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/** 获取子节点中的短提交哈希。
 *
 * @param {object} event 时间线事件。
 * @returns {string[]} 短 SHA 列表。
 */
const shortShas = (event) => {
  const shas = Array.isArray(event?.source?.shas)
    ? event.source.shas
    : [event?.source?.sha].filter(Boolean)
  return shas.map((sha) => String(sha).slice(0, 7))
}

/** 获取变更类型的安全标签。
 *
 * @param {unknown} changeType manifest 变更类型。
 * @returns {string} 双语标签或通用标签。
 */
const changeTypeLabel = (changeType) => {
  const label = copy.value.changeTypes[changeType]
  if (label) {
    return label
  }
  console.warn(`[ReleaseTimeline] 未知 changeType: ${String(changeType)}`)
  return props.language === 'en' ? 'Change' : '变更'
}

/** 获取事件层级标签，并兼容未知枚举。
 *
 * @param {unknown} level manifest 事件层级。
 * @returns {string} 层级标签。
 */
const levelLabel = (level) => {
  const labels = props.language === 'en'
    ? { aggregate: 'Aggregate', commit: 'Commit' }
    : { aggregate: '聚合', commit: 'Commit' }
  if (labels[level]) {
    return labels[level]
  }
  console.warn(`[ReleaseTimeline] 未知 level: ${String(level)}`)
  return props.language === 'en' ? 'Change' : '变更'
}

const visibleEvents = computed(() => props.events.filter((event) => (
  event && typeof event === 'object'
  && (props.view === 'panorama' || event.level === 'release')
)))

const releaseEvents = computed(() => visibleEvents.value.filter((event) => event.level === 'release'))

const groups = computed(() => releaseEvents.value.map((event) => ({
  event,
  release: props.releases.find((release) => (
    release?.productId === event.productId
    && release?.version === event.version
  )) || null,
  children: props.view === 'panorama'
    ? visibleEvents.value.filter((child) => (
        child.level !== 'release'
        && child.productId === event.productId
        && child.version === event.version
      ))
    : [],
})))

const orphanEvents = computed(() => {
  if (props.view !== 'panorama') {
    return []
  }
  const groupedIds = new Set(groups.value.flatMap((group) => group.children.map((event) => event.id)))
  return visibleEvents.value.filter((event) => event.level !== 'release' && !groupedIds.has(event.id))
})
</script>

<template>
  <section class="release-timeline-section" aria-labelledby="release-timeline-title">
    <div class="release-timeline-section__head">
      <span class="section-label">{{ language === 'en' ? 'PRODUCT UPDATES' : '产品更新' }}</span>
      <h2 id="release-timeline-title">{{ title || copy.timeline.title }}</h2>
    </div>

    <div v-if="groups.length || orphanEvents.length" class="release-timeline">
      <article
        v-for="group in groups"
        :key="group.event.id"
        :id="`timeline-${group.event.id}`"
        class="release-timeline__group"
        :class="{
          'has-children': group.children.length,
          'is-targeted': targetId === group.event.id,
        }"
        :data-timeline-release="group.event.id"
      >
        <div class="release-timeline__rail" aria-hidden="true"></div>
        <div class="release-node">
          <div class="release-node__meta">
            <span>{{ formatDate(group.event.occurredAt) }}</span>
            <span>{{ group.event.productId }}</span>
          </div>
          <div class="release-node__title-row">
            <div>
              <span class="release-node__version">{{ group.event.version }}</span>
              <h3>{{ localized(group.event.title) }}</h3>
            </div>
            <span v-if="group.release?.isLatestStable" class="release-node__latest">{{ copy.timeline.latest }}</span>
          </div>
          <p>{{ localized(group.event.summary) }}</p>

          <div
            v-if="detailsMarkdown(group.event)"
            class="release-node__body"
            :class="{ 'is-clamped': !bodyStates[group.event.id]?.expanded }"
            :data-release-body="group.event.id"
          >
            <MarkdownRenderer :source="detailsMarkdown(group.event)" />
          </div>

          <div class="release-node__actions">
            <a href="#downloads">{{ copy.timeline.downloads }}</a>
            <button
              v-if="bodyStates[group.event.id]?.expandable"
              type="button"
              data-release-toggle
              :aria-expanded="Boolean(bodyStates[group.event.id]?.expanded)"
              @click="toggleRelease(group.event.id)"
            >
              {{ bodyStates[group.event.id]?.expanded ? copy.timeline.collapse : copy.timeline.expand }}
            </button>
          </div>
        </div>

        <div v-if="group.children.length" class="release-timeline__children">
          <details
            v-for="child in group.children"
            :key="child.id"
            :id="`timeline-${child.id}`"
            class="release-child-node"
            :class="{ 'is-targeted': targetId === child.id }"
            data-timeline-child
            open
          >
            <summary>
              <span>{{ child.productId }}</span>
              <span>{{ formatDate(child.occurredAt) }}</span>
              <span>{{ changeTypeLabel(child.changeType) }}</span>
              <span>{{ levelLabel(child.level) }}</span>
              <strong>{{ localized(child.title) }}</strong>
              <span v-if="child.module">{{ child.module }}</span>
            </summary>
            <p>{{ localized(child.summary) }}</p>
            <div class="release-child-node__meta">
              <span v-if="child.source?.count">{{ child.source.count }}</span>
              <code v-for="sha in shortShas(child)" :key="sha">{{ sha }}</code>
            </div>
          </details>
        </div>
      </article>

      <details
        v-for="event in orphanEvents"
        :key="event.id"
        :id="`timeline-${event.id}`"
        class="release-child-node release-child-node--orphan"
        :class="{ 'is-targeted': targetId === event.id }"
        data-timeline-child
        open
      >
        <summary>
          <span>{{ event.productId }}</span>
          <span>{{ formatDate(event.occurredAt) }}</span>
          <span>{{ changeTypeLabel(event.changeType) }}</span>
          <span>{{ levelLabel(event.level) }}</span>
          <strong>{{ localized(event.title) }}</strong>
        </summary>
        <p>{{ localized(event.summary) }}</p>
      </details>
    </div>

    <div v-else class="release-state" data-timeline-empty>
      {{ copy.timeline.empty }}
    </div>
  </section>
</template>
