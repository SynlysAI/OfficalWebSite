/** 平台介绍视频注册表。
 *
 * file 对应 R2 对象 portal/v1/videos/{productId}/{file}，
 * 播放地址由 /api/video/{productId}/{file} 提供。
 */
export const introVideos = [
  {
    productId: 'ai4ms',
    file: 'portal_intro_video.mp4',
    title: { zh: '平台总览', en: 'Platform Overview' },
  },
  {
    productId: 'spec-agent',
    file: 'spec_intro_video.mp4',
    title: { zh: '谱学分析平台', en: 'Spec Agent' },
  },
  {
    productId: 'poly-agent',
    file: 'poly_intro_video.mp4',
    title: { zh: '高分子研发平台', en: 'Poly Agent' },
  },
  {
    productId: 'speclabos',
    file: 'labos_intro_video.mp4',
    title: { zh: '实验室管理系统', en: 'SpecLabOS' },
  },
  {
    productId: 'ragportal',
    file: 'rag_intro_video.mp4',
    title: { zh: 'RAG Portal', en: 'RAG Portal' },
  },
]
