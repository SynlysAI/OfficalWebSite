import { describe, expect, it, vi } from 'vitest'

import { onRequestGet } from '../../functions/api/download/[[path]]'

const MANIFEST_KEY = 'portal/v1/manifest.json'
const ASSET_PATH = 'smartaccess/v1.2.3/SmartAccess 安装包.exe'

/** 创建包含一个下载资源的 Release manifest。
 *
 * @param {object} assetOverrides 资源字段覆盖值。
 * @returns {object} Release manifest。
 */
const createManifest = (assetOverrides = {}) => ({
  schemaVersion: 1,
  generatedAt: '2026-08-11T00:00:00.000Z',
  products: [{ id: 'smartaccess' }],
  releases: [{
    productId: 'smartaccess',
    tagName: 'v1.2.3',
    assets: [{
      name: 'SmartAccess 安装包.exe',
      downloadPath: ASSET_PATH,
      contentType: 'application/vnd.microsoft.portable-executable',
      size: 7,
      ...assetOverrides,
    }],
  }],
  timeline: [],
  faqs: [],
  meta: {},
})

/** 创建同时提供 manifest 与下载对象的 R2 测试替身。
 *
 * @param {object} options 测试替身选项。
 * @param {object} options.manifest Release manifest。
 * @param {object|null} options.asset 下载对象。
 * @returns {object} R2 bucket 测试替身。
 */
const createBucket = ({
  manifest = createManifest(),
  asset = { body: 'payload', size: 7 },
} = {}) => ({
  get: vi.fn(async (key) => {
    if (key === MANIFEST_KEY) {
      return {
        text: vi.fn().mockResolvedValue(JSON.stringify(manifest)),
      }
    }

    if (key === ASSET_PATH) {
      return asset
    }

    return null
  }),
})

/** 创建下载接口请求上下文。
 *
 * @param {string} rawPath URL 中未经解码的三段路径。
 * @param {object} bucket R2 bucket 测试替身。
 * @returns {object} Pages Function 请求上下文。
 */
const createContext = (rawPath, bucket = createBucket()) => ({
  request: new Request(`https://example.com/api/download/${rawPath}`),
  env: { RELEASE_BUCKET: bucket },
  params: { path: rawPath.split('/') },
})

describe('GET /api/download/[[path]]', () => {
  it.each([
    'smartaccess/v1.2.3',
    'smartaccess/v1.2.3/file.exe/extra',
    'smartaccess/%2e%2e/file.exe',
    'smartaccess/v1.2.3%2Fhidden/file.exe',
    'smartaccess/v1.2.3%5Chidden/file.exe',
    'smartaccess\\v1.2.3\\file.exe',
    'smartaccess/%E0%A4%A/file.exe',
  ])('拒绝非法下载路径且不读取任意 R2 key：%s', async (rawPath) => {
    const bucket = createBucket()

    const response = await onRequestGet(createContext(rawPath, bucket))

    expect(response.status).toBe(400)
    expect(bucket.get).not.toHaveBeenCalled()
  })

  it.each([
    ['未知产品', 'unknown/v1.2.3/SmartAccess%20%E5%AE%89%E8%A3%85%E5%8C%85.exe'],
    ['未知版本', 'smartaccess/v9.9.9/SmartAccess%20%E5%AE%89%E8%A3%85%E5%8C%85.exe'],
    ['未知文件', 'smartaccess/v1.2.3/unknown.exe'],
  ])('%s 返回 404 且不读取用户构造的资源 key', async (label, rawPath) => {
    const bucket = createBucket()

    const response = await onRequestGet(createContext(rawPath, bucket))

    expect(response.status).toBe(404)
    expect(bucket.get).toHaveBeenCalledTimes(1)
    expect(bucket.get).toHaveBeenCalledWith(MANIFEST_KEY)
  })

  it('manifest 中已知资源在 R2 缺失时返回 404', async () => {
    const bucket = createBucket({ asset: null })

    const response = await onRequestGet(createContext(
      'smartaccess/v1.2.3/SmartAccess%20%E5%AE%89%E8%A3%85%E5%8C%85.exe',
      bucket,
    ))

    expect(response.status).toBe(404)
    expect(bucket.get).toHaveBeenNthCalledWith(2, ASSET_PATH)
  })

  it('从 manifest 受信路径读取资源并返回不可变下载响应头', async () => {
    const bucket = createBucket()

    const response = await onRequestGet(createContext(
      'smartaccess/v1.2.3/SmartAccess%20%E5%AE%89%E8%A3%85%E5%8C%85.exe',
      bucket,
    ))

    expect(response.status).toBe(200)
    expect(bucket.get).toHaveBeenNthCalledWith(2, ASSET_PATH)
    expect(response.headers.get('Content-Type')).toBe(
      'application/vnd.microsoft.portable-executable',
    )
    expect(response.headers.get('Content-Length')).toBe('7')
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000, immutable',
    )
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="SmartAccess ___.exe"; '
      + "filename*=UTF-8''SmartAccess%20%E5%AE%89%E8%A3%85%E5%8C%85.exe",
    )
    await expect(response.text()).resolves.toBe('payload')
  })

  it('清理 Content-Disposition 中的引号和 CRLF 以阻止响应头注入', async () => {
    const dangerousName = 'setup"\r\nX-Injected: yes.exe'
    const bucket = createBucket({
      manifest: createManifest({ name: dangerousName }),
    })

    const response = await onRequestGet(createContext(
      'smartaccess/v1.2.3/SmartAccess%20%E5%AE%89%E8%A3%85%E5%8C%85.exe',
      bucket,
    ))
    const disposition = response.headers.get('Content-Disposition')

    expect(response.status).toBe(200)
    expect(disposition).toContain('attachment; filename="setup_X-Injected: yes.exe"')
    expect(disposition).not.toContain('\r')
    expect(disposition).not.toContain('\n')
    expect(response.headers.has('X-Injected')).toBe(false)
  })
})
