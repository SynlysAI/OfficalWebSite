import { releasePortalFallback } from '../data/releasePortalFallback'

const RELEASE_MANIFEST_ENDPOINT = '/api/release-manifest'
const RELEASE_MANIFEST_SCHEMA_VERSION = 1
const REQUEST_TIMEOUT_MS = 8000
const REQUIRED_ARRAY_FIELDS = ['products', 'releases', 'timeline', 'faqs']

/**
 * 判断值是否为至少包含一个字段的普通对象。
 *
 * @param {unknown} value 待判断的值。
 * @returns {boolean} 是否为非空普通对象。
 */
const isNonEmptyPlainObject = (value) => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)

  return (prototype === Object.prototype || prototype === null)
    && Object.keys(value).length > 0
}

/**
 * 创建不包含内部异常细节的降级结果。
 *
 * @param {string} code 机器可判别的错误码。
 * @param {string} message 面向页面的错误信息。
 * @param {object} [details] 可安全暴露的诊断字段。
 * @returns {object} 带安全 fallback 的请求结果。
 */
const createFallbackResult = (code, message, details = {}) => ({
  ok: false,
  manifest: releasePortalFallback,
  error: {
    code,
    message,
    ...details,
  },
})

/**
 * 校验页面消费所需的 manifest 基础结构。
 *
 * @param {unknown} manifest 待校验的发布数据。
 * @returns {boolean} 基础结构是否完整。
 */
const isManifestShapeValid = (manifest) => (
  manifest !== null
  && typeof manifest === 'object'
  && typeof manifest.generatedAt === 'string'
  && manifest.meta !== null
  && typeof manifest.meta === 'object'
  && !Array.isArray(manifest.meta)
  && REQUIRED_ARRAY_FIELDS.every((field) => Array.isArray(manifest[field]))
)

/**
 * 校验 manifest 各集合仅包含非空普通对象。
 *
 * @param {object} manifest 已通过基础结构校验的发布数据。
 * @returns {boolean} 所有集合元素是否安全可消费。
 */
const areManifestElementsValid = (manifest) => (
  REQUIRED_ARRAY_FIELDS.every((field) => (
    manifest[field].every(isNonEmptyPlainObject)
  ))
)

/**
 * 从同域接口读取并校验 Release Portal manifest。
 *
 * @param {object} [options] 请求选项。
 * @param {AbortSignal} [options.signal] 调用方用于取消请求的信号。
 * @returns {Promise<object>} 成功 manifest 或带诊断错误的安全 fallback。
 */
export const fetchReleaseManifest = async ({ signal } = {}) => {
  const requestController = new AbortController()
  let timedOut = false

  const handleExternalAbort = () => {
    requestController.abort(signal?.reason)
  }

  if (signal?.aborted) {
    handleExternalAbort()
  } else {
    signal?.addEventListener('abort', handleExternalAbort, { once: true })
  }

  const timeoutId = setTimeout(() => {
    timedOut = true
    requestController.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(RELEASE_MANIFEST_ENDPOINT, {
      headers: {
        Accept: 'application/json',
      },
      signal: requestController.signal,
    })

    if (!response.ok) {
      return createFallbackResult(
        'HTTP_ERROR',
        '发布数据请求失败',
        { status: response.status },
      )
    }

    const manifest = await response.json()

    if (manifest?.schemaVersion !== RELEASE_MANIFEST_SCHEMA_VERSION) {
      return createFallbackResult(
        'UNSUPPORTED_SCHEMA_VERSION',
        '发布数据版本不受支持',
      )
    }

    if (!isManifestShapeValid(manifest)) {
      return createFallbackResult('INVALID_MANIFEST', '发布数据格式无效')
    }

    if (!areManifestElementsValid(manifest)) {
      return createFallbackResult('SCHEMA_INVALID', '发布数据集合元素无效')
    }

    return {
      ok: true,
      manifest,
      error: null,
    }
  } catch {
    if (timedOut) {
      return createFallbackResult('TIMEOUT', '发布数据请求超时')
    }

    if (signal?.aborted) {
      return createFallbackResult('ABORTED', '发布数据请求已取消')
    }

    return createFallbackResult('NETWORK_ERROR', '发布数据网络请求失败')
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', handleExternalAbort)
  }
}

/**
 * 按产品、日期、变更类型和视图粒度筛选时间线。
 *
 * @param {object[]} events 时间线事件集合。
 * @param {object} filters 筛选条件。
 * @param {string} [filters.productId] 产品 ID。
 * @param {string} [filters.dateFrom] 包含边界的起始日期，格式为 YYYY-MM-DD。
 * @param {string} [filters.dateTo] 包含边界的结束日期，格式为 YYYY-MM-DD。
 * @param {string[]} [filters.changeTypes] 允许的变更类型。
 * @param {string} [filters.view] release 或 panorama 视图。
 * @returns {object[]} 按发生时间倒序排列的筛选结果。
 */
export const filterTimeline = (events = [], filters = {}) => {
  const {
    productId,
    dateFrom,
    dateTo,
    changeTypes = [],
    view = 'release',
  } = filters

  return events
    .filter((event) => (
      isNonEmptyPlainObject(event)
      && typeof event.occurredAt === 'string'
      && !Number.isNaN(Date.parse(event.occurredAt))
    ))
    .filter((event) => !productId || productId === 'all' || event.productId === productId)
    .filter((event) => view === 'panorama' || event.level === 'release')
    .filter((event) => !dateFrom || event.occurredAt?.slice(0, 10) >= dateFrom)
    .filter((event) => !dateTo || event.occurredAt?.slice(0, 10) <= dateTo)
    .filter((event) => changeTypes.length === 0 || changeTypes.includes(event.changeType))
    .sort((left, right) => (
      Date.parse(right.occurredAt) - Date.parse(left.occurredAt)
    ))
}

/**
 * 获取指定产品最新的稳定版本。
 *
 * @param {object[]} releases 发布版本集合。
 * @param {string} productId 产品 ID。
 * @returns {object|null} 最新稳定版本，不存在时返回 null。
 */
export const getLatestStableRelease = (releases = [], productId) => (
  releases
    .filter((release) => (
      isNonEmptyPlainObject(release)
      && typeof release.publishedAt === 'string'
      && !Number.isNaN(Date.parse(release.publishedAt))
      && release.productId === productId
      && !release.prerelease && !release.draft
    ))
    .sort((left, right) => (
      Number(Boolean(right.isLatestStable)) - Number(Boolean(left.isLatestStable))
      || Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
    ))[0] || null
)

/**
 * 将 manifest 内的相对下载路径转换为同域下载地址。
 *
 * @param {object} asset 下载资源。
 * @param {string} asset.downloadPath manifest 提供的相对下载路径。
 * @returns {string} 同域下载接口地址。
 * @throws {TypeError} 路径为空、为绝对地址或包含路径穿越时抛出。
 */
export const formatDownloadUrl = (asset) => {
  const rawPath = asset?.downloadPath
  const downloadPath = typeof rawPath === 'string' && rawPath.startsWith('assets/')
    ? rawPath.slice('assets/'.length)
    : rawPath

  if (
    typeof downloadPath !== 'string'
    || downloadPath.length === 0
    || downloadPath.startsWith('/')
    || downloadPath.startsWith('\\')
    || /^[a-z][a-z\d+.-]*:/i.test(downloadPath)
    || downloadPath.includes('?')
    || downloadPath.includes('#')
    || downloadPath.includes('\\')
  ) {
    throw new TypeError('无效的下载路径')
  }

  const segments = downloadPath.split('/')
  let decodedSegments

  try {
    decodedSegments = segments.map((segment) => decodeURIComponent(segment))
  } catch {
    throw new TypeError('无效的下载路径')
  }

  if (decodedSegments.some((segment) => (
    !segment
    || segment === '.'
    || segment === '..'
    || segment.includes('/')
    || segment.includes('\\')
    || segment.includes('\0')
  ))) {
    throw new TypeError('无效的下载路径')
  }

  return `/api/download/${decodedSegments.map(encodeURIComponent).join('/')}`
}
