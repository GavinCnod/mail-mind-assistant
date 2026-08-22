import { type Locale } from '@mailmind/contracts';

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
    subtitle: '只读 AI 邮件分诊助手',
    tagline: '理解 · 判断 · 建议——不发送、不修改、不留存',
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
      userAgreement: '我已阅读并同意《用户协议》',
      privacyPolicy: '我已阅读并同意《隐私说明》',
      mailProcessingAuth: '我已授权 MailMind 读取我的邮件数据',
    },
    notice: 'MailMind 仅读取您授权的邮件，不会发送、删除、移动或修改任何邮件。',
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
    password: '应用专用密码',
    passwordHint: '请使用应用专用密码，而非主密码',
    testConnection: '测试连接',
    submit: '提交',
  },

  // ---- Email Card ----
  emailCard: {
    generatedIn: '已按 {{language}} 生成',
    regenerate: '按当前语言重新生成',
    requiresAction: '需行动',
    priority: {
      P0: 'P0 立即关注',
      P1: 'P1 今日处理',
      P2: 'P2 可规划',
      P3: 'P3 仅知悉',
    },
    deadline: '截止',
    confidence: '置信度',
    risk: '风险',
    noDeadline: '无明确截止期',
    actions: '建议行动',
    facts: '关键事实',
    summary: '摘要',
  },

  // ---- Feed / Filters ----
  feed: {
    sortBy: '排序方式',
    byPriority: '按优先级',
    byDate: '按时间',
    filterByPriority: '优先级筛选',
    filterByAction: '需行动',
    filterByCategory: '分类筛选',
    empty: '暂无邮件',
    emptyHint: '完成协议授权后连接邮箱以查看邮件摘要',
    loadMore: '加载更多',
  },

  // ---- Categories ----
  email: {
    category: {
      customer_order: '订单/客户',
      logistics: '账单/物流',
      meeting: '日程/会议',
      billing: '账单提醒',
      notification: '系统通知',
      marketing: '营销',
      social: '社交',
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
    priorities: '重点事项',
    actions: '建议行动',
    risks: '风险与阻塞',
    noAction: '无需处理',
    empty: '暂无简报数据',
    emptyHint: '分析邮件后可生成半日工作简报',
  },

  // ---- Settings ----
  settings: {
    title: '设置',
    outputLanguage: 'AI 输出语言跟随界面语言',
    dataRetention: '数据保留策略',
    clearData: '清除所有本地数据',
    clearConfirm: '此操作将删除所有本地邮件、摘要和简报数据，是否继续？',
    accountManagement: '账号管理',
  },

  // ---- Error Messages ----
  errors: {
    AUTH_FAILED: '身份验证失败，请检查用户名或应用专用密码',
    TLS_FAILED: 'TLS 连接失败，请检查加密方式与服务器证书',
    PROTOCOL_UNSUPPORTED: '不支持的邮件协议，请切换 IMAP 或 POP3',
    LIMIT_REACHED: '达到最大处理数量限制，请减少体验范围',
    MODEL_UNAVAILABLE: '模型服务不可用，请检查 Base URL 和 API Key',
    EMAIL_PARSE_FAILED: '该邮件无法解析，已跳过',
    SCHEMA_VALIDATION_FAILED: '模型输出格式异常，请稍后重试',
    SESSION_DISPOSED: '会话已结束，请重新开始体验',
    UNKNOWN: '发生未知错误，请稍后重试',
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
} as const;

export type TranslationShape = typeof zhCN;
