import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { releasePortalFallback } from '../../src/data/releasePortalFallback'
import {
  fetchReleaseManifest,
  filterTimeline,
  formatDownloadUrl,
  getLatestStableRelease,
} from '../../src/services/releasePortal'

const createManifest = (overrides = {}) => ({
  schemaVersion: 1,
  generatedAt: '2026-08-10T08:00:00.000Z',
  products: [],
  releases: [],
  timeline: [],
  faqs: [],
  meta: {
    sourceWatermarks: {},
    collectionHashes: {},
  },
  ...overrides,
})

describe('fetchReleaseManifest', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('从同域接口成功读取 schemaVersion=1 的 manifest', async () => {
    const manifest = createManifest()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(manifest),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchReleaseManifest()

    expect(fetchMock).toHaveBeenCalledWith('/api/release-manifest', expect.objectContaining({
      headers: {
        Accept: 'application/json',
      },
      signal: expect.any(AbortSignal),
    }))
    expect(result).toEqual({
      ok: true,
      manifest,
      error: null,
    })
  })

  it('HTTP 非 2xx 时返回带状态码的可诊断错误和 fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))

    const result = await fetchReleaseManifest()

    expect(result).toEqual({
      ok: false,
      manifest: releasePortalFallback,
      error: {
        code: 'HTTP_ERROR',
        message: '发布数据请求失败',
        status: 503,
      },
    })
    expect(result.error).not.toHaveProperty('stack')
  })

  it('Schema 版本不兼容时返回可判别错误和 fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(createManifest({ schemaVersion: 2 })),
    }))

    const result = await fetchReleaseManifest()

    expect(result.ok).toBe(false)
    expect(result.manifest).toBe(releasePortalFallback)
    expect(result.error).toEqual({
      code: 'UNSUPPORTED_SCHEMA_VERSION',
      message: '发布数据版本不受支持',
    })
  })

  it.each(['products', 'releases', 'timeline', 'faqs'])(
    '缺少 %s 数组时返回无效 manifest 错误和 fallback',
    async (field) => {
      const manifest = createManifest()
      delete manifest[field]
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(manifest),
      }))

      const result = await fetchReleaseManifest()

      expect(result.ok).toBe(false)
      expect(result.manifest).toBe(releasePortalFallback)
      expect(result.error).toEqual({
        code: 'INVALID_MANIFEST',
        message: '发布数据格式无效',
      })
    },
  )

  it.each(
    ['products', 'releases', 'timeline', 'faqs'].flatMap((field) => [
      [field, null],
      [field, []],
      [field, {}],
      [field, 'invalid'],
    ]),
  )('%s 包含非法集合元素时返回 Schema 错误和 fallback', async (field, invalidElement) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(createManifest({
        [field]: [invalidElement],
      })),
    }))

    const result = await fetchReleaseManifest()

    expect(result).toEqual({
      ok: false,
      manifest: releasePortalFallback,
      error: {
        code: 'SCHEMA_INVALID',
        message: '发布数据集合元素无效',
      },
    })
  })

  it('请求超过 8 秒时中止请求并返回超时错误和 fallback', async () => {
    const fetchMock = vi.fn((url, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        reject(new DOMException('请求已中止', 'AbortError'))
      }, { once: true })
    }))
    vi.stubGlobal('fetch', fetchMock)

    const pendingResult = fetchReleaseManifest()
    await vi.advanceTimersByTimeAsync(8000)
    const result = await pendingResult

    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true)
    expect(result).toEqual({
      ok: false,
      manifest: releasePortalFallback,
      error: {
        code: 'TIMEOUT',
        message: '发布数据请求超时',
      },
    })
  })

  it('调用方的 AbortSignal 中止请求时返回中止错误', async () => {
    const controller = new AbortController()
    vi.stubGlobal('fetch', vi.fn((url, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        reject(new DOMException('请求已中止', 'AbortError'))
      }, { once: true })
    })))

    const pendingResult = fetchReleaseManifest({ signal: controller.signal })
    controller.abort()
    const result = await pendingResult

    expect(result.error).toEqual({
      code: 'ABORTED',
      message: '发布数据请求已取消',
    })
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('filterTimeline', () => {
  const events = [
    {
      id: 'release-a',
      productId: 'spec-agent',
      level: 'release',
      occurredAt: '2026-07-01T00:00:00.000Z',
      changeType: 'release',
    },
    {
      id: 'commit-a',
      productId: 'spec-agent',
      level: 'commit',
      occurredAt: '2026-07-31T23:59:59.000Z',
      changeType: 'fix',
    },
    {
      id: 'release-b',
      productId: 'poly-agent',
      level: 'release',
      occurredAt: '2026-08-01T00:00:00.000Z',
      changeType: 'feature',
    },
  ]

  it('默认只返回 release 层级并按时间倒序排列', () => {
    expect(filterTimeline(events, {}).map(({ id }) => id)).toEqual([
      'release-b',
      'release-a',
    ])
  })

  it('panorama 视图组合筛选产品、双端包含日期和变更类型', () => {
    const result = filterTimeline(events, {
      productId: 'spec-agent',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
      changeTypes: ['fix'],
      view: 'panorama',
    })

    expect(result.map(({ id }) => id)).toEqual(['commit-a'])
  })

  it('日期范围筛选包含起始和结束日期的双端边界', () => {
    const boundaryEvents = [
      { id: 'before', productId: 'ai4ms', level: 'release', occurredAt: '2026-06-30T23:59:59.000Z', changeType: 'fix' },
      { id: 'start', productId: 'ai4ms', level: 'release', occurredAt: '2026-07-01T00:00:00.000Z', changeType: 'fix' },
      { id: 'inside', productId: 'ai4ms', level: 'release', occurredAt: '2026-07-15T12:00:00.000Z', changeType: 'fix' },
      { id: 'end', productId: 'ai4ms', level: 'release', occurredAt: '2026-07-31T23:59:59.999Z', changeType: 'fix' },
      { id: 'after', productId: 'ai4ms', level: 'release', occurredAt: '2026-08-01T00:00:00.000Z', changeType: 'fix' },
    ]

    const result = filterTimeline(boundaryEvents, {
      productId: 'ai4ms',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
      changeTypes: ['fix'],
    })

    expect(result.map(({ id }) => id)).toEqual(['end', 'inside', 'start'])
  })

  it('忽略异常元素和发生时间字段无效的事件', () => {
    const validEvent = {
      id: 'valid',
      productId: 'ai4ms',
      level: 'release',
      occurredAt: '2026-07-15T12:00:00.000Z',
      changeType: 'fix',
    }

    expect(() => filterTimeline([
      null,
      [],
      'invalid',
      42,
      { ...validEvent, id: 'invalid-date', occurredAt: 42 },
      validEvent,
    ], {
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
      view: 'panorama',
    })).not.toThrow()

    expect(filterTimeline([
      null,
      [],
      'invalid',
      42,
      { ...validEvent, id: 'invalid-date', occurredAt: 42 },
      validEvent,
    ], {
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
      view: 'panorama',
    })).toEqual([validEvent])
  })
})

describe('getLatestStableRelease', () => {
  it('返回指定产品最新的稳定版本并忽略预发布版本', () => {
    const releases = [
      { id: 'stable-old', productId: 'ai4ms', channel: 'stable', publishedAt: '2026-05-01' },
      { id: 'preview-new', productId: 'ai4ms', channel: 'preview', publishedAt: '2026-08-01' },
      { id: 'stable-new', productId: 'ai4ms', channel: 'stable', publishedAt: '2026-07-01' },
      { id: 'other', productId: 'spec-agent', channel: 'stable', publishedAt: '2026-08-10' },
    ]

    expect(getLatestStableRelease(releases, 'ai4ms')?.id).toBe('stable-new')
    expect(getLatestStableRelease(releases, 'missing')).toBeNull()
  })

  it('忽略异常元素和发布时间字段无效的版本', () => {
    const validRelease = {
      id: 'stable',
      productId: 'ai4ms',
      channel: 'stable',
      publishedAt: '2026-07-01T00:00:00.000Z',
    }

    expect(() => getLatestStableRelease([
      null,
      [],
      'invalid',
      42,
      { ...validRelease, id: 'invalid-date', publishedAt: null },
      validRelease,
    ], 'ai4ms')).not.toThrow()
    expect(getLatestStableRelease([
      null,
      [],
      'invalid',
      42,
      { ...validRelease, id: 'invalid-date', publishedAt: null },
      validRelease,
    ], 'ai4ms')).toBe(validRelease)
  })
})

describe('formatDownloadUrl', () => {
  it('将相对 downloadPath 转换为同域下载接口地址', () => {
    expect(formatDownloadUrl({
      downloadPath: 'smartaccess/v1.0.0/SmartAccess setup.exe',
    })).toBe('/api/download/smartaccess/v1.0.0/SmartAccess%20setup.exe')
  })

  it.each([
    'https://example.com/file.zip',
    '//example.com/file.zip',
    '/smartaccess/v1/file.zip',
    'smartaccess/../secret.txt',
    'smartaccess/%2e%2e/secret.txt',
    'smartaccess\\v1\\file.zip',
  ])('拒绝不安全的 downloadPath：%s', (downloadPath) => {
    expect(() => formatDownloadUrl({ downloadPath })).toThrow('无效的下载路径')
  })
})
