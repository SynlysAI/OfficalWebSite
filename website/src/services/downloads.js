import { formatDownloadUrl } from './releasePortal'

/** 将字节数格式化为简洁文件大小。
 *
 * @param {unknown} value manifest 中的字节数。
 * @param {string} language 当前界面语言。
 * @returns {string} 可读文件大小，未知时返回空字符串。
 */
export const formatFileSize = (value, language = 'zh') => {
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes < 0) {
    return ''
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let amount = bytes
  let unitIndex = 0
  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024
    unitIndex += 1
  }

  return `${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'zh-CN', {
    maximumFractionDigits: amount >= 10 || unitIndex === 0 ? 0 : 1,
  }).format(amount)} ${units[unitIndex]}`
}

/** 判断发布记录是否为预发布版本。
 *
 * @param {object} release 发布记录。
 * @returns {boolean} 是否为非稳定渠道。
 */
export const isPrerelease = (release) => release?.channel !== 'stable'

/** 按产品整理下载版本并生成安全同域 URL。
 *
 * @param {object[]} products manifest 产品列表。
 * @param {object[]} releases manifest 发布列表。
 * @param {object} filters 下载筛选条件。
 * @param {string} [filters.productId] 产品 ID。
 * @param {string} [filters.platform] 平台。
 * @param {string} [filters.arch] 架构。
 * @returns {object[]} 按 manifest 产品顺序排列的下载分组。
 */
export const prepareDownloadGroups = (products = [], releases = [], filters = {}) => {
  const { productId = '', platform = '', arch = '' } = filters

  return products
    .filter((product) => product && typeof product === 'object')
    .filter((product) => !productId || product.productId === productId)
    .map((product) => {
      const productReleases = releases
        .filter((release) => (
          release
          && typeof release === 'object'
          && release.productId === product.productId
          && Array.isArray(release.assets)
          && release.assets.length > 0
        ))
        .map((release) => ({
          ...release,
          assets: release.assets
            .filter((asset) => asset && typeof asset === 'object')
            .filter((asset) => !platform || asset.platform === platform)
            .filter((asset) => !arch || asset.arch === arch)
            .map((asset) => {
              try {
                return { ...asset, downloadUrl: formatDownloadUrl(asset), downloadError: false }
              } catch {
                return { ...asset, downloadUrl: '', downloadError: true }
              }
            }),
        }))
        .filter((release) => release.assets.length > 0)
        .sort((left, right) => (
          Number(Boolean(right.isLatestStable)) - Number(Boolean(left.isLatestStable))
          || Number(isPrerelease(left)) - Number(isPrerelease(right))
          || Date.parse(right.publishedAt || 0) - Date.parse(left.publishedAt || 0)
        ))

      return { product, releases: productReleases }
    })
    .filter((group) => group.releases.length > 0)
}

/** 收集 manifest 中可用的平台和架构筛选项。
 *
 * @param {object[]} releases manifest 发布列表。
 * @returns {{ platforms: string[], architectures: string[] }} 排序后的选项。
 */
export const collectDownloadOptions = (releases = []) => {
  const assets = releases.flatMap((release) => (
    Array.isArray(release?.assets) ? release.assets : []
  ))
  const collect = (field) => Array.from(new Set(
    assets.map((asset) => asset?.[field]).filter((value) => typeof value === 'string' && value),
  )).sort()

  return {
    platforms: collect('platform'),
    architectures: collect('arch'),
  }
}
