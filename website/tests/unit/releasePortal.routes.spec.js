// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'

import App from '../../src/App.vue'
import { setLanguage } from '../../src/composables/useLanguage'
import { createAppRouter } from '../../src/router'
import ReleasePortalView from '../../src/views/ReleasePortalView.vue'

/** 创建使用内存历史的测试路由。
 *
 * @returns {import('vue-router').Router} 测试路由实例。
 */
const createTestRouter = () => createAppRouter(createMemoryHistory())

beforeEach(() => {
  window.scrollTo = vi.fn()
})

afterEach(() => {
  setLanguage('zh')
})

describe('Release Portal 路由', () => {
  it('在 /releases 渲染 Portal 并恢复 URL 筛选状态', async () => {
    const router = createTestRouter()
    await router.push('/releases?product=spec-agent&view=panorama')
    await router.isReady()

    const wrapper = mount(ReleasePortalView, {
      global: { plugins: [router] },
    })

    expect(router.currentRoute.value.name).toBe('releases')
    expect(wrapper.attributes('data-product')).toBe('spec-agent')
    expect(wrapper.attributes('data-view')).toBe('panorama')
  })

  it('将 /changelog 及其 query 重定向到 /releases', async () => {
    const router = createTestRouter()
    await router.push('/changelog?product=poly-agent&view=panorama')
    await router.isReady()

    expect(router.currentRoute.value).toMatchObject({
      name: 'releases',
      query: {
        product: 'poly-agent',
        view: 'panorama',
      },
    })
  })

  it('语言切换后立即更新 Release Portal 页面标题', async () => {
    const router = createTestRouter()
    await router.push('/releases')
    await router.isReady()
    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    expect(document.title).toBe('发布中心 | SynlysAI')

    setLanguage('en')
    await flushPromises()

    expect(document.title).toBe('Release Portal | SynlysAI')
    wrapper.unmount()
  })
})
