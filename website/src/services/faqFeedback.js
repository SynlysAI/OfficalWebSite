const FEEDBACK_ENDPOINT = '/api/faq-feedback'

/** 提交 FAQ 有用/无用反馈。
 *
 * @param {object} input 反馈参数。
 * @param {string} input.faqId FAQ ID。
 * @param {boolean} input.helpful 是否有帮助。
 * @param {typeof fetch} [request] 可注入的请求函数。
 * @returns {Promise<object>} 反馈结果，不暴露网络异常细节。
 */
export const submitFaqFeedback = async ({ faqId, helpful }, request = fetch) => {
  if (typeof faqId !== 'string' || !faqId || typeof helpful !== 'boolean') {
    return { ok: false, error: { code: 'INVALID_INPUT', message: '反馈参数无效' } }
  }

  try {
    const response = await request(FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faqId, helpful }),
    })
    if (!response.ok) {
      return { ok: false, error: { code: 'HTTP_ERROR', message: '反馈暂时无法提交' } }
    }
    const counts = await response.json()
    return {
      ok: true,
      counts: {
        helpful: Number.isFinite(Number(counts?.helpful)) ? Number(counts.helpful) : 0,
        unhelpful: Number.isFinite(Number(counts?.unhelpful)) ? Number(counts.unhelpful) : 0,
      },
      error: null,
    }
  } catch {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: '反馈暂时无法提交' } }
  }
}
