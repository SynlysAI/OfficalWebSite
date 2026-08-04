export const links = {
  demo: 'https://ai4ms.xmuzc.com/',
  about: 'https://github.com/SynlysAI',
}

export const brand = {
  name: 'SynlysAI',
  platform: 'AI4MS',
  fullName: 'SynlysAI',
  logo: '/assets/logo.png',
  heroVisual: '/assets/ai4ms-hero-bg-new.png',
}

export const releaseSource = {
  owner: import.meta.env.VITE_GITHUB_OWNER || 'SynlysAI',
  repo: import.meta.env.VITE_GITHUB_REPO || '.github',
}

export const pageTitles = {
  zh: {
    home: 'SynlysAI | AI4MS 自主科研平台',
    changelog: '更新日志 | SynlysAI',
  },
  en: {
    home: 'SynlysAI | AI4MS autonomous research platform',
    changelog: 'Changelog | SynlysAI',
  },
}

export const languages = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
]

export const copy = {
  zh: {
    navigation: [
      { label: '首页', to: { name: 'home' } },
      { label: '行业挑战', to: { name: 'home', hash: '#challenges' } },
      { label: '产品矩阵', to: { name: 'home', hash: '#products' } },
      { label: '平台能力', to: { name: 'home', hash: '#matrix' } },
      { label: '关于我们', to: { name: 'home', hash: '#about' } },
      { label: '更新日志', to: { name: 'changelog' } },
    ],
    footerLinks: [
      { label: '更新日志', to: { name: 'changelog' } },
    ],
    actions: {
      demo: '产品体验',
      about: '关于我们',
      products: '查看产品矩阵',
      contact: '联系入口',
    },
    hero: {
      kicker: 'SynlysAI · AI4MS',
      title: '面向企业研发的 AI 自主科研平台',
      summary:
        'SynlysAI 以 AI4MS 为统一入口，将谱图智能、材料研发智能体和实验系统连接为可执行、可追溯、可协作的科研闭环，让每一次实验投入转化为可复用的研发上下文。',
      primaryAction: '产品体验',
      primaryHref: links.demo,
      secondaryAction: '关于我们',
      secondaryHref: links.about,
      badges: ['AI4MS 统一平台', '三大产品矩阵', '企业级研发闭环'],
      platformFrameLabel: 'AI 自主科研平台 · 核心闭环',
      highlights: [
        { value: '任务定义', label: 'Research Spec 形式化研发目标' },
        { value: '工具编排', label: 'Skill 统一注册与调用' },
      ],
      panelTitle: '从研发问题到实验与证据回写',
      panelBody:
        '平台把分析、材料研发协作和实验执行组织在同一入口下，让任务、数据、证据和审计记录形成可复用的研发上下文。',
    },
    about: {
      eyebrow: '关于我们',
      title: 'SynlysAI 构建企业可托付的 AI4S 研发基础设施',
      summary:
        '我们面向材料、化学与工艺研发团队，把任务定义、算法运行、知识检索、实验执行和审计追溯组织到同一套平台体验中。',
      image: { src: '/assets/基础设施.svg', alt: 'AI4MS 平台基础设施 — 统一入口、模块分层与能力封装' },
      cards: [
        {
          title: '平台定位',
          text: '以 AI4MS 为统一入口，连接谱图智能、材料研发与实验系统。',
        },
        {
          title: '闭环能力',
          text: '从问题定义到结果回写，形成可追溯的完整研发链路。',
        },
        {
          title: '企业级协作',
          text: '围绕数据安全与权限边界，构建团队可托付的研发基础设施。',
        },
      ],
    },
    challengeBanners: {
      eyebrow: '行业挑战',
      title: 'AI4MS 要解决的五个核心问题',
      summary:
        '材料研发进入自驱实验室阶段后，真正的瓶颈不只是模型能力，而是规模、执行、安全、协同和平台化闭环共同构成的工程问题。',
      banners: [
        {
          code: '01',
          title: '系统收敛',
          question: '规模扩大后，如何抑制科研基础设施的系统熵？',
          answer:
            'AI4MS 通过统一入口、模块分层、能力封装、任务队列和数据回写，把分散的模型、设备与实验事实组织为可编排基础设施。',
          accent: 'blue',
        },
        {
          code: '02',
          title: '实验可执行性',
          question: 'AI 生成的方案，如何从“能写出来”变成“能被实验室执行”？',
          answer:
            'AI4MS 不止生成实验方案，还检查设备约束、执行状态、结果回传和失败修正，让智能进入真实实验闭环。',
          accent: 'teal',
        },
        {
          code: '03',
          title: '安全边界',
          question: '语法正确的指令，如何跨过真实实验的安全边界？',
          answer:
            'AI4MS 将“语义生成”和“物理执行”分层，通过执行前校验、人工确认、状态回传、运行日志和审计追溯约束工具调用。',
          accent: 'amber',
        },
        {
          code: '04',
          title: '多地协同',
          question: '单点体验，如何扩展为多设备、多工作站、多地点协同？',
          answer:
            'AI4MS 以 SpecLabOS、SmartAccess、远程参数下发和数据采集为工程雏形，支持跨实验资源的任务分发与数据一致性。',
          accent: 'violet',
        },
        {
          code: '05',
          title: '平台级智能能力',
          question: '专业智能体，如何从聊天框升级为平台级研发能力？',
          answer:
            'AI4MS 将任务定义、算法注册、知识检索、报告生成和优化推荐组织为可调用能力，形成面向材料研发的闭环协作底座。',
          accent: 'steel',
        },
      ],
    },
    products: {
      eyebrow: '产品矩阵',
      title: '三大产品覆盖分析、材料研发和实验执行',
      summary: 'AI4MS 是统一入口；Spec Agent、Poly Agent 和 SpecLabOS 分别承接谱图智能、高分子研发协作和实验系统运行，三者协同构成完整的产品矩阵。',
      cards: [
        {
          code: '01',
          name: 'Spec Agent',
          category: '谱图智能分析',
          description:
            '面向 NMR、IR、Raman、GPC、LCMS 等多谱种任务，组织解析、质控、事实回写和报告追溯。',
          bullets: ['多谱种解析', '任务编排', '报告回写'],
          accent: 'blue',
        },
        {
          code: '02',
          name: 'Poly Agent',
          category: '高分子材料研发协作底座',
          description:
            '围绕高分子材料研发，把算法、知识库、计算任务、运行记录和结果回看组织成低门槛协作平台。',
          bullets: ['数据安全', 'Credit', '低学习成本', '常用功能', '规模效应'],
          accent: 'violet',
        },
        {
          code: '03',
          name: 'SpecLabOS',
          category: '实验系统与设备接入',
          description:
            '承接实验任务下发、设备接入、运行状态回传和执行证据沉淀，让实验链路进入平台闭环。',
          bullets: ['实验执行', '仪器接入', '状态回传'],
          accent: 'teal',
        },
      ],
      stepsTitle: '把分散研发动作组织成可运行的 AI4MS 闭环',
      stepsSummary:
        '平台先接住研发目标，再分配到分析、材料研发和实验执行模块，形成可追溯的研发闭环。',
      steps: [
        {
          code: '01',
          title: '目标定义',
          text: '把材料体系、变量、约束、目标和验收条件写成可执行的研发任务。',
        },
        {
          code: '02',
          title: '智能分析',
          text: '由 Spec Agent 与 Poly Agent 承接谱图解析、算法运行、知识检索、候选建议、实验方案生成、实验数据挖掘与建模、多目标优化与决策和结果验证与报告回写。',
        },
        {
          code: '03',
          title: '材料研发',
          text: 'Poly Agent 组织算法货架、知识库、计算任务与结果回看，支撑高分子材料研发协作。',
        },
        {
          code: '04',
          title: '实验执行',
          text: 'SpecLabOS 承接实验任务下发、设备接入、状态回传与执行证据沉淀。',
        },
      ],
    },
    workflow: {
      eyebrow: '研发闭环',
      title: '把分散研发动作组织成可运行的 AI4MS 闭环',
      summary:
        '平台先接住研发目标，再分配到分析、材料研发和实验执行模块，形成可追溯的研发闭环。',
      steps: [
        {
          code: '01',
          title: '目标定义',
          text: '把材料体系、变量、约束、目标和验收条件写成可执行的研发任务。',
        },
        {
          code: '02',
          title: '智能分析',
          text: '由 Spec Agent 与 Poly Agent 承接谱图解析、算法运行、知识检索、候选建议、实验方案生成、实验数据挖掘与建模、多目标优化与决策和结果验证与报告回写。',
        },
        {
          code: '03',
          title: '实验协作',
          text: 'SpecLabOS 接入实验系统与设备软件，回传运行状态与实验结果。',
        },
        {
          code: '04',
          title: '证据回写',
          text: '报告、数据、来源、贡献与审计事件沉淀为下一轮可复用的研发上下文。',
        },
      ],
    },
    matrix: {
      eyebrow: '平台架构与能力',
      title: '多维能力体系',
      summary:
        'AI4MS 平台围绕研发全流程构建的多维能力体系，涵盖科学上下文、敏捷开发、定制化集成、数据安全与用户体验等核心维度。',
      modules: [
        {
          name: 'AI4MS 统一门户',
          tag: '入口',
          description: '承接账号、产品入口、任务导航和跨模块工作流。',
        },
        {
          name: 'Spec Agent',
          tag: '分析',
          description: '多谱种解析、质控评测、事实抽取与报告回写。',
        },
        {
          name: 'Poly Agent',
          tag: '材料',
          description: '算法货架、知识库、计算任务、贡献标注和结果回看。',
        },
        {
          name: 'SpecLabOS',
          tag: '实验',
          description: '实验执行、设备接入、状态采集与执行证据沉淀。',
        },
        {
          name: '数据安全',
          tag: '治理',
          description: '访问控制、审计留痕、项目隔离和敏感信息边界。',
        },
        {
          name: 'Credit 机制',
          tag: '贡献',
          description: '记录算法、知识、模型、结果的来源与责任人。',
        },
        {
          name: '知识闭环',
          tag: '复用',
          description: '把文献、报告、经验和运行结果沉淀为可检索证据。',
        },
        {
          name: '报告与追溯',
          tag: '审计',
          description: '生成可交付报告，并保留任务链路与证据来源。',
        },
      ],
    },
    showcase: {
      eyebrow: '平台架构与能力',
      title: '多维能力体系',
      summary:
        'AI4MS 平台围绕研发全流程构建的多维能力体系，涵盖科学上下文、敏捷开发、定制化集成、数据安全与用户体验等核心维度。',
      images: [
        { src: '/assets/科学上下文.svg', alt: '科学上下文', caption: '科学上下文 — 从研发问题到实验与证据回写的完整闭环' },
        { src: '/assets/敏捷开发.svg', alt: '敏捷开发', caption: '敏捷开发 — 快速迭代、持续交付与反馈驱动' },
        { src: '/assets/定制化开发.svg', alt: '定制化开发', caption: '定制化开发 — 面向企业需求的深度定制与集成能力' },
        { src: '/assets/数据安全.svg', alt: '数据安全', caption: '数据安全 — 访问控制、审计留痕与项目隔离' },
        { src: '/assets/用户友好.svg', alt: '用户友好', caption: '用户友好 — 低学习成本、直观交互与协作体验' },
      ],
    },
    changelog: {
      eyebrow: 'Changelog',
      title: '更新日志',
      summary: '记录 SynlysAI 每次版本发布的新功能、问题修复与体验改进，所有更新均源自 GitHub 公开记录。',
      sourceAction: '查看 GitHub 更新源',
      loading: '正在从 GitHub 拉取更新日志...',
      errorTitle: '暂时无法读取 GitHub 更新数据',
      sourceLink: '打开 GitHub 更新源',
      emptyTitle: '暂无公开更新',
      emptyBody: '仓库还没有可展示的公开更新记录。',
      summaryLabels: ['最新版本', '最近更新', '公开记录'],
      originalAction: 'GitHub 原文',
      unpublished: '未更新',
      emptyReleaseBody: '该版本暂无更新说明正文。',
    },
  },
  en: {
    navigation: [
      { label: 'Home', to: { name: 'home' } },
      { label: 'Challenges', to: { name: 'home', hash: '#challenges' } },
      { label: 'Products', to: { name: 'home', hash: '#products' } },
      { label: 'Capabilities', to: { name: 'home', hash: '#matrix' } },
      { label: 'About', to: { name: 'home', hash: '#about' } },
      { label: 'Changelog', to: { name: 'changelog' } },
    ],
    footerLinks: [
      { label: 'Changelog', to: { name: 'changelog' } },
    ],
    actions: {
      demo: 'Product Experience',
      about: 'About us',
      products: 'View products',
      contact: 'Contact',
    },
    hero: {
      kicker: 'SynlysAI · AI4MS',
      title: 'AI autonomous research platform for enterprise R&D',
      summary:
        'SynlysAI uses AI4MS as the unified entry, connecting spectral intelligence, materials R&D agents, and lab execution into an executable, traceable, and collaborative research loop — turning every experiment into reusable R&D context.',
      primaryAction: 'Product Experience',
      primaryHref: links.demo,
      secondaryAction: 'About us',
      secondaryHref: links.about,
      badges: ['AI4MS unified platform', 'Three-product matrix', 'Enterprise R&D loop'],
      platformFrameLabel: 'AI Autonomous R&D Platform · Core Loop',
      highlights: [
        { value: 'Task Definition', label: 'Research Spec formalizes R&D goals' },
        { value: 'Tool Orchestration', label: 'Skills registered and invoked uniformly' },
        { value: 'Evidence Return', label: 'Memory captures research context' },
      ],
      panelTitle: 'From research problem to experiments and evidence return',
      panelBody:
        'The platform organizes analysis, materials R&D collaboration, and lab execution under one entry so tasks, data, evidence, and audit records become reusable R&D context.',
    },
    about: {
      eyebrow: 'Who we are',
      title: 'SynlysAI builds trusted AI4S infrastructure for enterprise R&D',
      summary:
        'For materials, chemistry, and process teams, we organize task definition, algorithm runs, knowledge retrieval, lab execution, and audit trails into one platform experience.',
      image: { src: '/assets/基础设施.svg', alt: 'AI4MS platform infrastructure — unified entry, module layering, and capability packaging' },
      cards: [
        {
          title: 'Platform positioning',
          text: 'AI4MS as the unified entry, connecting spectral intelligence, materials R&D, and lab systems.',
        },
        {
          title: 'Closed-loop capability',
          text: 'From problem definition to evidence return — a traceable, complete R&D chain.',
        },
        {
          title: 'Enterprise collaboration',
          text: 'Data security and permission boundaries — infrastructure teams can trust.',
        },
      ],
    },
    challengeBanners: {
      eyebrow: 'Industry challenges',
      title: 'Five core problems AI4MS is built to solve',
      summary:
        'As materials R&D moves toward self-driving labs, the bottleneck is not only model intelligence. It is the engineering system that must control scale, execution, safety, collaboration, and closed-loop reuse.',
      banners: [
        {
          code: '01',
          title: 'System convergence',
          question: 'How can research infrastructure suppress system entropy as scale grows?',
          answer:
            'AI4MS uses a unified entry, layered modules, capability packaging, task queues, and data return to organize scattered models, devices, and experimental facts into composable infrastructure.',
          accent: 'blue',
        },
        {
          code: '02',
          title: 'Lab executability',
          question: 'How do AI-generated plans move from writable text to executable lab workflows?',
          answer:
            'AI4MS does more than draft experimental plans. It checks device constraints, execution state, result return, and failure correction so intelligence enters a real experimental loop.',
          accent: 'teal',
        },
        {
          code: '03',
          title: 'Safety boundary',
          question: 'How can syntactically correct instructions cross real laboratory safety boundaries?',
          answer:
            'AI4MS separates semantic generation from physical execution, constraining tool calls through pre-run checks, human confirmation, state return, run logs, and audit traces.',
          accent: 'amber',
        },
        {
          code: '04',
          title: 'Distributed collaboration',
          question: 'How does one product experience scale to multiple devices, workstations, and lab sites?',
          answer:
            'AI4MS uses SpecLabOS, SmartAccess, remote parameter dispatch, and data collection as engineering foundations for task distribution and data consistency across lab resources.',
          accent: 'violet',
        },
        {
          code: '05',
          title: 'Platform intelligence',
          question: 'How does a specialist agent grow from a chat box into platform-level R&D capability?',
          answer:
            'AI4MS organizes task definition, algorithm registration, knowledge retrieval, report generation, and optimization recommendations into callable loop capability for materials R&D.',
          accent: 'steel',
        },
      ],
    },
    products: {
      eyebrow: 'Product matrix',
      title: 'Three products cover analysis, materials R&D, and lab execution',
      summary:
        'AI4MS is the unified entry. Spec Agent, Poly Agent, and SpecLabOS respectively carry spectral intelligence, polymer R&D collaboration, and lab-system operations — together forming a complete product matrix.',
      cards: [
        {
          code: '01',
          name: 'Spec Agent',
          category: 'Spectral intelligence',
          description:
            'For NMR, IR, Raman, GPC, LCMS, and related tasks, it organizes parsing, QA, fact return, and report traceability.',
          bullets: ['Multi-spectral parsing', 'Task orchestration', 'Report return'],
          accent: 'blue',
        },
        {
          code: '02',
          name: 'Poly Agent',
          category: 'Polymer R&D collaboration base',
          description:
            'For polymer materials R&D, it organizes algorithms, knowledge bases, computation runs, records, and result review into a low-friction collaboration platform.',
          bullets: ['Data security', 'Credit', 'Low learning cost', 'Needed functions', 'Scale effect'],
          accent: 'violet',
        },
        {
          code: '03',
          name: 'SpecLabOS',
          category: 'Lab system and instrument access',
          description:
            'It handles experiment dispatch, device access, runtime state return, and execution evidence for the platform loop.',
          bullets: ['Experiment execution', 'Instrument access', 'State return'],
          accent: 'teal',
        },
      ],
      stepsTitle: 'Organize distributed R&D actions into an AI4MS loop',
      stepsSummary:
        'The platform receives the research goal, routes work to analysis, materials R&D, and lab execution modules, forming a traceable R&D loop.',
      steps: [
        {
          code: '01',
          title: 'Goal definition',
          text: 'Turn material systems, variables, constraints, targets, and acceptance criteria into executable R&D tasks.',
        },
        {
          code: '02',
          title: 'Intelligent analysis',
          text: 'Spec Agent and Poly Agent handle spectral parsing, algorithm runs, knowledge retrieval, candidate suggestions, experiment plan generation, experimental data mining and modeling, multi-objective optimization and decision-making, and result verification with report write-back.',
        },
        {
          code: '03',
          title: 'Materials R&D',
          text: 'Poly Agent organizes algorithm shelves, knowledge bases, computation tasks, and result review to support polymer materials R&D collaboration.',
        },
        {
          code: '04',
          title: 'Lab execution',
          text: 'SpecLabOS handles experiment dispatch, device access, state return, and execution evidence for the platform loop.',
        },
      ],
    },
    workflow: {
      eyebrow: 'Operating loop',
      title: 'Organize distributed R&D actions into an AI4MS loop',
      summary:
        'The platform receives the research goal, routes work to analysis, materials R&D, and lab execution modules, then writes results, logs, and evidence back into shared context.',
      steps: [
        {
          code: '01',
          title: 'Goal definition',
          text: 'Turn material systems, variables, constraints, targets, and acceptance conditions into executable R&D tasks.',
        },
        {
          code: '02',
          title: 'Intelligent analysis',
          text: 'Spec Agent and Poly Agent handle spectral parsing, algorithm runs, knowledge retrieval, candidate suggestions, experiment plan generation, experimental data mining and modeling, multi-objective optimization and decision-making, and result verification with report write-back.',
        },
        {
          code: '03',
          title: 'Lab collaboration',
          text: 'SpecLabOS connects lab systems and instrument software, returning runtime state and experiment results.',
        },
        {
          code: '04',
          title: 'Evidence return',
          text: 'Reports, data, sources, credit, and audit events become reusable context for the next R&D cycle.',
        },
      ],
    },
    matrix: {
      eyebrow: 'Architecture & Capabilities',
      title: 'From platform overview to device integration',
      summary:
        'Key architecture diagrams and system interfaces of the AI4MS platform, covering the full chain from overall design and runtime loop to technical routing and device access.',
      modules: [
        {
          name: 'AI4MS portal',
          tag: 'Entry',
          description: 'Accounts, product entry, task navigation, and cross-module workflows.',
        },
        {
          name: 'Spec Agent',
          tag: 'Analysis',
          description: 'Multi-spectral parsing, QA evaluation, fact extraction, and report return.',
        },
        {
          name: 'Poly Agent',
          tag: 'Materials',
          description: 'Algorithm shelf, knowledge base, computation runs, attribution, and result review.',
        },
        {
          name: 'SpecLabOS',
          tag: 'Lab',
          description: 'Experiment execution, device access, state collection, and execution evidence.',
        },
        {
          name: 'Data security',
          tag: 'Governance',
          description: 'Access control, audit logs, project isolation, and sensitive-information boundaries.',
        },
        {
          name: 'Credit mechanism',
          tag: 'Attribution',
          description: 'Source and owner records for algorithms, knowledge, models, and results.',
        },
        {
          name: 'Knowledge loop',
          tag: 'Reuse',
          description: 'Literature, reports, experience, and run outputs become searchable evidence.',
        },
        {
          name: 'Report and trace',
          tag: 'Audit',
          description: 'Deliverable reports with task chains and evidence provenance retained.',
        },
      ],
    },
    showcase: {
      eyebrow: 'Architecture & Capabilities',
      title: 'From platform overview to device integration',
      summary:
        'Key architecture diagrams and system interfaces of the AI4MS platform, covering the full chain from overall design and runtime loop to technical routing and device access.',
      images: [
        { src: '/assets/科学上下文.svg', alt: 'Scientific Context', caption: 'Scientific context — from R&D problem to experiment and evidence return loop' },
        { src: '/assets/敏捷开发.svg', alt: 'Agile Development', caption: 'Agile development — rapid iteration, continuous delivery, and feedback-driven' },
        { src: '/assets/定制化开发.svg', alt: 'Custom Development', caption: 'Custom development — deep customization and integration for enterprise needs' },
        { src: '/assets/数据安全.svg', alt: 'Data Security', caption: 'Data security — access control, audit trails, and project isolation' },
        { src: '/assets/用户友好.svg', alt: 'User-friendly', caption: 'User-friendly — low learning curve, intuitive interaction, and collaboration' },
      ],
    },
    changelog: {
      eyebrow: 'Changelog',
      title: 'Changelog',
      summary: 'Track SynlysAI website and product release cadence with key capabilities, fixes, and traceable release sources.',
      sourceAction: 'View GitHub Releases',
      loading: 'Loading changelog from GitHub...',
      errorTitle: 'GitHub release data is temporarily unavailable',
      sourceLink: 'Open GitHub Releases',
      emptyTitle: 'No public releases yet',
      emptyBody: 'This repository does not have public release records to show yet.',
      summaryLabels: ['Latest version', 'Recent release', 'Public records'],
      originalAction: 'GitHub source',
      unpublished: 'Unpublished',
      emptyReleaseBody: 'This release does not include release notes.',
    },
  },
}
