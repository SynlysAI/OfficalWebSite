# SynlysAI 官方网站

AI autonomous research platform for enterprise R&D.
由 Vue 3 + Vite 构建驱动的 AI4MS 自主科研品牌站点。

## 项目概述

SynlysAI 以 AI4MS 为统一入口，将谱图智能（Spec Agent）、高分子材料研发协作（Poly Agent）和实验系统接入（SpecLabOS）三大产品矩阵组织为可执行、可追溯、可协作的科研闭环。

## AI4MS 研发闭环

把分散研发动作组织成可运行的 AI4MS 闭环。平台先接住研发目标，再分配到分析、材料研发和实验执行模块，形成可追溯的研发闭环。

### 01 目标定义

把材料体系、变量、约束、目标和验收条件写成可执行的研发任务。

### 02 智能分析

由 Spec Agent 与 Poly Agent 承接：

| 能力 | 说明 |
|------|------|
| 谱图解析 | AI 驱动的 NMR、IR、MS 等谱图自动解析与结构归属 |
| 算法运行 | 内置化学计量学与机器学习算法，一键执行分析流程 |
| 知识检索 | 跨文献、数据库、实验记录的多源知识检索与关联 |
| 候选建议 | 基于分析结果智能推荐候选分子、配方或反应路径 |
| 实验方案生成 | 自动生成可执行的实验方案，包含条件、步骤与预期结果 |
| 实验数据挖掘与建模 | 从历史实验数据中挖掘规律、建立预测模型，驱动实验迭代 |
| 多目标优化与决策 | 在性能、成本、可合成性等多目标间搜索帕累托最优解 |
| 结果验证与报告回写 | 自动验证实验结果，生成结构化报告并回写至知识库 |

### 03 材料研发

（待补充）

### 04 实验执行

（待补充）

## 技术栈

- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite 8
- **路由**：Vue Router 5
- **样式**：原生 CSS 变量
- **数据源**：GitHub Releases API（更新日志页）

## 项目结构

```
website/
├── index.html                # 入口 HTML
├── package.json
├── vite.config.js            # Vite 配置（开发服务器监听 0.0.0.0:5175）
├── public/
│   └── assets/               # 静态资源（图片、SVG）
└── src/
    ├── main.js               # 应用入口
    ├── App.vue               # 根组件（Shell 布局）
    ├── styles.css            # 全局样式与 CSS 变量
    ├── data/
    │   └── site.js           # 站点配置与双语内容数据
    ├── router/
    │   └── index.js          # 路由配置
    ├── composables/
    │   ├── useLanguage.js    # 语言切换逻辑
    │   └── useSiteContent.js # 站点内容组合函数
    ├── services/
    │   └── githubReleases.js # GitHub Releases 数据获取
    ├── components/
    │   ├── SiteHeader.vue    # 顶部导航
    │   ├── SiteFooter.vue    # 页脚
    │   ├── HeroSection.vue   # 首屏主视觉
    │   ├── ChallengeBanners.vue  # 行业挑战
    │   ├── ProductMatrix.vue # 产品矩阵
    │   ├── ModuleGrid.vue    # 平台能力模块
    │   ├── LayerGrid.vue     # 研发闭环层级
    │   ├── AssetShowcase.vue # 架构图与能力展示
    │   └── ProofStrip.vue    # 能力标签/证明
    └── views/
        ├── HomeView.vue      # 首页
        └── ChangelogView.vue # 更新日志页
```

## 快速开始

```bash
# 进入项目目录
cd website

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

开发服务器默认监听 `0.0.0.0:5175`，可通过局域网内其他设备访问。

## 页面路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | HomeView | 首页（品牌展示、行业挑战、产品矩阵、平台能力、关于我们） |
| `/changelog` | ChangelogView | 更新日志（从 GitHub Releases 拉取） |

## 功能特性

- **双语支持**：中文 / English 一键切换，内容配置集中管理于 `src/data/site.js`
- **响应式布局**：适配 1280 / 1024 / 768 / 480 断点，桌面多栏、移动端单栏堆叠
- **更新日志页**：通过 GitHub Releases API 动态拉取版本发布记录
- **纯前端部署**：无后端依赖，构建产物为静态文件，可直接部署到任意静态托管服务

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_GITHUB_OWNER` | GitHub 仓库所有者 | `SynlysAI` |
| `VITE_GITHUB_REPO` | GitHub 仓库名 | `.github` |

## 品牌规范

- 主品牌：**SynlysAI**（首屏主标题使用）
- 平台体系：**AI4MS**（作为方法论来源和技术背景出现）
- 产品矩阵：Spec Agent（谱图智能）、Poly Agent（高分子材料）、SpecLabOS（实验系统）
