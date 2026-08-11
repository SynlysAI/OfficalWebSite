import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { onRequestPost } from '../../functions/api/faq-feedback'

const MANIFEST_KEY = 'portal/v1/manifest.json'

/** 创建包含 FAQ 的 R2 测试替身。
 *
 * @returns {object} R2 bucket 测试替身。
 */
const createBucket = () => ({
  get: vi.fn().mockResolvedValue({
    text: vi.fn().mockResolvedValue(JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-08-11T00:00:00.000Z',
      products: [],
      releases: [],
      timeline: [],
      faqs: [{ id: 'install-help' }],
      meta: {},
    })),
  }),
})

/** 创建实现 D1 prepare/bind/run/first 形状的内存数据库。
 *
 * @returns {object} D1 数据库测试替身及其记录。
 */
const createD1Database = () => {
  const rows = []
  const calls = []

  return {
    rows,
    calls,
    prepare(sql) {
      calls.push({ sql, bindings: null })
      const call = calls.at(-1)

      return {
        bind(...bindings) {
          call.bindings = bindings

          return {
            async run() {
              expect(sql).toMatch(/INSERT INTO faq_feedback/i)
              const [faqId, helpful, day, fingerprint] = bindings
              const duplicate = rows.some((row) => (
                row.faqId === faqId
                && row.day === day
                && row.fingerprint === fingerprint
              ))

              if (!duplicate) {
                rows.push({ faqId, helpful, day, fingerprint })
              }

              return { meta: { changes: duplicate ? 0 : 1 } }
            },
            async first() {
              expect(sql).toMatch(/FROM faq_feedback/i)
              const [faqId] = bindings
              const faqRows = rows.filter((row) => row.faqId === faqId)

              return {
                helpful: faqRows.filter((row) => row.helpful === 1).length,
                unhelpful: faqRows.filter((row) => row.helpful === 0).length,
              }
            },
          }
        },
      }
    },
  }
}

/** 创建 FAQ 反馈请求上下文。
 *
 * @param {object|string} body JSON 请求体或原始字符串。
 * @param {object} options 上下文选项。
 * @returns {object} Pages Function 请求上下文。
 */
const createContext = (body, {
  database = createD1Database(),
  bucket = createBucket(),
  method = 'POST',
  headers = {},
} = {}) => ({
  request: new Request('https://example.com/api/faq-feedback', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '203.0.113.10',
      'User-Agent': 'portal-test-agent',
      ...headers,
    },
    body: method === 'GET' ? undefined : (
      typeof body === 'string' ? body : JSON.stringify(body)
    ),
  }),
  env: {
    RELEASE_BUCKET: bucket,
    FAQ_DB: database,
  },
})

describe('POST /api/faq-feedback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-11T12:34:56.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    ['非 POST 请求', { body: {}, options: { method: 'GET' } }, 405],
    ['非 JSON Content-Type', {
      body: {},
      options: { headers: { 'Content-Type': 'text/plain' } },
    }, 415],
    ['伪装为 JSON 前缀的 Content-Type', {
      body: { faqId: 'install-help', helpful: true },
      options: { headers: { 'Content-Type': 'application/json-malformed' } },
    }, 415],
    ['非法 JSON', { body: '{invalid', options: {} }, 400],
    ['未知 FAQ', { body: { faqId: 'missing', helpful: true }, options: {} }, 404],
    ['helpful 非布尔值', {
      body: { faqId: 'install-help', helpful: 1 },
      options: {},
    }, 400],
  ])('%s 时拒绝请求', async (label, input, expectedStatus) => {
    const response = await onRequestPost(createContext(input.body, input.options))

    expect(response.status).toBe(expectedStatus)
  })

  it('使用唯一约束对同一访客同一 FAQ 当天的投票保持幂等', async () => {
    const database = createD1Database()
    const firstResponse = await onRequestPost(createContext(
      { faqId: 'install-help', helpful: true },
      { database },
    ))
    const duplicateResponse = await onRequestPost(createContext(
      { faqId: 'install-help', helpful: false },
      { database },
    ))

    expect(await firstResponse.json()).toEqual({
      helpful: 1,
      unhelpful: 0,
    })
    expect(await duplicateResponse.json()).toEqual({
      helpful: 1,
      unhelpful: 0,
    })
    expect(database.rows).toHaveLength(1)
    expect(database.calls[0].sql).toMatch(
      /ON CONFLICT\s*\(faq_id, day, fingerprint\)\s*DO NOTHING/i,
    )
    expect(database.calls[0].bindings.slice(0, 3)).toEqual([
      'install-help',
      1,
      '2026-08-11',
    ])
    expect(database.calls[0].bindings[3]).toMatch(/^[a-f0-9]{64}$/)
    expect(database.calls[0].bindings[3]).not.toContain('203.0.113.10')
    expect(database.calls[1].sql).toMatch(/SELECT/i)
    expect(database.calls[1].bindings).toEqual(['install-help'])
  })

  it('缺少 IP 与 User-Agent 时仍生成稳定指纹并保持幂等', async () => {
    const database = createD1Database()
    const options = {
      database,
      headers: {
        'CF-Connecting-IP': '',
        'User-Agent': '',
      },
    }

    const firstResponse = await onRequestPost(createContext(
      { faqId: 'install-help', helpful: false },
      options,
    ))
    const duplicateResponse = await onRequestPost(createContext(
      { faqId: 'install-help', helpful: false },
      options,
    ))

    expect(await firstResponse.json()).toEqual({
      helpful: 0,
      unhelpful: 1,
    })
    expect(await duplicateResponse.json()).toEqual({
      helpful: 0,
      unhelpful: 1,
    })
    expect(database.rows).toHaveLength(1)
  })

  it('只从固定 manifest key 校验 FAQ ID', async () => {
    const context = createContext({ faqId: 'install-help', helpful: true })

    await onRequestPost(context)

    expect(context.env.RELEASE_BUCKET.get).toHaveBeenCalledWith(MANIFEST_KEY)
  })
})
