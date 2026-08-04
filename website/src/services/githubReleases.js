import { releaseSource } from '../data/site'

const GITHUB_API_BASE = 'https://api.github.com'

/**
 * 拼接 GitHub Releases API 地址。
 *
 * @param {object} source 更新源配置。
 * @param {string} source.owner GitHub 组织或用户。
 * @param {string} source.repo GitHub 仓库名。
 * @returns {string} GitHub Releases API 地址。
 */
export const buildReleasesApiUrl = (source = releaseSource) => (
  `${GITHUB_API_BASE}/repos/${source.owner}/${source.repo}/releases`
)

/**
 * 拼接 GitHub Releases 页面地址。
 *
 * @param {object} source 更新源配置。
 * @param {string} source.owner GitHub 组织或用户。
 * @param {string} source.repo GitHub 仓库名。
 * @returns {string} GitHub Releases 页面地址。
 */
export const buildReleasesPageUrl = (source = releaseSource) => (
  `https://github.com/${source.owner}/${source.repo}/releases`
)

/**
 * 从 release 正文提取适合更新日志时间线展示的摘要。
 *
 * @param {string} body GitHub release markdown 正文。
 * @returns {string} 一段短摘要。
 */
export const summarizeReleaseBody = (body) => {
  if (!body) {
    return ''
  }

  const summary = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('---'))
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'))
    .slice(0, 3)
    .join(' · ')

  if (!summary) {
    return ''
  }

  return summary.length > 180 ? `${summary.slice(0, 180)}...` : summary
}

/**
 * 将 GitHub API 返回值归一化为页面可直接消费的数据。
 *
 * @param {object} release GitHub release 原始对象。
 * @returns {object} 官网 release 展示对象。
 */
export const normalizeRelease = (release) => ({
  id: release.id,
  tagName: release.tag_name,
  name: release.name || release.tag_name,
  body: release.body || '',
  summary: summarizeReleaseBody(release.body),
  publishedAt: release.published_at,
  createdAt: release.created_at,
  htmlUrl: release.html_url,
  prerelease: release.prerelease,
  assets: (release.assets || []).map((asset) => ({
    id: asset.id,
    name: asset.name,
    size: asset.size,
    downloadUrl: asset.browser_download_url,
  })),
})

/**
 * 从 GitHub 拉取并归一化 release 数据。
 *
 * @param {object} source 更新源配置。
 * @returns {Promise<object[]>} 已公开 release 列表。
 */
export const fetchGitHubReleases = async (source = releaseSource) => {
  const response = await fetch(buildReleasesApiUrl(source), {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub Releases API 请求失败：${response.status}`)
  }

  const releases = await response.json()

  return releases
    .filter((release) => !release.draft)
    .map(normalizeRelease)
}
