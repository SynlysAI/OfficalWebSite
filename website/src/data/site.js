export const links = {
  demo: 'https://ai4ms.xmuzc.com/',
  about: 'https://github.com/SynlysAI',
}

export const brand = {
  name: 'SynlysAI',
  platform: 'AI4MS',
  fullName: 'SynlysAI',
  logo: '/assets/logo.png',
  heroVisual: '/assets/ai4ms-hero-bg.svg',
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
      { label: '行业挑战', to: { name: 'home', hash: '#challenges' } },
      { label: '关于我们', to: { name: 'home', hash: '#about' } },
      { label: '产品矩阵', to: { name: 'home', hash: '#products' } },
      { label: '研发闭环', to: { name: 'home', hash: '#workflow' } },
      { label: '平台能力', to: { name: 'home', hash: '#matrix' } },
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
      highlights: [
        { value: '任务定义', label: 'Research Spec 形式化研发目标' },
        { value: '工具编排', label: 'Skill 统一注册与调用' },
        { value: '证据回写', label: 'Memory 沉淀科研上下文' },
      ],
      panelTitle: '从研发问题到实验与证据回写',
      panelBody:
        '平台把分析、材料研发协作和实验执行组织在同一入口下，让任务、数据、证据和审计记录形成可复用的研发上下文。',
    },
    about: {
      eyebrow: 'Who we are',
      title: 'SynlysAI 构建企业可托付的 AI4S 研发基础设施',
      summary:
        '我们面向材料、化学与工艺研发团队，把任务定义、算法运行、知识检索、实验执行和审计追溯组织到同一套平台体验中。',
      cards: [
        {
          title: '组织官网口径',
          text: '首页先说明 SynlysAI 与 AI4MS 的定位，再把能力落到清晰的产品矩阵。',
        },
        {
          title: '科研闭环口径',
          text: '从问题定义、智能分析、实验执行到结果回写，形成可复盘的研发链路。',
        },
        {
          title: '企业协作口径',
          text: '关注数据安全、权限边界、贡献标注和跨团队复用，而不是单点工具堆叠。',
        },
      ],
    },
    challengeBanners: {
      eyebrow: 'AI4MS challenges',
      title: 'AI4MS 要解决的五个问题',
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
      eyebrow: 'Product matrix',
      title: '三大产品矩阵覆盖分析、材料研发和实验执行',
      summary:
        'AI4MS 是统一入口；Spec Agent、Poly Agent 和 SpecLabOS 分别承接谱图智能、高分子研发协作和实验系统运行。',
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
    },
    workflow: {
      eyebrow: 'Operating loop',
      title: '把分散研发动作组织成可运行的 AI4MS 闭环',
      summary:
        '平台先接住研发目标，再分配到分析、材料研发和实验执行模块，最后把结果、日志和证据回写到统一上下文。',
      steps: [
        {
          code: '01',
          title: '目标定义',
          text: '把材料体系、变量、约束、目标和验收条件写成可执行的研发任务。',
        },
        {
          code: '02',
          title: '智能分析',
          text: '由 Spec Agent 与 Poly Agent 承接谱图解析、算法运行、知识检索和候选建议。',
        },
        {
          code: '03',
          title: '实验协同',
          text: '通过 SpecLabOS 对接实验系统和仪器软件，回传运行状态与实验结果。',
        },
        {
          code: '04',
          title: '证据回写',
          text: '将报告、数据、来源、贡献和审计记录沉淀为下一轮研发可复用的上下文。',
        },
      ],
    },
    matrix: {
      eyebrow: 'Capability modules',
      title: '能力模块围绕企业研发协作展开',
      summary:
        '模块表达保留公开产品名，同时用企业可理解的能力词解释每个模块的职责。',
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
    changelog: {
      eyebrow: 'Changelog',
      title: '更新日志',
      summary: '按版本记录 SynlysAI 官网与产品更新节奏，优先呈现关键能力、修复和可追溯来源。',
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
      { label: 'Challenges', to: { name: 'home', hash: '#challenges' } },
      { label: 'Positioning', to: { name: 'home', hash: '#about' } },
      { label: 'Products', to: { name: 'home', hash: '#products' } },
      { label: 'R&D loop', to: { name: 'home', hash: '#workflow' } },
      { label: 'Modules', to: { name: 'home', hash: '#matrix' } },
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
        'SynlysAI uses AI4MS as the platform entry, connecting spectral intelligence, materials R&D agents, and lab execution into an executable and traceable research loop.',
      primaryAction: 'Product Experience',
      primaryHref: links.demo,
      secondaryAction: 'About us',
      secondaryHref: links.about,
      badges: ['AI4MS platform', 'Three-product matrix', 'Enterprise R&D loop'],
      highlights: [
        { value: '3', label: 'core products' },
        { value: '5', label: 'collaboration dimensions' },
        { value: '1', label: 'unified entry' },
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
      cards: [
        {
          title: 'Organization-site voice',
          text: 'The homepage introduces SynlysAI and AI4MS first, then anchors the story in a clear product matrix.',
        },
        {
          title: 'Research-loop voice',
          text: 'Problem definition, intelligent analysis, experiment execution, and result return form a replayable R&D chain.',
        },
        {
          title: 'Enterprise collaboration',
          text: 'The focus is data security, permission boundaries, attribution, and reuse across teams.',
        },
      ],
    },
    challengeBanners: {
      eyebrow: 'AI4MS challenges',
      title: 'Five problems AI4MS is built to solve',
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
        'AI4MS is the unified entry. Spec Agent, Poly Agent, and SpecLabOS respectively carry spectral intelligence, polymer R&D collaboration, and lab-system operations.',
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
          text: 'Spec Agent and Poly Agent handle spectral parsing, algorithm runs, knowledge retrieval, and candidate suggestions.',
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
      eyebrow: 'Capability modules',
      title: 'Capability modules are shaped around enterprise R&D collaboration',
      summary:
        'The module language keeps public product names while explaining responsibilities in enterprise-readable terms.',
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
