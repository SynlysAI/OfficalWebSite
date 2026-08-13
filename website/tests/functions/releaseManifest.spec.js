import { describe, expect, it, vi } from 'vitest'

import { onRequestGet } from '../../functions/api/release-manifest'

const RELEASE_POINTER_KEY = 'portal/v1/manifest.json'
const COLLECTION_FILE_MAP = {
  products: 'portal/v1/products.json',
  releases: 'portal/v1/releases.json',
  timeline: 'portal/v1/timeline.json',
  faqs: 'portal/v1/faqs.json',
  meta: 'portal/v1/meta.json',
}
const COLLECTION_RECORD_FIELD = {
  products: 'products',
  releases: 'releases',
  timeline: 'events',
  faqs: 'faqs',
}
const CACHE_CONTROL = 'public, max-age=300, stale-while-revalidate=3600'

/** 创建测试用消费端扁平 manifest。 */
const createManifest = () => ({
  schemaVersion: 1,
  generatedAt: '2026-08-11T00:00:00.000Z',
  products: [],
  releases: [],
  timeline: [],
  faqs: [],
  meta: { generatedAt: '2026-08-11T00:00:00.000Z' },
})

/** 将任意 JSON 值包装为带 text/etag 的 R2 对象替身。
 *
 * @param {unknown} value 待返回的 JSON 值。
 * @param {string} [etag] R2 对象 etag。
 * @returns {object} R2 对象替身。
 */
const wrapR2Object = (value, etag = '"manifest-etag"') => ({
  httpEtag: etag,
  text: vi.fn().mockResolvedValue(
    typeof value === 'string' ? value : JSON.stringify(value)
  ),
})

/** 根据消费端扁平 manifest 反推 R2 根指针与 5 个扁平副本。
 *
 * @param {object} [flatManifest] 消费端扁平 manifest。
 * @param {object} [overrides] 按 R2 key 注入 null / Error / 自定义对象，用于错误用例。
 * @returns {object} RELEASE_BUCKET 测试替身。
 */
const createBucket = (flatManifest = createManifest(), overrides = {}) => {
  const r2State = {
    [RELEASE_POINTER_KEY]: {
      schemaVersion: flatManifest.schemaVersion,
      generatedAt: flatManifest.generatedAt,
    },
    [COLLECTION_FILE_MAP.meta]: flatManifest.meta,
  }
  ;['products', 'releases', 'timeline', 'faqs'].forEach((name) => {
    r2State[COLLECTION_FILE_MAP[name]] = {
      schemaVersion: 1,
      [COLLECTION_RECORD_FIELD[name]]: flatManifest[name],
    }
  })
  return {
    get: vi.fn((key) => {
      if (key in overrides) {
        const override = overrides[key]
        if (override === null) {
          return Promise.resolve(null)
        }
        if (override instanceof Error) {
          return Promise.reject(override)
        }
        return Promise.resolve(wrapR2Object(override))
      }
      const value = r2State[key]
      if (value === undefined) {
        return Promise.resolve(null)
      }
      return Promise.resolve(wrapR2Object(value))
    }),
  }
}

describe('GET /api/release-manifest', () => {
  it('从根指针与 5 个扁平副本组装 manifest 并返回缓存头', async () => {
    const bucket = createBucket()

    const response = await onRequestGet({
      env: { RELEASE_BUCKET: bucket },
    })

    expect(bucket.get).toHaveBeenCalledWith(RELEASE_POINTER_KEY)
    Object.values(COLLECTION_FILE_MAP).forEach((key) => {
      expect(bucket.get).toHaveBeenCalledWith(key)
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    expect(response.headers.get('ETag')).toBe('"manifest-etag"')
    expect(response.headers.get('Cache-Control')).toBe(CACHE_CONTROL)
    await expect(response.json()).resolves.toEqual(createManifest())
  })

  it.each([
    ['R2 未绑定', {}],
    ['根指针对象缺失', { RELEASE_BUCKET: createBucket(createManifest(), { [RELEASE_POINTER_KEY]: null }) }],
    ['根指针读取失败', { RELEASE_BUCKET: createBucket(createManifest(), { [RELEASE_POINTER_KEY]: new Error('secret stack') }) }],
    ['根指针正文非法', { RELEASE_BUCKET: createBucket(createManifest(), { [RELEASE_POINTER_KEY]: '{invalid' }) }],
    ['集合副本缺失', { RELEASE_BUCKET: createBucket(createManifest(), { [COLLECTION_FILE_MAP.products]: null }) }],
    ['集合副本正文非法', { RELEASE_BUCKET: createBucket(createManifest(), { [COLLECTION_FILE_MAP.timeline]: '{invalid' }) }],
  ])('%s 时返回不泄漏异常的 503 JSON', async (label, env) => {
    const response = await onRequestGet({ env })
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    expect(body).toEqual({ error: '发布数据暂不可用' })
    expect(JSON.stringify(body)).not.toContain('secret stack')
    expect(body).not.toHaveProperty('stack')
  })

  it.each([
    ['根指针 schemaVersion 不兼容', { schemaVersion: 2 }],
    ['根指针 generatedAt 为空', { generatedAt: '' }],
    ['集合包含非法元素', { products: [null] }],
  ])('%s 时返回 503', async (label, patch) => {
    const manifest = { ...createManifest(), ...patch }
    const response = await onRequestGet({
      env: { RELEASE_BUCKET: createBucket(manifest) },
    })

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: '发布数据暂不可用',
    })
  })
})
