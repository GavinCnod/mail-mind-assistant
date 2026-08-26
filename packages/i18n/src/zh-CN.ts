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

  // ---- Navigation ----
  nav: {
    experience: '体验',
    about: '关于作者',
    privacy: '隐私',
    github: 'GitHub',
    sourceCode: '源代码',
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
    tooltips: {
      userAgreement: 'MailMind 严格遵守只读原则，不发送、删除、移动或修改任何邮件；此外 MailMind 不保存您的任何内容信息或个人识别信息。',
      privacyPolicy: '您输入的账号密码永不存入数据库或传输至我们或第三方的存储服务，Web端信息仅保留本地浏览器缓存，会话结束后自动清除。',
    },
    notice: 'MailMind 仅读取您明确授权的邮件。它不会发送、删除、移动或修改任何邮件。',
    connect: '确认授权',
    connected: '已连接',
    connecting: '连接中...',
    confirmAuth: '确认授权',
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

  // ---- Email Card ----
  emailCard: {
    generatedIn: '已按 {{language}} 生成',
    regenerate: '按当前语言重新生成',
    requiresAction: '需行动',
    priority: {
      P0: 'P0 立即关注',
      P1: 'P1 今日处理',
      P2: 'P2 计划安排',
      P3: 'P3 知悉即可',
    },
    deadline: '截止日期',
    confidence: '置信度',
    risk: '风险',
    noDeadline: '无明确截止日期',
    actions: '建议行动',
    facts: '关键信息',
    summary: '摘要',
  },

  // ---- Feed / Filters ----
  feed: {
    sortBy: '排序方式',
    byPriority: '按优先级',
    byDate: '按时间',
    filterByPriority: '优先级筛选',
    filterByAction: '需处理',
    filterByCategory: '分类筛选',
    empty: '暂无邮件',
    emptyHint: '完成授权并连接邮箱后即可查看摘要',
    loadMore: '加载更多',
  },

  // ---- Categories ----
  email: {
    category: {
      customer_order: '客户订单',
      logistics: '物流账单',
      meeting: '会议日程',
      billing: '缴费提醒',
      notification: '系统通知',
      marketing: '营销推广',
      social: '社交娱乐',
      other: '其他',
      needs_review: '需人工复核',
    },
    generatedIn: '已按 {{language}} 生成',
    regenerate: '按当前语言重新生成',
  },

  // ---- Digest Panel ----
  digest: {
    title: '半日工作简报',
    generate: '生成简报',
    regenerate: '重新生成报告',
    morning: '上午',
    afternoon: '下午',
    priorities: '首要事项',
    actions: '建议行动',
    risks: '风险与阻塞',
    noAction: '无需行动',
    empty: '暂无简报数据',
    emptyHint: '分析邮件后生成半日工作简报',
  },

  // ---- Settings ----
  settings: {
    title: '设置',
    outputLanguage: 'AI 输出语言跟随界面语言',
    dataRetention: '数据留存策略',
    clearData: '清除所有本地数据',
    clearConfirm: '这将删除所有本地邮件、洞察和报告。确定继续？',
    accountManagement: '账号管理',
  },

  // ---- Error Messages ----
  errors: {
    AUTH_FAILED: '认证失败。请检查用户名或应用密码。',
    TLS_FAILED: 'TLS 连接失败。请检查加密设置和服务器证书。',
    PROTOCOL_UNSUPPORTED: '不支持的协议。请切换到 IMAP 或 POP3。',
    LIMIT_REACHED: '已达到最大处理限制。请缩小范围。',
    MODEL_UNAVAILABLE: '模型服务不可用。请检查 Base URL 和 API Key。',
    EMAIL_PARSE_FAILED: '无法解析此邮件。已跳过。',
    SCHEMA_VALIDATION_FAILED: '模型输出格式无效。请重试。',
    SESSION_DISPOSED: '会话已结束。请开始新的体验。',
    UNKNOWN: '发生未知错误。请稍后重试。',
  },

  // ---- Privacy ----
  privacy: {
    title: '隐私说明',
    webSummary: 'Web 端仅处理当次请求中的最近 5–10 封邮件，完成后自动清除所有内存数据。不存储密码、邮件正文或模型请求。',
    desktopSummary: 'Desktop 端在本机 SQLite 中保存最近 5 天、最多 500 封邮件及 AI 洞察，可随时清除。密码不落盘，使用系统安全凭证库（P1）。',
    models: '模型数据处理受所选 LLM 服务商政策约束，请参考其隐私条款。',
    thirdParty: '邮箱服务商的数据处理政策不受本隐私声明覆盖。',
  },

  // ---- Demo Mode ----
  demo: {
    mode: '演示模式',
    fixture: '使用脱敏示例数据',
    realEmail: '使用真实邮箱',
  },

  // ---- Landing Page (Extended) ----
  landingExt: {
    sideRailLeft: 'MailMind v0.1 · 只读 · 创建于 2026',
    sideRailRight: '安全 · 隐私优先 · 本地优先',
    heroEyebrow: '只读 AI · 收件箱分诊',
    heroHeadline: '理解你的<br />收件箱，<br />绝不发送<span style="color: var(--az-accent)">。</span>',
    sectionIIMeta: '数据统计 · 零写入操作 · 已验证',
    stats: {
      emailsWritten: '发送邮件数',
      deletions: '删除邮件数',
      daysMaxRetention: '最大留存天数',
      localProcessing: '本地处理率',
    },
    sectionIIIMeta: '功能 · 只读分诊系统',
    featuresHeadline: '设计即安全，隐私优先<span style="color: var(--az-accent)">。</span>',
    features: [
      { tag: '只读', title: '仅读取权限', desc: 'IMAP EXAMINE / POP3 LIST — 无 STORE、APPEND、COPY、DELETE 操作。您的邮箱保持原样。' },
      { tag: '隐私', title: '隐私优先', desc: '密码永不落盘。邮件内容最多留存 5 天（桌面端）。所有数据传输均加密。' },
      { tag: 'AI 分诊', title: 'AI 结构化摘要', desc: 'LLM 驱动分析，生成带优先级和行动建议的结构化摘要——从不自动回复。' },
      { tag: '本地优先', title: '本地优先桌面端', desc: '桌面应用所有处理均在本地完成。Web 端需明确授权，仅会话内运行。' },
    ],
    sectionIVMeta: '工作流程 · 从连接到洞察的四个步骤',
    howItWorks: '工作原理<span style="color: var(--az-accent)">。</span>',
    workflowSubtitle: '从协议握手到结构化摘要——每一步都是只读、加密且临时的。',
    workflowSteps: [
      { num: 'I', title: '协议认证', desc: '启用只读模式的 IMAP/POP3 CONNECT' },
      { num: 'II', title: '加密连接', desc: '建立 STARTTLS / STLS 安全通道' },
      { num: 'III', title: 'AI 分析', desc: '本地 LLM 解析并结构化邮件内容' },
      { num: 'IV', title: '读取摘要', desc: '优先级分诊交付——零持久化写入' },
    ],
    ctaSectionMeta: '开始使用 · 免费开源',
    ctaHeadline: '你的收件箱，<br /><em>已被理解。</em><span style="color: var(--az-accent)">。</span>',
    footerBrand: 'MailMind v0.1 · 黑客松版 · MMXXVI',
    footerCredit: 'by Gavin Chen from Mindrose Team',
    footerLicense: 'MIT 许可证',
    footerFiled: '分类：AI · 隐私 · 只读',
  },

  // ---- About Page ----
  about: {
    intro: 'MailMind 由 Gavin Chen（MindRose 团队 Leader）构建。',
    gavinBio: 'Gavin Chen 负责这个项目的产品方向、技术实现与内容策略，在 MindRose 团队的 CI/CD 体系下完成产品部署和维护。',
    team: {
      title: 'MindRose 团队',
      desc: '一群多语言多技能背景的工程师与策略专家，致力于解决真实业务问题。',
      lindsay: '熟悉跨国产品营销策略，有丰富的 SEO 实战经验，负责产品的 SEO & GEO 策略。',
      anthony: '熟悉在线营销策略、内容创作与分析，帮助产品和服务在获得在线营销推广方面取得成功。',
      simon: '主导各种服务端架构设计、数据库优化及云原生部署。',
    },
    mindrose: {
      title: '关于 MindRose Studio',
      desc: '由 MindRose 团队的 Gavin Chen 开发并开源呈现。MindRose 是一支多语言、多技能背景的工程师与策略专家团队，专注为中小制造企业、物流公司及跨国贸易商提供轻量级数字化解决方案。我们不贩卖"数字化转型"的空泛概念，而是借助 AI 与多模态应用开发（React、Next.js、Mendix、LangChain、n8n、Java 等），在数周内为你交付真正解决业务痛点的实用应用。',
    },
    openSource: {
      title: '开源工具',
      meta: '开源项目 · 浏览器端工具',
      deepseek: {
        name: 'DeepSeek API Usage Analysis',
        desc: '一款纯浏览器端的 DeepSeek API 用量分析仪表盘。将月度 CSV 导出文件拖拽到页面，即刻获取费用图表、各 Key 用量明细、缓存分析和用量趋势——所有数据均在浏览器本地处理，不上传、无需注册。',
        link: 'https://github.com/GavinCnod/deepseek-api-usage-analysis',
      },
      agnes: {
        name: 'Agnes API Usage Analysis',
        desc: '一款纯浏览器端的 Agnes AI API 用量分析仪表盘。将月度 CSV 导出文件拖拽到页面，即刻获取费用图表、各 Key 用量明细、和用量趋势——所有数据均在浏览器本地处理，不上传、无需注册。',
        link: 'https://github.com/GavinCnod/agnes-api-usage-analysis',
      },
    },
  },

  // ---- Experience Page ----
  experience: {
    eyebrow: '只读 AI · 收件箱分诊',
    headline: '连接。<em>分析。</em>理解<span style="color: var(--az-accent)">。</span>',
    modeLabel: '体验模式 · PLATE Nº 02',
    step1: '初始授权',
    step2: '邮箱连接配置',
    step3: 'AI 分析与摘要',
    analyzeEmails: '分析邮件',
    generateBrief: '生成简报',
    analyzing: '分析中...',
    generating: '生成中...',
    analysisComplete: '分析完成',
    digestComplete: '简报已生成',
    analysisResult: '分析结果',
  },

  // ---- Desktop App ----
  desktop: {
    title: 'MailMind 桌面端',
    syncEmails: '同步邮件',
    syncing: '同步中...',
    clearData: '清除数据',
    emptyMessage: '暂无邮件。点击"同步邮件"开始使用。',
    footer: '所有数据本地存储，永不上传',
    footerDetail: 'SQLite • 5天/500封留存策略 • 零持久化密码',
    noSubject: '(无主题)',
  },
} as const;

export type TranslationShape = typeof zhCN;
