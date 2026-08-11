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
  vi.unstubAllGlobals()
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

  it('将筛选变化写入 URL query 并可刷新恢复', async () => {
    const manifest = {
      schemaVersion: 1,
      generatedAt: '2026-08-11T00:00:00.000Z',
      products: [{
        id: 'spec-agent',
        name: { zh: 'Spec Agent', en: 'Spec Agent' },
        entryType: 'web',
        webUrl: 'https://example.com/spec',
      }],
      releases: [],
      timeline: [
        {
          id: 'release-v1',
          productId: 'spec-agent',
          level: 'release',
          occurredAt: '2026-08-10T00:00:00.000Z',
          version: 'v1.0.0',
          changeType: 'release',
          title: { zh: '发布', en: 'Release' },
          summary: { zh: '摘要', en: 'Summary' },
        },
        {
          id: 'commit-v1',
          productId: 'spec-agent',
          level: 'commit',
          occurredAt: '2026-08-09T00:00:00.000Z',
          version: 'v1.0.0',
          changeType: 'feature',
          title: { zh: '功能', en: 'Feature' },
          summary: { zh: '功能摘要', en: 'Feature summary' },
        },
      ],
      faqs: [],
      meta: {},
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify(manifest),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )))
    const router = createTestRouter()
    await router.push('/releases')
    await router.isReady()
    const wrapper = mount(ReleasePortalView, {
      global: { plugins: [router] },
    })
    await flushPromises()

    await wrapper.get('[data-product-filter]').setValue('spec-agent')
    await flushPromises()
    await wrapper.get('[data-date-from]').setValue('2026-08-01')
    await flushPromises()
    await wrapper.get('[data-change-type="feature"]').setValue(true)
    await flushPromises()
    await wrapper.get('[data-view="panorama"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({
      product: 'spec-agent',
      from: '2026-08-01',
      types: 'feature',
      view: 'panorama',
    })
    expect(wrapper.findAll('[data-timeline-release]')).toHaveLength(1)
    expect(wrapper.findAll('[data-timeline-child]')).toHaveLength(1)

    const refreshedRouter = createTestRouter()
    await refreshedRouter.push(router.currentRoute.value.fullPath)
    await refreshedRouter.isReady()
    expect(refreshedRouter.currentRoute.value.query).toEqual(router.currentRoute.value.query)
    wrapper.unmount()
  })
})
