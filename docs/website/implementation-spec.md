# SynlysAI 官网实现规格

## 技术栈
- Vue 3
- Vite
- Element Plus
- 原生 CSS 变量

## 工程结构
```text
website/
  index.html
  package.json
  vite.config.js
  public/
    assets/
  src/
    main.js
    App.vue
    styles.css
    data/
      site.js
    components/
      SiteHeader.vue
      HeroSection.vue
      ProofStrip.vue
      LayerGrid.vue
      ModuleGrid.vue
      AssetShowcase.vue
      ClosingCta.vue
```

## 页面拆分
- `SiteHeader`：导航、品牌、行动按钮
- `HeroSection`：主标题、副标题、CTA、品牌图形
- `ProofStrip`：能力标签与简短证明
- `LayerGrid`：AI4MS 六层闭环
- `ModuleGrid`：平台软件模块
- `AssetShowcase`：闭环图、架构图、执行端设备图
- `ClosingCta`：预约演示与联系入口

## 交互与响应式
- 断点以 `1280 / 1024 / 768 / 480` 为主
- 桌面端双栏或三栏，移动端单栏堆叠
- 按钮和标签高度固定，避免文案挤压布局
- 图片容器必须有明确比例

## 验收标准
- 首屏能清楚表达品牌、场景和价值
- 页面没有文本遮挡、图片溢出或按钮换行错位
- 本地素材可正确加载
- 结构、配色和气质统一到 SynlysAI 品牌
- 不引入后端依赖

## 开发顺序
1. 先建工程骨架
2. 再做数据配置
3. 再做页面组件
4. 再接入本地素材
5. 最后跑构建和启动预览

