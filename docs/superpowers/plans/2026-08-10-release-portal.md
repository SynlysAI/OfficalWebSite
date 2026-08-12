# AI4S Release Portal 官网实施计划

> **面向执行代理：** 必须使用 `subagent-driven-development`（推荐）或 `executing-plans`，按任务逐项实施并用复选框跟踪。

**目标：** 在保留 SynlysAI 品牌首页的基础上，新增面向科研与产业用户的双语 Release Portal，统一展示六个产品、正式版本、审核后的 Commit 演进、R2 下载资源和 FAQ。

**架构：** 官网继续作为 Vue 3 + Vite 静态站运行，不在浏览器调用 GitHub API。Release Portal 从同域 Cloudflare Pages Function 获取 `.github` 发布到 R2 的 `portal/v1/manifest.json`；下载由同域 Function 按已验证 manifest 从 R2 流式返回，FAQ 投票写入 Cloudflare D1。官网只负责展示与轻量交互，内容生产、AI 处理和审核在 `.github` 完成。

**技术栈：** Vue 3、Vue Router、原生 CSS 变量、`marked`、`dompurify`、`katex`、Vitest、Vue Test Utils、Playwright、Cloudflare Pages Functions、R2、D1。

---

## 已确认决策

- 根路径 `/` 保留当前品牌首页；新增 `/releases` 为完整发布门户。
- `/changelog` 保留为兼容地址并重定向到 `/releases`，旧书签不失效。
- Release Portal 首期包含四个视图：产品矩阵、版本动态/技术演进、下载中心、FAQ。
- 首屏产品矩阵展示六个独立产品；Web 产品为“打开平台”，SmartAccess 为“查看下载”。
- 提供“里程碑视图”和“全景演进视图”；默认里程碑视图，筛选条件通过 URL query 保留。
- 首期中英文界面和内容均支持；当前语言状态沿用 `useLanguage.js`。
- 任何 Markdown/公式都必须经过安全清洗；FAQ 不允许执行 HTML、脚本或未白名单 URL。

## 与 `.github` 的接口契约

官网只依赖一个公开接口：

```text
GET /api/release-manifest
Response: {
  schemaVersion: 1,
  generatedAt: string,
  products: Product[],
  releases: Release[],
  timeline: TimelineEvent[],
  faqs: FAQ[],
  meta: { sourceWatermarks: object, collectionHashes: object }
}
```

公共字段约定：

- `Product`: `id`、`name.zh/en`、`category.zh/en`、`description.zh/en`、`entryType`、`webUrl`、`logo`、`repo`、`status`。
- `Release`: `id`、`productId`、`tagName`、`name.zh/en`、`summary.zh/en`、`bodyMarkdown.zh/en`、`publishedAt`、`channel`、`isLatestStable`、`assets[]`。
- `TimelineEvent`: `id`、`productId`、`level`、`occurredAt`、`version`、`changeType`、`module`、`title.zh/en`、`summary.zh/en`、`detailsMarkdown.zh/en`、`source`、`pinned`。
- `FAQ`: `id`、`productId|null`、`versionRange|null`、`category`、`question.zh/en`、`answerMarkdown.zh/en`、`relatedTimelineIds[]`、`feedbackEnabled`。
- 前端不得依赖未列出的字段；未知 `changeType`、`level` 或 `entryType` 显示为通用标签并记录 console warning。

## 文件结构

```text
website/
  functions/
    api/
      release-manifest.js       # 从 R2 读取 portal/v1/manifest.json
      download/[[path]].js      # 校验 manifest 后流式返回 R2 资源
      faq-feedback.js           # D1 聚合有用/无用反馈
  public/assets/products/       # 六个产品 Logo 与必要的产品静态图
  src/
    data/
      releasePortal.js          # Portal 文案、筛选器标签和空状态
      releasePortalFallback.js  # manifest 不可用时的安全空数据
    services/
      releasePortal.js           # 请求、Schema 基础校验、下载 URL、筛选纯函数
      faqFeedback.js              # 投票请求与失败状态
    components/
      ReleaseProductGrid.vue
      ReleaseFilters.vue
      ReleaseTimeline.vue
      ReleaseDownloadCenter.vue
      ReleaseFaqCenter.vue
      MarkdownRenderer.vue
    views/
      ReleasePortalView.vue
    router/index.js
    data/site.js
    components/ProductMatrix.vue
    components/SiteHeader.vue
    components/SiteFooter.vue
  tests/
    unit/releasePortal.service.spec.js
    unit/releasePortal.components.spec.js
    functions/releaseManifest.spec.js
    functions/download.spec.js
    functions/faqFeedback.spec.js
    e2e/release-portal.spec.js
  wrangler.toml
```

### 任务 1：建立 Portal 数据服务和降级状态

**文件：**
- 新建：`website/src/services/releasePortal.js`
- 新建：`website/src/data/releasePortalFallback.js`
- 新建：`website/src/data/releasePortal.js`
- 新建：`website/tests/unit/releasePortal.service.spec.js`
- 修改：`website/package.json`

- [ ] 先写服务测试：成功读取 manifest、HTTP 非 2xx、Schema 版本不兼容、缺少数组字段和网络超时分别返回可诊断错误或 fallback。
- [ ] 实现 `fetchReleaseManifest({ signal } = {})`，默认请求 `/api/release-manifest`，附带 `Accept: application/json`，超时 8 秒。
- [ ] 实现并导出纯函数 `filterTimeline(events, filters)`、`getLatestStableRelease(releases, productId)`、`formatDownloadUrl(asset)`；筛选项为产品、时间范围、变更类型和视图粒度。
- [ ] fallback 只包含六个产品的基本名称/入口和空集合，页面显示“数据暂不可用”并提供重试，不再请求 GitHub API。
- [ ] 安装 `marked`、`dompurify`、`katex`、`vitest`、`@vue/test-utils`、`jsdom`、`@playwright/test`，新增 `test`、`test:e2e`、`test:e2e:install` 脚本。
- [ ] 运行 `npm run test -- --run tests/unit/releasePortal.service.spec.js`，预期通过。
- [ ] 提交：`git commit -m "feat: 建立 Release Portal 数据消费层"`。

### 任务 2：增加 Cloudflare Pages 数据、下载和反馈接口

**文件：**
- 新建：`website/functions/api/release-manifest.js`
- 新建：`website/functions/api/download/[[path]].js`
- 新建：`website/functions/api/faq-feedback.js`
- 新建：`website/tests/functions/releaseManifest.spec.js`
- 新建：`website/tests/functions/download.spec.js`
- 新建：`website/tests/functions/faqFeedback.spec.js`
- 新建：`website/wrangler.toml`

- [ ] 先写 Function 测试，覆盖 R2 manifest 读取、ETag/Cache-Control、非法下载路径、未知产品/版本/文件、R2 404、正确 Content-Disposition 和 D1 投票幂等。
- [ ] `release-manifest.js` 从绑定 `RELEASE_BUCKET` 读取固定 key `portal/v1/manifest.json`，返回 `ETag`、`Cache-Control: public, max-age=300, stale-while-revalidate=3600`，R2 不可用时返回 503 JSON 错误。
- [ ] `download/[[path]].js` 只接受三段路径 `{productId}/{version}/{assetName}`；先读取 manifest 找到精确 `downloadPath`，再从 R2 返回流，不允许把用户输入直接拼接为任意 key。
- [ ] 下载响应设置 `Content-Type`、`Content-Length`、`Content-Disposition: attachment` 和 `Cache-Control: public, max-age=31536000, immutable`；R2 缺失返回 404，不重定向 GitHub。
- [ ] `faq-feedback.js` 只接受已存在 FAQ ID 与 `helpful: true|false`，使用 `faq_feedback(faq_id, helpful, day, fingerprint)` 唯一约束避免同一访客当天重复计票；响应只返回累计数字，不返回 IP。
- [ ] `wrangler.toml` 声明 `RELEASE_BUCKET` R2 binding、`FAQ_DB` D1 binding 和 Pages 构建输出 `website/dist`；用 `wrangler d1 create synlysai-release-feedback` 创建数据库后执行迁移 `migrations/0001_faq_feedback.sql`。
- [ ] 运行三个 Function 测试，预期通过；用 `wrangler pages dev website/dist` 做一次本地 API smoke test。
- [ ] 提交：`git commit -m "feat: 添加 R2 发布数据与下载反馈接口"`。

### 任务 3：将路由和现有 Changelog 迁移到 Release Portal

**文件：**
- 新建：`website/src/views/ReleasePortalView.vue`
- 修改：`website/src/router/index.js`
- 修改：`website/src/views/ChangelogView.vue`
- 修改：`website/src/App.vue`
- 修改：`website/src/data/site.js`

- [ ] 先写路由测试，验证 `/releases` 渲染 Portal、`/changelog` 重定向、`?product=spec-agent&view=panorama` 可恢复筛选状态。
- [ ] 新增路由 `{ path: '/releases', name: 'releases', component: ReleasePortalView }`；将 `/changelog` 改为 `redirect: to => ({ name: 'releases', query: to.query })`，保留历史链接。
- [ ] 从 `site.js` 删除 `VITE_GITHUB_OWNER`/`VITE_GITHUB_REPO` 直连配置，加入 Release Portal 导航、页面标题、筛选标签、空状态和错误文案；保留现有品牌首页和双语切换。
- [ ] `ChangelogView.vue` 不再调用 `githubReleases.js`；改为兼容壳或删除后确认无引用，避免浏览器直连 GitHub。
- [ ] `App.vue` 按路由名更新 `releases` 页面标题，语言切换后立即更新中英文 title。
- [ ] 运行路由与服务单测，预期通过。
- [ ] 提交：`git commit -m "refactor: 将更新日志迁移为 Release Portal 路由"`。

### 任务 4：实现六产品矩阵和入口状态

**文件：**
- 新建：`website/src/components/ReleaseProductGrid.vue`
- 修改：`website/src/components/ProductMatrix.vue`
- 修改：`website/src/components/SiteHeader.vue`
- 修改：`website/src/components/SiteFooter.vue`
- 修改：`website/src/data/site.js`
- 新建：`website/tests/unit/releasePortal.components.spec.js`

- [ ] 先写组件测试，验证六张卡片、最新稳定版、Web/下载 CTA、无版本状态、键盘聚焦和错误徽标。
- [ ] Release Portal 的产品卡从 manifest 读取，按 `catalog.yml` 顺序显示；卡片包含 Logo、中文/英文名、分类、极简定位、入口 CTA、最新版本和最近更新时间。
- [ ] `entryType=web` 的 CTA 打开 `webUrl`；`entryType=download` 的 CTA 跳到当前页 `#downloads` 并选中产品，不触发未知下载。
- [ ] 首页 `ProductMatrix.vue` 增加“查看发布动态”链接，产品卡补充 `productId`，但不复制版本数据；首页仍是品牌叙事，不变成后台工作台。
- [ ] 顶部和页脚导航加入 `Release Portal`/`发布中心`，使用现有 CSS 变量与按钮样式，不新增独立色彩体系。
- [ ] 运行 `npm run test -- --run tests/unit/releasePortal.components.spec.js`，预期通过。
- [ ] 提交：`git commit -m "feat: 添加六产品 Release 入口矩阵"`。

### 任务 5：实现双层时间线、粒度切换和筛选

**文件：**
- 新建：`website/src/components/ReleaseFilters.vue`
- 新建：`website/src/components/ReleaseTimeline.vue`
- 修改：`website/src/views/ReleasePortalView.vue`
- 修改：`website/src/styles.css`
- 修改：`website/src/data/releasePortal.js`

- [ ] 先写组件测试，验证默认里程碑视图、全景视图、产品/日期/变更类型组合筛选、空结果、展开详情和 URL query 同步。
- [ ] 默认视图只渲染 `level=release`；全景视图按 `occurredAt` 倒序渲染 Release 主节点及其下方的 aggregate/commit 子节点。
- [ ] Release 节点显示版本号、发布时间、双语摘要、`isLatestStable` 标识、下载入口和展开 Release Note；子节点显示变更类型、模块、聚合数量、双语摘要和短 SHA 列表。
- [ ] 筛选器使用产品下拉、日期范围、变更类型多选和视图分段控件；选择变化写入 `route.query`，刷新或分享 URL 后状态一致。
- [ ] “完整 Release Note”和 FAQ 答案统一进入 `detailsMarkdown` 渲染器，不在时间线中直接使用 `v-html`。
- [ ] 使用稳定网格/时间线尺寸，桌面端双栏、移动端单栏；移动端子节点可折叠，避免横向滚动和文本覆盖。
- [ ] 运行组件测试并执行 `npm run build`，预期无构建错误。
- [ ] 提交：`git commit -m "feat: 添加 Release 与 Commit 融合时间线"`。

### 任务 6：实现版本下载中心

**文件：**
- 新建：`website/src/components/ReleaseDownloadCenter.vue`
- 新建：`website/src/services/downloads.js`
- 修改：`website/src/views/ReleasePortalView.vue`
- 修改：`website/src/styles.css`

- [ ] 先写测试，验证产品分组、最新稳定版高亮、预发布标签、平台/架构筛选、无资源状态和下载 URL 只指向同域 `/api/download/`。
- [ ] 按产品分组显示历史版本；每组第一条稳定版置顶，其余版本可展开，预发布默认折叠。
- [ ] 每个资源显示平台、架构、文件大小、SHA-256 和“查看对应时间线”链接；缺少校验和时显示“源包未提供校验和”，不在前端计算伪造值。
- [ ] `formatDownloadUrl(asset)` 仅接受 manifest 内的 `downloadPath`，禁止接受完整外部 URL；下载失败显示重试与联系支持入口。
- [ ] 支持 SmartAccess 的手动上传资源和定制版本，但来源标记为 `manual`，不与 GitHub Release 混淆。
- [ ] 运行下载组件与 Function 测试，预期通过。
- [ ] 提交：`git commit -m "feat: 添加统一版本下载中心"`。

### 任务 7：实现双语 FAQ、Markdown/公式渲染和反馈

**文件：**
- 新建：`website/src/components/ReleaseFaqCenter.vue`
- 新建：`website/src/components/MarkdownRenderer.vue`
- 新建：`website/src/services/faqFeedback.js`
- 修改：`website/src/views/ReleasePortalView.vue`
- 修改：`website/src/styles.css`
- 修改：`website/src/data/releasePortal.js`

- [ ] 先写测试，覆盖关键词模糊搜索、高亮、分类过滤、手风琴展开/收起、Markdown 代码块、KaTeX 公式和有用/无用投票成功/失败状态。
- [ ] FAQ 分类固定为 `general`、`product`、`installation`、`science`；支持按产品和 `versionRange` 过滤。
- [ ] 搜索使用小写化后的 `question` 与纯文本答案索引，输入即更新结果；高亮只作用于文本节点，不把用户关键词拼进 HTML。
- [ ] `MarkdownRenderer.vue` 使用 `marked` 解析、`DOMPurify` 清洗，链接只允许 `https:`、`mailto:`；KaTeX 仅处理 `$...$` 与 `$$...$$`，关闭 HTML 注入。
- [ ] 每条 FAQ 底部显示“有用/无用”，提交后显示当前会话结果；网络失败保留问题内容并提供 Issue/论坛/技术支持链接。
- [ ] FAQ 答案可显示关联版本和时间线节点，点击后切换 Portal 筛选，不离开页面。
- [ ] 运行 FAQ 和渲染器测试，预期通过。
- [ ] 提交：`git commit -m "feat: 添加双语 FAQ 与问题反馈"`。

### 任务 8：完成响应式、可访问性、E2E 和部署配置

**文件：**
- 修改：`website/src/styles.css`
- 修改：`website/index.html`
- 新建：`website/tests/e2e/release-portal.spec.js`
- 修改：`website/package.json`
- 修改：`website/wrangler.toml`
- 新建：`website/.env.example`

- [ ] Playwright E2E 覆盖：加载 `/releases`、切换中英文、产品筛选、里程碑/全景切换、时间线展开、下载请求、FAQ 搜索和投票失败恢复。
- [ ] 在 1440×900、1024×768、768×1024、390×844 四个视口截图检查：无标题/按钮/卡片溢出、无横向滚动、时间线节点不重叠、长版本名可换行。
- [ ] 对导航、分段控件、筛选器、手风琴和下载按钮补齐键盘焦点、`aria-label`、`aria-expanded`、`aria-pressed` 和屏幕阅读器文本。
- [ ] 页面加载显示骨架状态，manifest 失败显示可重试错误，空集合显示明确空状态；禁止把内部异常堆栈展示给用户。
- [ ] `.env.example` 固定列出 `VITE_RELEASE_DATA_ENDPOINT=/api/release-manifest`、`VITE_SUPPORT_URL`、`VITE_ISSUE_URL`；生产环境不放 GitHub Token 或 AI Key。
- [ ] 用 `npm run build`、`npm run test -- --run`、`npm run test:e2e` 验证；用 `wrangler pages dev dist` 做最终 smoke test。
- [ ] 提交：`git commit -m "test: 完成 Release Portal 响应式与端到端验收"`。

## 验收标准

- 品牌首页原有内容和双语切换保持可用；顶部、页脚和产品卡可进入 `/releases`。
- Release Portal 首屏能看到六产品矩阵；最新稳定版、入口类型和最近动态明确可读。
- 里程碑/全景两个视图、产品/日期/类型筛选与 URL 分享状态一致。
- 所有下载请求只经过同域 `/api/download/`，R2 404/资源错误有可恢复提示。
- FAQ 支持四类分类、模糊搜索、高亮、Markdown/代码块/公式和反馈状态。
- manifest 不可用时页面仍能展示产品入口和可理解的降级提示，不请求 GitHub API。
- 通过四个视口的截图、键盘导航和 Playwright E2E，无文本覆盖、按钮换行错位或无障碍基本错误。

## 上线顺序与回滚

1. 先用空集合 manifest 联调 `/api/release-manifest`、产品矩阵和空状态。
2. 开启 `products.json` 与一条人工 FAQ，验证双语渲染和 D1 投票。
3. 接入正式 Release 与一个 SmartAccess 手动资源，验证 R2 下载和校验和显示。
4. 合并第一批时间线候选，开启默认里程碑视图，再开放全景视图。
5. 回滚时切换 R2 `portal/v1/manifest.json` 到上一版本；前端代码无需回滚即可继续展示旧数据。

## 假设与边界

- Cloudflare Pages 绑定同一自定义域；R2 bucket 名称为 `synlysai-release-portal`，D1 数据库名为 `synlysai-release-feedback`，真实资源 ID 在部署命令输出后写入 Wrangler 配置。
- 官网不实现登录、FAQ 编辑器、AI 生成或 GitHub 权限管理；这些属于 `.github` GitOps 或二期 CMS。
- 现有 `githubReleases.js` 在无引用后删除；不保留浏览器直连 GitHub 的隐式 fallback。
- 目前没有可验证的 SmartAccess 公开 Release 时，下载中心显示空状态，不伪造版本号、安装包或兼容性结论。
