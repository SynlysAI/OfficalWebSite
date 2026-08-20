const fallbackProducts = [
  {
    productId: 'ai4ms',
    name: { zh: 'AI4MS', en: 'AI4MS' },
    entryType: 'web',
    webUrl: 'https://ai4ms.xmuzc.com/',
  },
  {
    productId: 'spec-agent',
    name: { zh: '谱学分析平台', en: 'Spec Agent' },
    entryType: 'web',
    webUrl: null,
  },
  {
    productId: 'poly-agent',
    name: { zh: '高分子研发平台', en: 'Poly Agent' },
    entryType: 'web',
    webUrl: null,
  },
  {
    productId: 'speclabos',
    name: { zh: '实验室管理系统', en: 'SpecLabOS' },
    entryType: 'web',
    webUrl: null,
  },
  {
    productId: 'smartaccess',
    name: { zh: 'SmartAccess', en: 'SmartAccess' },
    entryType: 'download',
    webUrl: null,
  },
  {
    productId: 'ragportal',
    name: { zh: 'RAG Portal', en: 'RAG Portal' },
    entryType: 'web',
    webUrl: null,
  },
]

export const releasePortalFallback = {
  schemaVersion: 1,
  generatedAt: '',
  products: fallbackProducts,
  releases: [],
  timeline: [],
  faqs: [],
  meta: {
    sourceWatermarks: {},
    collectionHashes: {},
  },
}
