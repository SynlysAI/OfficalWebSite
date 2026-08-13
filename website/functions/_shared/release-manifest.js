export const RELEASE_MANIFEST_KEY = 'portal/v1/manifest.json'

const COLLECTION_KEYS = ['products', 'releases', 'timeline', 'faqs']

const COLLECTION_FILE_MAP = {
  products: 'portal/v1/products.json',
  releases: 'portal/v1/releases.json',
  timeline: 'portal/v1/timeline.json',
  faqs: 'portal/v1/faqs.json',
  meta: 'portal/v1/meta.json',
}

const COLLECTION_RECORD_FIELD = {
  products: 'products',
  releases: 'releases',
  timeline: 'events',
  faqs: 'faqs',
}

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

/** 校验组装后的扁平 Release manifest 公共契约。
 *
 * @param {unknown} manifest 待校验的扁平 manifest。
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

/** 安全读取并解析 R2 JSON 对象，遇到空对象或非法正文时抛出。
 *
 * @param {object} bucket R2 bucket 绑定。
 * @param {string} key R2 对象 key。
 * @returns {Promise<object>} 已解析的 JSON 对象。
 * @throws {Error} 对象缺失、读取失败或正文非法时抛出错误。
 */
const readJsonObject = async (bucket, key) => {
  const object = await bucket.get(key)

  if (!object?.text) {
    throw new Error(`R2 对象缺失: ${key}`)
  }

  try {
    return JSON.parse(await object.text())
  } catch (error) {
    throw new Error(`R2 对象正文非法: ${key}`)
  }
}

/** 从根指针 manifest 与 5 个扁平副本组装消费端期望的扁平 manifest。
 *
 * @param {object} rootManifest 根指针 manifest（仅用于 schemaVersion 与 generatedAt）。
 * @param {object} collections products/releases/timeline/faqs/meta 五个集合的原始映射。
 * @returns {object} 顶层集合均为数组的扁平 manifest。
 */
const assembleFlatManifest = (rootManifest, collections) => {
  const flat = {
    schemaVersion: rootManifest.schemaVersion,
    generatedAt: rootManifest.generatedAt,
    meta: collections.meta,
  }

  COLLECTION_KEYS.forEach((name) => {
    const collection = collections[name]
    const field = COLLECTION_RECORD_FIELD[name]
    flat[name] = Array.isArray(collection?.[field]) ? collection[field] : []
  })

  return flat
}

/** 读取根指针与 5 个扁平副本，组装并校验 Release manifest。
 *
 * 根指针（portal/v1/manifest.json）由生成端在每次发布时最后替换，仅用于携带
 * schemaVersion、generatedAt 和 etag；真正的内容由 5 个扁平副本提供。
 *
 * @param {object} env Pages Functions 环境绑定。
 * @returns {Promise<{ manifest: object, object: object }>} 扁平 manifest 与根指针 R2 对象。
 * @throws {Error} R2 未绑定、对象缺失、正文非法或校验失败时抛出错误。
 */
export const loadReleaseManifest = async (env) => {
  if (!env?.RELEASE_BUCKET?.get) {
    throw new Error('RELEASE_BUCKET 未绑定')
  }

  const bucket = env.RELEASE_BUCKET
  const pointerObject = await bucket.get(RELEASE_MANIFEST_KEY)

  if (!pointerObject?.text) {
    throw new Error('Release manifest 根指针不存在')
  }

  let rootManifest
  try {
    rootManifest = JSON.parse(await pointerObject.text())
  } catch {
    throw new Error('Release manifest 根指针正文非法')
  }

  if (
    rootManifest?.schemaVersion !== 1
    || typeof rootManifest.generatedAt !== 'string'
    || rootManifest.generatedAt.length === 0
  ) {
    throw new Error('Release manifest 根指针字段非法')
  }

  const collectionEntries = await Promise.all(
    Object.entries(COLLECTION_FILE_MAP).map(async ([name, key]) => {
      const value = await readJsonObject(bucket, key)
      return [name, value]
    })
  )

  const collections = Object.fromEntries(collectionEntries)
  const manifest = assembleFlatManifest(rootManifest, collections)

  if (!isValidManifest(manifest)) {
    throw new Error('Release manifest 正文非法')
  }

  return { manifest, object: pointerObject }
}
