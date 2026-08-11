import { describe, expect, it, vi } from 'vitest'

import { onRequestGet } from '../../functions/api/release-manifest'

const MANIFEST_KEY = 'portal/v1/manifest.json'
const CACHE_CONTROL = 'public, max-age=300, stale-while-revalidate=3600'

/** 创建测试用 Release manifest。 */
const createManifest = () => ({
  schemaVersion: 1,
  generatedAt: '2026-08-11T00:00:00.000Z',
  products: [],
  releases: [],
  timeline: [],
  faqs: [],
  meta: {},
})

/** 创建包含 manifest 对象的 R2 测试替身。
 *
 * @param {object} manifest 待返回的 manifest。
 * @returns {object} R2 bucket 测试替身。
 */
const createBucket = (manifest = createManifest()) => ({
  get: vi.fn().mockResolvedValue({
    httpEtag: '"manifest-etag"',
    text: vi.fn().mockResolvedValue(JSON.stringify(manifest)),
  }),
})

describe('GET /api/release-manifest', () => {
  it('从固定 R2 key 读取 manifest 并返回缓存头', async () => {
    const bucket = createBucket()

    const response = await onRequestGet({
      env: { RELEASE_BUCKET: bucket },
    })

    expect(bucket.get).toHaveBeenCalledWith(MANIFEST_KEY)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    expect(response.headers.get('ETag')).toBe('"manifest-etag"')
    expect(response.headers.get('Cache-Control')).toBe(CACHE_CONTROL)
    await expect(response.json()).resolves.toEqual(createManifest())
  })

  it.each([
    ['R2 未绑定', {}, null],
    ['R2 对象缺失', { RELEASE_BUCKET: { get: vi.fn().mockResolvedValue(null) } }, null],
    ['R2 读取失败', { RELEASE_BUCKET: { get: vi.fn().mockRejectedValue(new Error('secret stack')) } }, null],
    ['manifest 正文非法', { RELEASE_BUCKET: {
      get: vi.fn().mockResolvedValue({
        httpEtag: '"invalid"',
        text: vi.fn().mockResolvedValue('{invalid'),
      }),
    } }, null],
  ])('%s 时返回不泄漏异常的 503 JSON', async (label, env) => {
    const response = await onRequestGet({ env })
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    expect(body).toEqual({ error: '发布数据暂不可用' })
    expect(JSON.stringify(body)).not.toContain('secret stack')
    expect(body).not.toHaveProperty('stack')
  })
})
