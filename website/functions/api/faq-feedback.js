import { loadReleaseManifest } from '../_shared/release-manifest'

/** 创建 JSON 响应。
 *
 * @param {object} body JSON 响应体。
 * @param {number} status HTTP 状态码。
 * @returns {Response} JSON 响应。
 */
const jsonResponse = (body, status) => Response.json(body, { status })

/** 生成不包含原始访客信息的稳定 SHA-256 指纹。
 *
 * @param {string} day UTC 日期。
 * @param {Headers} headers 请求头。
 * @returns {Promise<string>} 十六进制 SHA-256 摘要。
 */
const createFingerprint = async (day, headers) => {
  const ip = headers.get('CF-Connecting-IP') || ''
  const userAgent = headers.get('User-Agent') || ''
  const source = new TextEncoder().encode(`${day}\n${ip}\n${userAgent}`)
  const digest = await crypto.subtle.digest('SHA-256', source)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/** 记录 FAQ 投票并返回该 FAQ 的累计结果。
 *
 * @param {object} context Pages Functions 请求上下文。
 * @param {Request} context.request HTTP 请求。
 * @param {object} context.env Pages Functions 环境绑定。
 * @returns {Promise<Response>} 反馈累计结果或错误响应。
 */
export const onRequestPost = async ({ request, env }) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: '仅支持 POST 请求' }, 405)
  }

  const contentType = (request.headers.get('Content-Type') || '')
    .split(';', 1)[0]
    .trim()
    .toLowerCase()

  if (contentType !== 'application/json') {
    return jsonResponse({ error: '请求体必须为 JSON' }, 415)
  }

  let input

  try {
    input = await request.json()
  } catch {
    return jsonResponse({ error: 'JSON 请求体无效' }, 400)
  }

  if (
    input === null
    || typeof input !== 'object'
    || Array.isArray(input)
    || typeof input.faqId !== 'string'
    || !input.faqId
    || typeof input.helpful !== 'boolean'
  ) {
    return jsonResponse({ error: '反馈参数无效' }, 400)
  }

  let manifest

  try {
    ({ manifest } = await loadReleaseManifest(env))
  } catch {
    return jsonResponse({ error: '发布数据暂不可用' }, 503)
  }

  if (!Array.isArray(manifest.faqs) || !manifest.faqs.some((faq) => faq?.id === input.faqId)) {
    return jsonResponse({ error: 'FAQ 不存在' }, 404)
  }

  if (!env?.FAQ_DB?.prepare) {
    return jsonResponse({ error: '反馈服务暂不可用' }, 503)
  }

  try {
    const day = new Date().toISOString().slice(0, 10)
    const fingerprint = await createFingerprint(day, request.headers)
    await env.FAQ_DB.prepare(`
      INSERT INTO faq_feedback (faq_id, helpful, day, fingerprint)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(faq_id, day, fingerprint) DO NOTHING
    `).bind(
      input.faqId,
      input.helpful ? 1 : 0,
      day,
      fingerprint,
    ).run()
    const counts = await env.FAQ_DB.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END), 0) AS helpful,
        COALESCE(SUM(CASE WHEN helpful = 0 THEN 1 ELSE 0 END), 0) AS unhelpful
      FROM faq_feedback
      WHERE faq_id = ?
    `).bind(input.faqId).first()

    return jsonResponse({
      helpful: Number(counts?.helpful || 0),
      unhelpful: Number(counts?.unhelpful || 0),
    }, 200)
  } catch {
    return jsonResponse({ error: '反馈服务暂不可用' }, 503)
  }
}
