import { loadReleaseManifest } from '../_shared/release-manifest'

const CACHE_CONTROL = 'public, max-age=300, stale-while-revalidate=3600'

/** 创建 JSON 响应。
 *
 * @param {object} body JSON 响应体。
 * @param {number} status HTTP 状态码。
 * @param {HeadersInit} [headers] 附加响应头。
 * @returns {Response} JSON 响应。
 */
const jsonResponse = (body, status, headers = {}) => new Response(
  JSON.stringify(body),
  {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  },
)

/** 返回存储在 R2 中的 Release manifest。
 *
 * @param {object} context Pages Functions 请求上下文。
 * @param {object} context.env Pages Functions 环境绑定。
 * @returns {Promise<Response>} manifest 或服务暂不可用响应。
 */
export const onRequestGet = async ({ env }) => {
  try {
    const { manifest, object } = await loadReleaseManifest(env)
    const headers = {
      'Cache-Control': CACHE_CONTROL,
    }

    if (object.httpEtag) {
      headers.ETag = object.httpEtag
    }

    return jsonResponse(manifest, 200, headers)
  } catch {
    return jsonResponse({ error: '发布数据暂不可用' }, 503)
  }
}
