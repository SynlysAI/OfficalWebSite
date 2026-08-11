# SynlysAI 官方网站

SynlysAI 面向企业研发场景，提供 AI 自主科研平台与产品发布中心。本项目是基于 Vue 3 和 Vite 构建的前端网站，包含产品介绍、版本发布、下载资源、时间线和 FAQ 等页面。

## 技术栈

- Vue 3（Composition API）
- Vue Router 5
- Vite 8
- 原生 CSS
- Cloudflare Pages Functions、R2 与 D1（发布资源和 FAQ 反馈）

## 快速开始

```bash
cd website
npm install
npm run dev
```

开发服务器默认监听 `0.0.0.0:5175`：

- 首页：http://localhost:5175/
- 产品发布中心：http://localhost:5175/releases
- 更新日志（兼容入口）：http://localhost:5175/changelog

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 构建生产文件到 `website/dist` |
| `npm run preview` | 以 `0.0.0.0:4175` 预览生产构建 |
| `npm test` | 运行 Vitest 单元测试 |
| `npm run test:e2e` | 运行 Playwright 端到端测试 |

## 项目结构

```text
website/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 页面组件
│   ├── data/               # 中英文站点内容与发布中心回退数据
│   ├── router/             # Vue Router 路由配置
│   ├── services/           # 发布数据、下载和 FAQ 接口
│   ├── views/              # 页面视图
│   ├── App.vue
│   └── main.js
├── functions/              # Cloudflare Pages Functions API
├── migrations/             # D1 数据库迁移
├── vite.config.js
└── wrangler.toml
```

## 环境变量

复制 `website/.env.example` 为 `website/.env.local`，按部署环境填写：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `VITE_RELEASE_DATA_ENDPOINT` | 发布清单接口地址 | `/api/release-manifest` |
| `VITE_SUPPORT_URL` | 支持入口地址 | 空 |
| `VITE_ISSUE_URL` | 问题反馈地址 | 空 |

发布清单接口需要返回 `products`、`releases`、`timeline` 和 `faqs` 四个数组；接口不可用时，前端会使用内置回退数据。

## 部署

先完成生产构建，再使用 Wrangler 部署 `dist` 目录：

```bash
cd website
npm run build
npx wrangler pages deploy dist --project-name synlysai-official-site
```

Cloudflare 绑定配置位于 `website/wrangler.toml`。部署前请将 D1 配置中的 `database_id` 占位值替换为实际数据库 ID，并准备好 R2 和 D1 资源。
