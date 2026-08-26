import type { Locale } from '@mailmind/contracts';

export const zhCN = {
  // ---- Common ----
  common: {
    language: '语言',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    confirm: '确认',
    cancel: '取消',
    close: '关闭',
    back: '返回',
    retry: '重试',
    copy: '复制',
    clear: '清除',
    filter: '筛选',
    sort: '排序',
    details: '详情',
    regenerate: '重新生成',
    export: '导出',
    import: '导入',
  },

  // ---- Landing Page ----
  landing: {
    title: 'MailMind',
    subtitle: '您的只读 AI 收件箱分诊助手',
    tagline: '理解 · 判断 · 建议——不发送、不修改、不留存。',
    features: {
      readOnly: '只读访问',
      privacy: '隐私优先',
      aiTriage: 'AI 智能分诊',
      localFirst: '本地优先',
    },
    cta: '开始体验',
    learnMore: '了解更多',
  },

  // ---- Consent Gate ----
  consent: {
    title: '协议与授权',
    description: '在使用 MailMind 之前，请阅读并同意以下条款：',
    checkboxes: {
      userAgreement: '我已阅读并同意服务条款',
      privacyPolicy: '我已阅读并同意隐私政策',
      mailProcessingAuth: '我授权 MailMind 读取我的邮件数据',
    },
    notice: 'MailMind 仅读取您明确授权的邮件。它不会发送、删除、移动或修改任何邮件。',
    connect: '连接邮箱',
    connected: '已连接',
    connecting: '连接中...',
  },

  // ---- Connection Form ----
  connection: {
    title: '邮箱连接配置',
    protocol: '协议',
    host: '服务器地址',
    port: '端口',
    encryption: '加密方式',
    ssl: 'SSL/TLS',
    starttls: 'STARTTLS',
    username: '用户名',
    password: '密码',
    passwordHint: '请使用应用专用密码，而非主密码',
    testConnection: '测试连接',
    submit: '连接邮箱',
  },

  // ---- Email Feed ----
  email: {
    feed: {
      title: '收件箱',
      subtitle: '本地存储 · 隐私优先 · 只读分析',
      empty: '暂无邮件。点击"同步邮件"开始使用。',
      sync: '同步邮件',
      syncing: '同步中...',
      clear: '清除数据',
    },
    card: {
      summary: '摘要',
      priority: '优先级',
      action: '行动建议',
      deadline: '截止日期',
      risk: '风险标记',
      keyFacts: '关键信息',
      requiresAction: '需要人工处理',
      confidence: '置信度',
      openSummary: '展开摘要',
      closeSummary: '收起摘要',
    },
    filter: {
      all: '全部',
      highPriority: '高优先级',
      needsAction: '需人工处理',
      lowConfidence: '低置信度',
    },
  },

  // ---- Demo Mode ----
  demo: {
    mode: '演示模式',
    fixture: '使用脱敏示例数据',
    realEmail: '使用真实邮箱',
  },

  // ---- Privacy ----
  privacy: {
    title: '隐私说明',
    webSummary: 'Web 端仅处理当次请求中的最近 5–10 封邮件，完成后自动清除所有内存数据。不存储密码、邮件正文或模型请求。',
    desktopSummary: 'Desktop 端在本机 SQLite 中保存最近 5 天、最多 500 封邮件及 AI 洞察，可随时清除。密码不落盘，使用系统安全凭证库（P1）。',
    models: '模型数据处理受所选 LLM 服务商政策约束，请参考其隐私条款。',
    thirdParty: '邮箱服务商的数据处理政策不受本隐私声明覆盖。',
  },

  // ---- About Page ----
  about: {
    intro: 'MailMind 由 Gavin Chen 与 MindRose 团队共同构建——一群相信隐私优先软件能解决真实业务问题的工程师与策略专家。',
    gavinBio: 'Gavin Chen 负责这个项目的产品方向、技术实现与内容策略，并与 MindRose 团队一起完成产品部署、推广和维护。',
    team: {
      title: 'MindRose 团队',
      lindsay: '熟悉跨国产品营销策略，有丰富的 SEO 实战经验，负责产品的 SEO & GEO 策略。',
      anthony: '熟悉在线营销策略、内容创作与分析，帮助产品和服务在获得在线营销推广方面取得成功。',
      simon: '主导各种服务端架构设计、数据库优化及云原生部署。',
    },
    mindrose: {
      title: '关于 MindRose Studio',
      desc: '本项目由 Gavin Chen 及 MindRose 团队开发并开源呈现。MindRose 是专注于为中小制造企业、物流公司及跨国贸易商提供轻量级数字化解决方案的科技团队。我们不卖虚无的"数字化转型"概念，而是通过 AI 技术与全栈敏捷开发（Next.js、React 等），在几周内为你交付解决实际业务痛点的应用。',
    },
  },
} as const;

export type TranslationShape = typeof zhCN;
