# Release Portal Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将发布中心改为五项可深链的横向 Tab 门户，并统一中英文正式对外文案。

**Architecture:** `ReleasePortalView.vue` 继续负责数据加载和 URL 状态，以 route hash 派生活动 Tab，并只挂载对应内容组件。现有产品、时间线、下载与 FAQ 组件保持职责不变，仅增加时间线标题入口和正式文案；CSS 增加稳定、响应式的门户导航样式。

**Tech Stack:** Vue 3、Vue Router、原生 CSS、Vitest、Vue Test Utils、Playwright。

---

### Task 1: 锁定 Tab 路由行为

**Files:**
- Modify: `website/tests/unit/releasePortal.routes.spec.js`
- Modify: `website/src/views/ReleasePortalView.vue`

- [ ] **Step 1: 写失败测试**

增加断言：默认只显示 `overview`；点击 `evolution` 后 hash 为 `#evolution` 且只显示技术演进面板；直接访问 `#faq` 恢复常见问题面板；产品下载动作写入 `product` query 并切换到 `#downloads`。

```js
expect(wrapper.get('[role="tablist"]').findAll('[role="tab"]')).toHaveLength(5)
expect(wrapper.get('[role="tabpanel"]').attributes('data-portal-panel')).toBe('overview')
await wrapper.get('[data-portal-tab="evolution"]').trigger('click')
expect(router.currentRoute.value.hash).toBe('#evolution')
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- --run tests/unit/releasePortal.routes.spec.js`

Expected: FAIL，页面尚无 `role="tablist"` 和 `data-portal-tab`。

- [ ] **Step 3: 实现最小 Tab 状态与面板切换**

在 `ReleasePortalView.vue` 定义稳定 Tab ID，使用 route hash 派生活动项，通过 `router.replace` 保留 query 并更新 hash。

```js
const PORTAL_TAB_IDS = ['overview', 'evolution', 'releases', 'downloads', 'faq']
const activeTab = computed(() => {
  const tabId = route.hash.slice(1)
  return PORTAL_TAB_IDS.includes(tabId) ? tabId : 'overview'
})
const selectTab = (tabId) => router.replace({ query: route.query, hash: `#${tabId}` })
```

模板使用语义化 Tab，并按活动项仅挂载一个 `role="tabpanel"`。版本发布面板复用 `ReleaseTimeline`，传入 `view="release"` 与全量时间线；技术演进面板保留当前筛选结果。

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- --run tests/unit/releasePortal.routes.spec.js`

Expected: PASS。

### Task 2: 统一正式文案与组件标题

**Files:**
- Modify: `website/src/data/site.js`
- Modify: `website/src/data/releasePortal.js`
- Modify: `website/src/components/ReleaseProductGrid.vue`
- Modify: `website/src/components/ReleaseTimeline.vue`
- Modify: `website/src/components/ReleaseDownloadCenter.vue`
- Modify: `website/src/components/ReleaseFaqCenter.vue`
- Modify: `website/tests/unit/releasePortal.components.spec.js`

- [ ] **Step 1: 写失败测试**

断言页面和组件使用“产品发布中心、产品概览、技术演进、版本发布、资源下载、常见问题、版本与资源、查看版本说明、查看相关更新”等正式中英文文案，并验证时间线接受独立标题。

```js
const wrapper = mount(ReleaseTimeline, {
  props: { events: timelineEvents, releases, language: 'zh', view: 'release', title: '版本发布记录' },
})
expect(wrapper.get('h2').text()).toBe('版本发布记录')
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- --run tests/unit/releasePortal.components.spec.js tests/unit/releasePortal.routes.spec.js`

Expected: FAIL，仍显示旧的内部建设口径。

- [ ] **Step 3: 实现文案与标题入口**

`releasePortalCopy` 增加 `tabs` 和 `panels`，替换旧标题；`ReleaseTimeline` 增加可选 `title` prop。

```js
title: { type: String, default: '' }
```

```vue
<h2 id="release-timeline-title">{{ title || copy.timeline.title }}</h2>
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test -- --run tests/unit/releasePortal.components.spec.js tests/unit/releasePortal.routes.spec.js`

Expected: PASS。

### Task 3: 实现门户式横向导航与响应式

**Files:**
- Modify: `website/src/styles.css`
- Modify: `website/tests/e2e/release-portal.spec.js`

- [ ] **Step 1: 更新 E2E 交互路径**

在技术演进、下载和 FAQ 操作前切换对应 Tab，并断言五项 Tab 为单行、页面无横向溢出、活动项具备 `aria-selected="true"`。

```js
await page.locator('[data-portal-tab="evolution"]').click()
await expect(page.locator('[data-portal-tab="evolution"]')).toHaveAttribute('aria-selected', 'true')
```

- [ ] **Step 2: 增加导航样式**

使用五列网格、固定最小高度、底部活动指示；在窄屏将 tablist 设为单行横向滚动，页面本身不溢出。内容面板不增加外层卡片。

- [ ] **Step 3: 运行完整验证**

Run: `npm run test -- --run`

Expected: 全部 Vitest 测试通过。

Run: `npm run build`

Expected: Vite 构建成功。

Run: `npm run test:e2e`

Expected: Chromium 的桌面与移动项目全部通过并生成截图。

### Task 4: 提交并推送功能分支

**Files:**
- Modify: `docs/superpowers/specs/2026-08-11-release-portal-tabs-design.md`
- Modify: `docs/superpowers/plans/2026-08-11-release-portal-tabs.md`

- [ ] **Step 1: 检查变更与敏感信息**

Run: `git diff --check && git status --short`

Expected: 无空白错误，仅包含本次发布中心变更。

- [ ] **Step 2: 提交**

```text
优化产品发布中心导航与文案

- 将五类发布内容调整为可深链的横向 Tab
- 统一中英文正式对外标题和操作文案
- 补充路由、组件及多视口端到端验证
```

- [ ] **Step 3: 推送远端分支**

Run: `git push -u origin feat/release-portal`

Expected: 远端创建 `feat/release-portal` 并设置 upstream。

