import { loadReleaseManifest } from '../../_shared/release-manifest'

const DOWNLOAD_PATH_PREFIX = '/api/download/'
const DOWNLOAD_CACHE_CONTROL = 'public, max-age=31536000, immutable'

/** 创建 JSON 错误响应。
 *
 * @param {string} error 对外错误信息。
 * @param {number} status HTTP 状态码。
 * @returns {Response} JSON 错误响应。
 */
const errorResponse = (error, status) => Response.json({ error }, { status })

/** 从请求 URL 解析安全的三段下载路径。
 *
 * @param {Request} request 下载请求。
 * @param {object} params Pages Functions 路由参数。
 * @returns {{ productId: string, version: string, assetName: string, path: string }|null} 解析结果。
 */
const parseDownloadPath = (request, params) => {
  const routePath = params?.path
  const routeSegments = Array.isArray(routePath) ? routePath : [routePath]

  if (routeSegments.some((segment) => (
    typeof segment === 'string' && segment.includes('\\')
  ))) {
    return null
  }

  const pathname = new URL(request.url).pathname

  if (!pathname.startsWith(DOWNLOAD_PATH_PREFIX)) {
    return null
  }

  const rawSegments = pathname.slice(DOWNLOAD_PATH_PREFIX.length).split('/')

  if (rawSegments.length !== 3 || rawSegments.some((segment) => !segment)) {
    return null
  }

  try {
    const segments = rawSegments.map((segment) => decodeURIComponent(segment))
    const unsafe = segments.some((segment) => (
      !segment
      || segment === '.'
      || segment === '..'
      || segment.includes('/')
      || segment.includes('\\')
      || segment.includes('\0')
      || /[\r\n]/.test(segment)
    ))

    if (unsafe) {
      return null
    }

    const [productId, version, assetName] = segments

    return {
      productId,
      version,
      assetName,
      path: segments.join('/'),
    }
  } catch {
    return null
  }
}

/** 查找与请求路径完全匹配的 manifest 资源。
 *
 * @param {object} manifest Release manifest。
 * @param {object} requestedPath 已解析的下载路径。
 * @returns {object|null} 匹配的资源。
 */
const RELEASE_ASSET_PREFIX = 'assets/'

/** 规整 downloadPath，去掉 R2 对象的 assets/ 前缀以得到逻辑下载路径。

 * @param {unknown} downloadPath manifest 中的原始下载路径。
 * @returns {string} 逻辑下载路径，无效输入返回空字符串。
 */
const normalizeDownloadPath = (downloadPath) => {
  if (typeof downloadPath !== 'string') {
    return ''
  }
  return downloadPath.startsWith(RELEASE_ASSET_PREFIX)
    ? downloadPath.slice(RELEASE_ASSET_PREFIX.length)
    : downloadPath
}

const findAsset = (manifest, requestedPath) => {
  if (!Array.isArray(manifest.releases)) {
    return null
  }

  const release = manifest.releases.find((candidate) => (
    candidate?.productId === requestedPath.productId
    && candidate?.version === requestedPath.version
  ))

  if (!Array.isArray(release?.assets)) {
    return null
  }

  return release.assets.find((asset) => (
    normalizeDownloadPath(asset?.downloadPath) === requestedPath.path
  )) || null
}

/** 生成可安全写入 Content-Disposition 的附件文件名。
 *
 * @param {unknown} filename manifest 中的文件名。
 * @returns {string} Content-Disposition 响应头值。
 */
const createContentDisposition = (filename) => {
  const cleanName = String(filename || 'download')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/]/g, '_')
    || 'download'
  const fallbackName = cleanName
    .replace(/"/g, '_')
    .replace(/[^\x20-\x7e]/g, '_')
  const encodedName = encodeURIComponent(cleanName)
    .replace(/['()*]/g, (character) => (
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`
    ))

  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`
}

/** 从 manifest 受信路径返回 R2 下载对象。
 *
 * @param {object} context Pages Functions 请求上下文。
 * @param {Request} context.request 下载请求。
 * @param {object} context.env Pages Functions 环境绑定。
 * @param {object} context.params Pages Functions 路由参数。
 * @returns {Promise<Response>} 下载内容或错误响应。
 */
export const onRequestGet = async ({ request, env, params }) => {
  const requestedPath = parseDownloadPath(request, params)

  if (!requestedPath) {
    return errorResponse('无效的下载路径', 400)
  }

  let manifest

  try {
    ({ manifest } = await loadReleaseManifest(env))
  } catch {
    return errorResponse('发布数据暂不可用', 503)
  }

  const asset = findAsset(manifest, requestedPath)

  if (!asset) {
    return errorResponse('下载资源不存在', 404)
  }

  let object

  try {
    object = await env.RELEASE_BUCKET.get(asset.downloadPath)
  } catch {
    return errorResponse('下载资源暂不可用', 503)
  }

  if (!object) {
    return errorResponse('下载资源不存在', 404)
  }

  const contentLength = Number.isFinite(object.size) ? object.size : asset.size
  const headers = {
    'Cache-Control': DOWNLOAD_CACHE_CONTROL,
    'Content-Disposition': createContentDisposition(asset.name || requestedPath.assetName),
    'Content-Type': asset.contentType
      || object.httpMetadata?.contentType
      || 'application/octet-stream',
  }

  if (Number.isFinite(contentLength) && contentLength >= 0) {
    headers['Content-Length'] = String(contentLength)
  }

  return new Response(object.body, { headers })
}
