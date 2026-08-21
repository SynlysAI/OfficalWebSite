import { RELEASE_MANIFEST_KEY } from '../_shared/release-manifest'

const CACHE_CONTROL = 'public, max-age=3600, stale-while-revalidate=86400'
const README_KEY = 'portal/v1/readmes.json'

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

/** 按 productId 返回产品 README 内容。
 *
 * @param {object} context Pages Functions 请求上下文。
 * @param {object} context.env Pages Functions 环境绑定。
 * @param {Request} context.request 当前请求。
 * @returns {Promise<Response>} README 内容或错误响应。
 */
export const onRequestGet = async ({ env, request }) => {
  const url = new URL(request.url)
  const productId = url.searchParams.get('id')

  if (!productId || typeof productId !== 'string') {
    return jsonResponse({ error: '缺少产品 ID 参数' }, 400)
  }

  if (!/^[a-z0-9][a-z0-9-]*$/i.test(productId)) {
    return jsonResponse({ error: '产品 ID 格式无效' }, 400)
  }

  if (!env?.RELEASE_BUCKET?.get) {
    return jsonResponse({ error: '服务暂不可用' }, 503)
  }

  try {
    const object = await env.RELEASE_BUCKET.get(README_KEY)

    if (!object?.text) {
      return jsonResponse({ error: 'README 数据暂不可用' }, 404)
    }

    let readmes
    try {
      readmes = JSON.parse(await object.text())
    } catch {
      return jsonResponse({ error: 'README 数据格式无效' }, 500)
    }

    const entry = Array.isArray(readmes?.readmes)
      ? readmes.readmes.find((item) => item?.productId === productId)
      : null

    if (!entry) {
      return jsonResponse({ error: '未找到该产品的 README' }, 404)
    }

    return jsonResponse({
      productId: entry.productId,
      content: entry.content || '',
      fetchedAt: entry.fetchedAt || null,
    }, 200, {
      'Cache-Control': CACHE_CONTROL,
    })
  } catch {
    return jsonResponse({ error: 'README 数据暂不可用' }, 503)
  }
}
