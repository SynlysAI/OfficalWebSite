<script setup>
import { computed } from 'vue'

import { releasePortalCopy } from '../data/releasePortal'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  changeTypes: {
    type: Array,
    default: () => [],
  },
  language: {
    type: String,
    default: 'zh',
  },
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const copy = computed(() => releasePortalCopy[props.language] || releasePortalCopy.zh)

/** 读取产品的本地化名称。
 *
 * @param {object} product 产品记录。
 * @returns {string} 当前语言的产品名。
 */
const productName = (product) => (
  product?.name?.[props.language] || product?.name?.zh || product?.id || ''
)

/** 合并并输出下一组筛选条件。
 *
 * @param {object} patch 待更新的筛选字段。
 */
const updateFilters = (patch) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

/** 切换变更类型多选项。
 *
 * @param {string} changeType 变更类型。
 * @param {boolean} checked 是否选中。
 */
const toggleChangeType = (changeType, checked) => {
  const selected = new Set(props.modelValue.changeTypes || [])
  if (checked) {
    selected.add(changeType)
  } else {
    selected.delete(changeType)
  }
  updateFilters({ changeTypes: Array.from(selected) })
}
</script>

<template>
  <section class="release-filters" aria-labelledby="release-filters-title">
    <div class="release-filters__heading">
      <h2 id="release-filters-title">{{ copy.filters.title }}</h2>
      <div class="release-view-switch" role="group" :aria-label="copy.filters.view">
        <button
          v-for="view in ['release', 'panorama']"
          :key="view"
          type="button"
          :data-view="view"
          :aria-pressed="modelValue.view === view"
          :class="{ 'is-active': modelValue.view === view }"
          @click="updateFilters({ view })"
        >
          {{ copy.views[view] }}
        </button>
      </div>
    </div>

    <div class="release-filters__controls">
      <label class="release-filter-field">
        <span>{{ copy.filters.product }}</span>
        <select
          data-product-filter
          :value="modelValue.productId"
          @change="updateFilters({ productId: $event.target.value })"
        >
          <option value="">{{ copy.filters.allProducts }}</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ productName(product) }}
          </option>
        </select>
      </label>

      <label class="release-filter-field">
        <span>{{ copy.filters.dateFrom }}</span>
        <input
          type="date"
          data-date-from
          :value="modelValue.dateFrom"
          @input="updateFilters({ dateFrom: $event.target.value })"
        />
      </label>

      <label class="release-filter-field">
        <span>{{ copy.filters.dateTo }}</span>
        <input
          type="date"
          data-date-to
          :value="modelValue.dateTo"
          @input="updateFilters({ dateTo: $event.target.value })"
        />
      </label>
    </div>

    <fieldset class="release-change-types">
      <legend>{{ copy.filters.changeTypes }}</legend>
      <label v-for="changeType in changeTypes" :key="changeType">
        <input
          type="checkbox"
          :data-change-type="changeType"
          :checked="modelValue.changeTypes.includes(changeType)"
          @change="toggleChangeType(changeType, $event.target.checked)"
        />
        <span>{{ copy.changeTypes[changeType] || changeType }}</span>
      </label>
    </fieldset>
  </section>
</template>
