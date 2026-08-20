import { expect, test } from '@playwright/test'

const products = [
  ['ai4ms', 'AI4MS', 'web'],
  ['spec-agent', 'Spec Agent', 'web'],
  ['poly-agent', 'Poly Agent', 'web'],
  ['speclabos', 'SpecLabOS', 'web'],
  ['smartaccess', 'SmartAccess', 'download'],
  ['rag-portal', 'RAG Portal', 'web'],
].map(([id, name, entryType]) => ({
  id,
  name: { zh: name, en: name },
  category: { zh: '产品', en: 'Product' },
  description: { zh: '发布信息', en: 'Release information' },
  entryType,
  webUrl: entryType === 'web' ? `https://example.com/${id}` : null,
}))

const manifest = {
  schemaVersion: 1,
  generatedAt: '2026-08-11T00:00:00.000Z',
  products,
  releases: [{
    id: 'smartaccess-v2',
    productId: 'smartaccess',
    version: 'v2.0.0',
    prerelease: false, draft: false,
    isLatestStable: true,
    publishedAt: '2026-08-11T00:00:00.000Z',
    assets: [{
      name: 'SmartAccess.exe',
      platform: 'windows',
      architecture: 'x64',
      size: 1024,
      sha256: 'abc123',
      downloadPath: 'smartaccess/v2.0.0/SmartAccess.exe',
    }],
  }],
  timeline: [
    {
      id: 'release-v2',
      productId: 'smartaccess',
      level: 'release',
      occurredAt: '2026-08-11T00:00:00.000Z',
      version: 'v2.0.0',
      changeType: 'release',
      title: { zh: 'SmartAccess 2.0', en: 'SmartAccess 2.0' },
      summary: { zh: '稳定发布', en: 'Stable release' },
      detailsMarkdown: { zh: '## 发布说明', en: '## Release notes' },
    },
    {
      id: 'install-commit',
      productId: 'smartaccess',
      level: 'commit',
      occurredAt: '2026-08-10T00:00:00.000Z',
      version: 'v2.0.0',
      changeType: 'feature',
      title: { zh: '安装优化', en: 'Installer update' },
      summary: { zh: '安装体验优化', en: 'Improved installation' },
      source: { shas: ['abcdef1234567'] },
    },
  ],
  faqs: [{
    id: 'install-help',
    productId: 'smartaccess',
    versionRange: '2.0',
    category: 'installation',
    question: { zh: '如何安装 SmartAccess？', en: 'How do I install SmartAccess?' },
    answerMarkdown: { zh: '运行安装包。', en: 'Run the installer.' },
    relatedTimelineIds: ['release-v2'],
    feedbackEnabled: true,
  }],
  meta: { sourceWatermarks: {}, collectionHashes: {} },
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/release-manifest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(manifest),
    })
  })
  await page.route('**/api/faq-feedback', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'D1_UNAVAILABLE' } }),
    })
  })
})

test('Release Portal 核心流程在四个视口保持可用', async ({ page }, testInfo) => {
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto('/releases')

  await expect(page.locator('[data-product-card]')).toHaveCount(6)
  await expect(page).toHaveTitle('产品发布中心 | SynlysAI')
  await expect(page.locator('[role="tablist"] [role="tab"]')).toHaveCount(5)
  await expect(page.locator('[data-portal-tab="overview"]')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('[role="tabpanel"]')).toHaveAttribute('data-portal-panel', 'overview')

  const tabRows = await page.locator('[role="tab"]').evaluateAll((tabs) => (
    new Set(tabs.map((tab) => Math.round(tab.getBoundingClientRect().top))).size
  ))
  expect(tabRows).toBe(1)
  await expect(page.locator('[role="tablist"]')).toHaveCSS('display', 'grid')
  await expect(page.locator('[data-portal-tab="overview"]')).toHaveCSS('min-height', '56px')

  await page.locator('.language-switch__button').filter({ hasText: 'EN' }).click()
  await expect(page.locator('h1')).toContainText('Product Release Center')
  await expect(page).toHaveTitle('Product Release Center | SynlysAI')

  await page.locator('[data-portal-tab="evolution"]').click()
  await expect(page.locator('[data-portal-tab="evolution"]')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('[role="tabpanel"]')).toHaveAttribute('data-portal-panel', 'evolution')

  const productFilter = page.locator('[data-product-filter]')
  await page.waitForTimeout(400)
  await productFilter.evaluate((element) => {
    const top = window.scrollY + element.getBoundingClientRect().top - 80
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
  })
  const filterScrollY = await page.evaluate(() => window.scrollY)
  await productFilter.evaluate((element) => {
    element.value = 'smartaccess'
    element.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await expect(page).toHaveURL(/product=smartaccess/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(filterScrollY)
  await page.locator('[data-view="panorama"]').click()
  await expect(page).toHaveURL(/view=panorama/)
  await expect(page.locator('[data-timeline-child]')).toHaveCount(1)

  await page.locator('[data-portal-tab="releases"]').click()
  await expect(page.locator('[role="tabpanel"]')).toContainText('Release history')
  await expect(page.locator('[data-timeline-child]')).toHaveCount(0)

  await page.locator('[data-portal-tab="downloads"]').click()
  const downloadLink = page.locator('[data-download-link]').first()
  await expect(downloadLink).toHaveAttribute('href', /^\/api\/download\//)

  await page.locator('[data-portal-tab="evolution"]').click()
  await page.locator('[data-product-filter]').selectOption('spec-agent')
  await expect(page).toHaveURL(/product=spec-agent/)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
  expect(pageErrors).toEqual([])

  await page.locator('.language-switch__button').filter({ hasText: '中文' }).click()
  await page.locator('[data-portal-tab="overview"]').click()
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({ path: testInfo.outputPath(`release-portal-${testInfo.project.name}.png`), fullPage: true })
})
