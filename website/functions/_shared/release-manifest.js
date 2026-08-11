export const RELEASE_MANIFEST_KEY = 'portal/v1/manifest.json'

const COLLECTION_KEYS = ['products', 'releases', 'timeline', 'faqs']

/** 判断值是否为至少包含一个字段的普通对象。
 *
 * @param {unknown} value 待检查的值。
 * @returns {boolean} 是否为有效记录。
 */
const isNonEmptyRecord = (value) => (
  value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && Object.keys(value).length > 0
)

/** 校验 Release manifest 的基础公共契约。
 *
 * @param {unknown} manifest 待校验的 manifest。
 * @returns {boolean} 是否满足基础结构要求。
 */
const isValidManifest = (manifest) => (
  manifest !== null
  && typeof manifest === 'object'
  && !Array.isArray(manifest)
  && manifest.schemaVersion === 1
  && typeof manifest.generatedAt === 'string'
  && manifest.generatedAt.length > 0
  && manifest.meta !== null
  && typeof manifest.meta === 'object'
  && !Array.isArray(manifest.meta)
  && COLLECTION_KEYS.every((key) => (
    Array.isArray(manifest[key])
    && manifest[key].every(isNonEmptyRecord)
  ))
)

/** 从固定 R2 对象读取并解析 Release manifest。
 *
 * @param {object} env Pages Functions 环境绑定。
 * @returns {Promise<{ manifest: object, object: object }>} manifest 与 R2 对象。
 * @throws {Error} R2 未绑定、对象缺失或正文非法时抛出错误。
 */
export const loadReleaseManifest = async (env) => {
  if (!env?.RELEASE_BUCKET?.get) {
    throw new Error('RELEASE_BUCKET 未绑定')
  }

  const object = await env.RELEASE_BUCKET.get(RELEASE_MANIFEST_KEY)

  if (!object?.text) {
    throw new Error('Release manifest 不存在')
  }

  const manifest = JSON.parse(await object.text())

  if (!isValidManifest(manifest)) {
    throw new Error('Release manifest 正文非法')
  }

  return { manifest, object }
}
