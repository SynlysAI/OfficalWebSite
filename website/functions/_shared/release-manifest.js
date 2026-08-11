export const RELEASE_MANIFEST_KEY = 'portal/v1/manifest.json'

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

  if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('Release manifest 正文非法')
  }

  return { manifest, object }
}
