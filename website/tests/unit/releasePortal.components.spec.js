// @vitest-environment jsdom

import { mount, RouterLinkStub } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ProductMatrix from '../../src/components/ProductMatrix.vue'
import ReleaseProductGrid from '../../src/components/ReleaseProductGrid.vue'

/** 创建六产品测试数据。
 *
 * @returns {Array<object>} 产品列表。
 */
const createProducts = () => [
  { id: 'ai4ms', name: { zh: 'AI4MS', en: 'AI4MS' }, category: { zh: '平台', en: 'Platform' }, description: { zh: '统一入口', en: 'Unified entry' }, entryType: 'web', webUrl: 'https://example.com/ai4ms' },
  { id: 'spec-agent', name: { zh: 'Spec Agent', en: 'Spec Agent' }, category: { zh: '分析', en: 'Analysis' }, description: { zh: '谱图智能', en: 'Spectral intelligence' }, entryType: 'web', webUrl: 'https://example.com/spec' },
  { id: 'poly-agent', name: { zh: 'Poly Agent', en: 'Poly Agent' }, category: { zh: '材料', en: 'Materials' }, description: { zh: '材料研发', en: 'Materials R&D' }, entryType: 'web', webUrl: 'https://example.com/poly' },
  { id: 'speclabos', name: { zh: 'SpecLabOS', en: 'SpecLabOS' }, category: { zh: '实验', en: 'Lab' }, description: { zh: '实验系统', en: 'Lab systems' }, entryType: 'web', webUrl: 'https://example.com/lab' },
  { id: 'smartaccess', name: { zh: 'SmartAccess', en: 'SmartAccess' }, category: { zh: '接入', en: 'Access' }, description: { zh: '设备接入', en: 'Device access' }, entryType: 'download', webUrl: null },
  { id: 'rag-portal', name: { zh: 'RAG Portal', en: 'RAG Portal' }, category: { zh: '知识', en: 'Knowledge' }, description: { zh: '知识检索', en: 'Knowledge retrieval' }, entryType: 'web', webUrl: 'https://example.com/rag' },
]

const releases = [
  {
    id: 'spec-agent-v1.0.0',
    productId: 'spec-agent',
    tagName: 'v1.0.0',
    channel: 'stable',
    isLatestStable: true,
    publishedAt: '2026-08-10T00:00:00.000Z',
  },
]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ReleaseProductGrid', () => {
  it('按 manifest 顺序展示六产品及最新稳定版', () => {
    const wrapper = mount(ReleaseProductGrid, {
      props: { products: createProducts(), releases, language: 'zh' },
    })

    const cards = wrapper.findAll('[data-product-card]')
    expect(cards).toHaveLength(6)
    expect(cards.map((card) => card.attributes('data-product-card'))).toEqual([
      'ai4ms',
      'spec-agent',
      'poly-agent',
      'speclabos',
      'smartaccess',
      'rag-portal',
    ])
    expect(cards[1].text()).toContain('v1.0.0')
    expect(cards[0].get('a').attributes('href')).toBe('https://example.com/ai4ms')
  })

  it('下载入口只选择产品并跳到下载区', async () => {
    const wrapper = mount(ReleaseProductGrid, {
      props: { products: createProducts(), releases, language: 'zh' },
    })
    const downloadLink = wrapper.get('[data-download-product="smartaccess"]')

    expect(downloadLink.attributes('href')).toBe('#downloads')
    expect(downloadLink.attributes('tabindex')).not.toBe('-1')
    await downloadLink.trigger('click')

    expect(wrapper.emitted('select-product')).toEqual([['smartaccess']])
  })

  it('展示无版本状态并对未知入口给出错误徽标', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const products = createProducts()
    products[5] = { ...products[5], entryType: 'desktop' }

    const wrapper = mount(ReleaseProductGrid, {
      props: { products, releases, language: 'zh' },
    })

    expect(wrapper.get('[data-product-card="ai4ms"]').text()).toContain('暂无公开版本')
    expect(wrapper.get('[data-product-card="rag-portal"] [data-entry-error]').text()).toContain('入口待确认')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('desktop'))
  })
})

describe('ProductMatrix', () => {
  it('首页产品卡提供带产品筛选的发布动态入口', () => {
    const content = {
      eyebrow: '产品矩阵',
      title: '产品',
      summary: '摘要',
      releaseAction: '查看发布动态',
      cards: [{
        code: '01',
        productId: 'spec-agent',
        name: 'Spec Agent',
        category: '分析',
        description: '谱图智能',
        bullets: [],
        accent: 'blue',
      }],
      steps: [],
    }
    const wrapper = mount(ProductMatrix, {
      props: { content },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

    expect(wrapper.getComponent(RouterLinkStub).props('to')).toEqual({
      name: 'releases',
      query: { product: 'spec-agent' },
    })
    expect(wrapper.text()).toContain('查看发布动态')
  })
})
