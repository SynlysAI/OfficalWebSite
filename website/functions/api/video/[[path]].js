const VIDEO_PATH_PREFIX = '/api/video/'
const VIDEO_KEY_PREFIX = 'portal/v1/videos/'
const VIDEO_CACHE_CONTROL = 'public, max-age=86400'

const VIDEO_CONTENT_TYPES = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
}

/** 创建 JSON 错误响应。
 *
 * @param {string} error 对外错误信息。
 * @param {number} status HTTP 状态码。
 * @returns {Response} JSON 错误响应。
 */
const errorResponse = (error, status) => Response.json({ error }, { status })

/** 从请求 URL 解析安全的两段视频路径（productId/文件名）。
 *
 * @param {Request} request 视频请求。
 * @param {object} params Pages Functions 路由参数。
 * @returns {{ productId: string, fileName: string }|null} 解析结果。
 */
const parseVideoPath = (request, params) => {
  const routePath = params?.path
  const routeSegments = Array.isArray(routePath) ? routePath : [routePath]

  if (routeSegments.some((segment) => (
    typeof segment === 'string' && segment.includes('\\')
  ))) {
    return null
  }

  const pathname = new URL(request.url).pathname

  if (!pathname.startsWith(VIDEO_PATH_PREFIX)) {
    return null
  }

  const rawSegments = pathname.slice(VIDEO_PATH_PREFIX.length).split('/')

  if (rawSegments.length !== 2 || rawSegments.some((segment) => !segment)) {
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

    const [productId, fileName] = segments
    const extension = fileName.split('.').pop()?.toLowerCase()

    if (!extension || !VIDEO_CONTENT_TYPES[extension]) {
      return null
    }

    return { productId, fileName }
  } catch {
    return null
  }
}

/** 将 HTTP Range 请求头转换为 R2 get 支持的 range 参数。
 *
 * @param {string|null} rangeHeader 请求中的 Range 头。
 * @returns {{ range: { offset?: number, length?: number, suffix?: number } }|null} R2 range 选项。
 */
const parseRangeOptions = (rangeHeader) => {
  if (typeof rangeHeader !== 'string') {
    return null
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim())

  if (!match || (match[1] === '' && match[2] === '')) {
    return null
  }

  if (match[1] === '') {
    return { range: { suffix: Number(match[2]) } }
  }

  const start = Number(match[1])
  const end = match[2] === '' ? null : Number(match[2])

  if (!Number.isSafeInteger(start) || start < 0 || (end !== null && (!Number.isSafeInteger(end) || end < start))) {
    return null
  }

  return {
    range: end === null
      ? { offset: start }
      : { offset: start, length: end - start + 1 },
  }
}

/** 从 R2 读取视频对象并返回支持 Range 的流式响应。
 *
 * @param {object} context Pages Functions 请求上下文。
 * @param {Request} context.request 视频请求。
 * @param {object} context.env Pages Functions 环境绑定。
 * @param {object} context.params Pages Functions 路由参数。
 * @returns {Promise<Response>} 视频内容或错误响应。
 */
export const onRequestGet = async ({ request, env, params }) => {
  const videoPath = parseVideoPath(request, params)

  if (!videoPath) {
    return errorResponse('无效的视频路径', 400)
  }

  const options = parseRangeOptions(request.headers.get('range'))

  let object

  try {
    object = await env.RELEASE_BUCKET.get(
      `${VIDEO_KEY_PREFIX}${videoPath.productId}/${videoPath.fileName}`,
      options,
    )
  } catch {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */0' },
    })
  }

  if (!object) {
    return errorResponse('视频资源不存在', 404)
  }

  const extension = videoPath.fileName.split('.').pop()?.toLowerCase()
  const totalSize = Number.isFinite(object.size) ? object.size : 0
  const headers = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': VIDEO_CACHE_CONTROL,
    'Content-Type': VIDEO_CONTENT_TYPES[extension] || 'video/mp4',
  }

  // 仅在客户端显式携带 Range 请求头时返回 206，
  // 避免 R2 实现差异导致全量响应被误标为部分内容。
  if (options && object.range) {
    const { offset = 0, length = 0 } = object.range
    headers['Content-Length'] = String(length)
    headers['Content-Range'] = `bytes ${offset}-${offset + length - 1}/${totalSize}`

    return new Response(object.body, { status: 206, headers })
  }

  if (totalSize >= 0) {
    headers['Content-Length'] = String(totalSize)
  }

  return new Response(object.body, { status: 200, headers })
}
