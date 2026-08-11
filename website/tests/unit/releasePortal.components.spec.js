// @vitest-environment jsdom

import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ProductMatrix from '../../src/components/ProductMatrix.vue'
import ReleaseDownloadCenter from '../../src/components/ReleaseDownloadCenter.vue'
import ReleaseFaqCenter from '../../src/components/ReleaseFaqCenter.vue'
import ReleaseFilters from '../../src/components/ReleaseFilters.vue'
import ReleaseProductGrid from '../../src/components/ReleaseProductGrid.vue'
import ReleaseTimeline from '../../src/components/ReleaseTimeline.vue'
import MarkdownRenderer from '../../src/components/MarkdownRenderer.vue'

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

const timelineEvents = [
  {
    id: 'release-v1',
    productId: 'spec-agent',
    level: 'release',
    occurredAt: '2026-08-10T00:00:00.000Z',
    version: 'v1.0.0',
    changeType: 'release',
    title: { zh: '正式发布', en: 'Stable release' },
    summary: { zh: '首个稳定版本', en: 'First stable version' },
    detailsMarkdown: { zh: '## 发布说明', en: '## Release notes' },
  },
  {
    id: 'commit-a',
    productId: 'spec-agent',
    level: 'commit',
    occurredAt: '2026-08-09T00:00:00.000Z',
    version: 'v1.0.0',
    changeType: 'feature',
    module: 'parser',
    title: { zh: '解析增强', en: 'Parser update' },
    summary: { zh: '新增解析能力', en: 'Added parsing support' },
    source: { shas: ['1234567890abcdef'] },
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
    expect(wrapper.get('.section-label').text()).toBe('产品概览')
    expect(wrapper.get('h2').text()).toBe('SynlysAI 产品与服务')
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

describe('ReleaseFilters', () => {
  it('默认里程碑并输出产品、日期、类型和全景组合状态', async () => {
    const wrapper = mount(ReleaseFilters, {
      props: {
        products: createProducts(),
        changeTypes: ['feature', 'fix'],
        language: 'zh',
        modelValue: {
          productId: '',
          dateFrom: '',
          dateTo: '',
          changeTypes: [],
          view: 'release',
        },
      },
    })

    expect(wrapper.get('[data-view="release"]').attributes('aria-pressed')).toBe('true')
    await wrapper.get('[data-product-filter]').setValue('spec-agent')
    await wrapper.setProps({ modelValue: { ...wrapper.emitted('update:modelValue')[0][0], dateFrom: '', dateTo: '', changeTypes: [], view: 'release' } })
    await wrapper.get('[data-date-from]').setValue('2026-08-01')
    await wrapper.setProps({ modelValue: { ...wrapper.emitted('update:modelValue').at(-1)[0], dateTo: '', changeTypes: [], view: 'release' } })
    await wrapper.get('[data-change-type="feature"]').setValue(true)
    await wrapper.setProps({ modelValue: { ...wrapper.emitted('update:modelValue').at(-1)[0] } })
    await wrapper.get('[data-view="panorama"]').trigger('click')

    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toEqual({
      productId: 'spec-agent',
      dateFrom: '2026-08-01',
      dateTo: '',
      changeTypes: ['feature'],
      view: 'panorama',
    })
  })
})

describe('ReleaseTimeline', () => {
  it('里程碑视图只展示 Release 节点', () => {
    const wrapper = mount(ReleaseTimeline, {
      props: {
        events: timelineEvents,
        releases,
        language: 'zh',
        view: 'release',
        title: '版本发布记录',
        targetId: 'release-v1',
      },
    })

    expect(wrapper.get('h2').text()).toBe('版本发布记录')
    expect(wrapper.get('[data-timeline-release="release-v1"]').attributes('id')).toBe('timeline-release-v1')
    expect(wrapper.get('[data-timeline-release="release-v1"]').classes()).toContain('is-targeted')
    expect(wrapper.findAll('[data-timeline-release]')).toHaveLength(1)
    expect(wrapper.find('[data-timeline-child]').exists()).toBe(false)
    expect(wrapper.text()).toContain('最新稳定版')
  })

  it('全景视图归组子节点并展开安全详情', async () => {
    const wrapper = mount(ReleaseTimeline, {
      props: { events: timelineEvents, releases, language: 'zh', view: 'panorama' },
    })

    expect(wrapper.get('[data-timeline-child]').text()).toContain('1234567')
    expect(wrapper.get('[data-release-details]').text()).toBe('查看版本说明')
    await wrapper.get('[data-release-details]').trigger('click')

    expect(wrapper.text()).toContain('发布说明')
    expect(wrapper.get('[data-release-details]').attributes('aria-expanded')).toBe('true')
  })

  it('没有匹配事件时显示明确空状态', () => {
    const wrapper = mount(ReleaseTimeline, {
      props: { events: [], releases: [], language: 'zh', view: 'release' },
    })

    expect(wrapper.get('[data-timeline-empty]').text()).toContain('暂无匹配的技术演进')
  })
})

describe('ReleaseDownloadCenter', () => {
  const downloadReleases = [
    {
      id: 'smartaccess-v2',
      productId: 'smartaccess',
      tagName: 'v2.0.0',
      channel: 'stable',
      isLatestStable: true,
      publishedAt: '2026-08-11T00:00:00.000Z',
      source: 'manual',
      assets: [
        {
          name: 'SmartAccess 2.0.exe',
          platform: 'windows',
          arch: 'x64',
          size: 1048576,
          sha256: 'abc123',
          downloadPath: 'smartaccess/v2.0.0/SmartAccess 2.0.exe',
        },
        {
          name: 'SmartAccess 2.0-arm64.dmg',
          platform: 'macos',
          arch: 'arm64',
          size: 2048,
          downloadPath: 'smartaccess/v2.0.0/SmartAccess 2.0-arm64.dmg',
        },
      ],
    },
    {
      id: 'smartaccess-v3-beta',
      productId: 'smartaccess',
      tagName: 'v3.0.0-beta.1',
      channel: 'preview',
      isLatestStable: false,
      publishedAt: '2026-08-12T00:00:00.000Z',
      assets: [{
        name: 'SmartAccess beta.exe',
        platform: 'windows',
        arch: 'x64',
        size: 512,
        sha256: 'beta123',
        downloadPath: 'smartaccess/v3.0.0-beta.1/SmartAccess beta.exe',
      }],
    },
  ]

  it('按产品分组并将最新稳定版置顶，标记预发布和手工来源', () => {
    const wrapper = mount(ReleaseDownloadCenter, {
      props: {
        products: createProducts(),
        releases: downloadReleases,
        language: 'zh',
      },
    })

    const versions = wrapper.findAll('[data-download-release]')
    expect(wrapper.get('h2').text()).toBe('版本与资源')
    expect(wrapper.findAll('[data-download-product]')).toHaveLength(1)
    expect(versions.map((node) => node.attributes('data-download-release'))).toEqual([
      'v2.0.0',
      'v3.0.0-beta.1',
    ])
    expect(versions[0].text()).toContain('最新稳定版')
    expect(versions[0].text()).toContain('手工发布')
    expect(versions[1].text()).toContain('预发布')
    expect(wrapper.get('.release-download-asset__actions > a').attributes('href')).toBe('#evolution')
  })

  it('按平台与架构筛选资源且下载只指向同域接口', async () => {
    const wrapper = mount(ReleaseDownloadCenter, {
      props: {
        products: createProducts(),
        releases: downloadReleases,
        language: 'zh',
      },
    })

    await wrapper.get('[data-download-platform]').setValue('macos')
    await wrapper.get('[data-download-arch]').setValue('arm64')

    const assets = wrapper.findAll('[data-download-asset]')
    expect(assets).toHaveLength(1)
    expect(assets[0].text()).toContain('2 KB')
    expect(assets[0].text()).toContain('未提供校验和')
    expect(assets[0].get('a[data-download-link]').attributes('href')).toBe(
      '/api/download/smartaccess/v2.0.0/SmartAccess%202.0-arm64.dmg',
    )
    expect(wrapper.html()).not.toContain('https://')
  })

  it('没有下载资源时展示明确空状态', () => {
    const wrapper = mount(ReleaseDownloadCenter, {
      props: {
        products: createProducts(),
        releases: [{ ...downloadReleases[0], assets: [] }],
        language: 'zh',
      },
    })

    expect(wrapper.get('[data-download-empty]').text()).toContain('暂无可下载版本')
  })

  it('下载地址无效时重试入口保持在资源下载 Tab', () => {
    const wrapper = mount(ReleaseDownloadCenter, {
      props: {
        products: createProducts(),
        releases: [{
          ...downloadReleases[0],
          assets: [{ name: 'invalid.zip', platform: 'windows', arch: 'x64' }],
        }],
        language: 'zh',
      },
    })

    expect(wrapper.get('.release-download-asset__error a').attributes('href')).toBe('#downloads')
  })
})

describe('MarkdownRenderer', () => {
  it('安全渲染 Markdown、代码块和 KaTeX，并移除危险 HTML', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: {
        source: '```js\nconst answer = 42\n```\n\n$E=mc^2$\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))',
      },
    })

    expect(wrapper.find('code').text()).toContain('const answer = 42')
    expect(wrapper.find('.katex').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('<script>')
    expect(wrapper.html()).not.toContain('javascript:')
  })
})

describe('ReleaseFaqCenter', () => {
  const faqs = [
    {
      id: 'install-help',
      productId: 'smartaccess',
      versionRange: '>=2.0.0',
      category: 'installation',
      question: { zh: '如何安装 SmartAccess？', en: 'How do I install SmartAccess?' },
      answerMarkdown: { zh: '运行安装包并重启。', en: 'Run the installer and restart.' },
      relatedTimelineIds: ['release-v1'],
      feedbackEnabled: true,
    },
    {
      id: 'science-help',
      productId: null,
      versionRange: null,
      category: 'science',
      question: { zh: '如何解释谱图？', en: 'How do I interpret a spectrum?' },
      answerMarkdown: { zh: '查看峰位和上下文。', en: 'Review peaks and context.' },
      relatedTimelineIds: [],
      feedbackEnabled: true,
    },
  ]

  it('支持模糊搜索、高亮、分类和产品筛选', async () => {
    const wrapper = mount(ReleaseFaqCenter, {
      props: { faqs, products: createProducts(), language: 'zh' },
    })

    expect(wrapper.findAll('[data-faq-item]')).toHaveLength(2)
    expect(wrapper.get('h2').text()).toBe('常见问题')
    await wrapper.get('[data-faq-search]').setValue('安装')
    expect(wrapper.findAll('[data-faq-item]')).toHaveLength(1)
    expect(wrapper.get('[data-faq-item]').find('mark').text()).toBe('安装')

    await wrapper.get('[data-faq-category]').setValue('science')
    expect(wrapper.findAll('[data-faq-item]')).toHaveLength(0)
    await wrapper.get('[data-faq-search]').setValue('')
    expect(wrapper.findAll('[data-faq-item]')).toHaveLength(1)
    await wrapper.get('[data-faq-product]').setValue('smartaccess')
    expect(wrapper.findAll('[data-faq-item]')).toHaveLength(0)
  })

  it('展开答案、显示关联时间线并处理有用/无用反馈的成功和失败', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ helpful: 1, unhelpful: 0 }), { status: 200 }))
      .mockRejectedValueOnce(new Error('offline'))
    const wrapper = mount(ReleaseFaqCenter, {
      props: { faqs, products: createProducts(), language: 'zh' },
    })

    await wrapper.get('[data-faq-item] summary').trigger('click')
    expect(wrapper.get('[data-faq-answer]').text()).toContain('运行安装包')
    expect(wrapper.get('[data-faq-timeline-link]').attributes('href')).toBe('#evolution')
    expect(wrapper.get('[data-faq-timeline-link]').text()).toContain('查看相关更新')
    await wrapper.get('[data-faq-timeline-link]').trigger('click')
    expect(wrapper.emitted('select-timeline')).toEqual([['release-v1']])
    await wrapper.get('[data-faq-helpful]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-faq-feedback-status]').text()).toContain('感谢反馈')
    await wrapper.get('[data-faq-unhelpful]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-faq-feedback-error]').text()).toContain('暂时无法提交')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
