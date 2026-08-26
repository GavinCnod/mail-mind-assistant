import type { Locale } from '@mailmind/contracts';

export const en = {
  // ---- Common ----
  common: {
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    retry: 'Retry',
    copy: 'Copy',
    clear: 'Clear',
    filter: 'Filter',
    sort: 'Sort',
    details: 'Details',
    regenerate: 'Regenerate',
    export: 'Export',
    import: 'Import',
  },

  // ---- Navigation ----
  nav: {
    experience: 'Experience',
    about: 'About',
    privacy: 'Privacy',
    github: 'GitHub',
    sourceCode: 'Source Code',
  },

  // ---- Landing Page ----
  landing: {
    title: 'MailMind',
    subtitle: 'Your Read-only AI Inbox Triage',
    tagline: 'Understand · Judge · Act — No Send, No Modify, No Retention',
    features: {
      readOnly: 'Read-Only Access',
      privacy: 'Privacy First',
      aiTriage: 'AI Smart Triage',
      localFirst: 'Local-First',
    },
    cta: 'Start Experience',
    learnMore: 'Learn More',
  },

  // ---- Consent Gate ----
  consent: {
    title: 'Agreement & Authorization',
    description: 'Before using MailMind, please read and agree to the following terms:',
    checkboxes: {
      userAgreement: 'I have read and agree to the Terms of Service',
      privacyPolicy: 'I have read and agree to the Privacy Policy',
      mailProcessingAuth: 'I authorize MailMind to read my email data',
    },
    tooltips: {
      userAgreement: 'MailMind strictly adheres to a read-only policy: it never sends, deletes, moves, or modifies any email. Additionally, MailMind does not store any content information or personally identifiable information.',
      privacyPolicy: 'Your account password is never stored in any database nor transmitted to us or any third-party storage services. Web session information is retained only in local browser cache and automatically cleared after the session ends.',
    },
    notice: 'MailMind only reads emails you explicitly authorize. It never sends, deletes, moves, or modifies any email.',
    connect: 'Confirm Authorization',
    connected: 'Connected',
    connecting: 'Connecting...',
    confirmAuth: 'Confirm Authorization',
  },

  // ---- Connection Form ----
  connection: {
    title: 'Email Connection Configuration',
    protocol: 'Protocol',
    host: 'Server Address',
    port: 'Port',
    encryption: 'Encryption',
    ssl: 'SSL/TLS',
    starttls: 'STARTTLS',
    username: 'Username',
    password: 'App Password',
    passwordHint: 'Use an app-specific password, not your main password',
    testConnection: 'Test Connection',
    submit: 'Submit',
  },

  // ---- Email Card ----
  emailCard: {
    generatedIn: 'Generated in {{language}}',
    regenerate: 'Regenerate in current language',
    requiresAction: 'Action Required',
    priority: {
      P0: 'P0 Immediate Attention',
      P1: 'P1 Handle Today',
      P2: 'P2 Plan',
      P3: 'P3 FYI Only',
    },
    deadline: 'Deadline',
    confidence: 'Confidence',
    risk: 'Risk',
    noDeadline: 'No clear deadline',
    actions: 'Suggested Actions',
    facts: 'Key Facts',
    summary: 'Summary',
  },

  // ---- Feed / Filters ----
  feed: {
    sortBy: 'Sort By',
    byPriority: 'By Priority',
    byDate: 'By Date',
    filterByPriority: 'Priority Filter',
    filterByAction: 'Needs Action',
    filterByCategory: 'Category Filter',
    empty: 'No emails yet',
    emptyHint: 'Complete the consent process and connect your email to see summaries',
    loadMore: 'Load More',
  },

  // ---- Categories ----
  email: {
    category: {
      customer_order: 'Customer & Order',
      logistics: 'Billing & Logistics',
      meeting: 'Meeting & Schedule',
      billing: 'Billing Reminder',
      notification: 'System Notification',
      marketing: 'Marketing',
      social: 'Social',
      other: 'Other',
      needs_review: 'Needs Human Review',
    },
    generatedIn: 'Generated in {{language}}',
    regenerate: 'Regenerate in current language',
  },

  // ---- Digest Panel ----
  digest: {
    title: 'Half-Day Work Briefing',
    generate: 'Generate Brief',
    regenerate: 'Regenerate Report',
    morning: 'Morning',
    afternoon: 'Afternoon',
    priorities: 'Top Priorities',
    actions: 'Recommended Actions',
    risks: 'Risks & Blockers',
    noAction: 'No Action Required',
    empty: 'No briefing data yet',
    emptyHint: 'Generate a half-day work briefing after analyzing emails',
  },

  // ---- Settings ----
  settings: {
    title: 'Settings',
    outputLanguage: 'AI output follows the interface language',
    dataRetention: 'Data Retention Policy',
    clearData: 'Clear All Local Data',
    clearConfirm: 'This will delete all local emails, insights, and reports. Continue?',
    accountManagement: 'Account Management',
  },

  // ---- Error Messages ----
  errors: {
    AUTH_FAILED: 'Authentication failed. Please check your username or app password.',
    TLS_FAILED: 'TLS connection failed. Please check encryption settings and server certificate.',
    PROTOCOL_UNSUPPORTED: 'Unsupported protocol. Please switch to IMAP or POP3.',
    LIMIT_REACHED: 'Maximum processing limit reached. Please reduce the scope.',
    MODEL_UNAVAILABLE: 'Model service unavailable. Please check Base URL and API Key.',
    EMAIL_PARSE_FAILED: 'This email could not be parsed. Skipping.',
    SCHEMA_VALIDATION_FAILED: 'Model output format is invalid. Please retry.',
    SESSION_DISPOSED: 'Session has ended. Please start a new experience.',
    UNKNOWN: 'An unknown error occurred. Please try again later.',
  },

  // ---- Privacy ----
  privacy: {
    title: 'Privacy Policy',
    webSummary: `Web mode processes only the most recent 5–10 emails during the session. All in-memory data is cleared after completion. Passwords, email bodies, and model requests are never persisted.`,
    desktopSummary: `Desktop mode stores up to 500 emails (last 5 days) and AI insights in local SQLite. You can clear all data anytime. Passwords are not stored; system credential vault is used (P1).`,
    models: 'Model data handling is subject to the selected LLM provider\'s policies. Refer to their privacy terms.',
    thirdParty: 'Email provider data handling policies are outside the scope of this privacy statement.',
  },

  // ---- Demo Mode ----
  demo: {
    mode: 'Demo Mode',
    fixture: 'Use sanitized sample data',
    realEmail: 'Use real email',
  },

  // ---- Landing Page (Extended) ----
  landingExt: {
    sideRailLeft: 'MailMind v0.1 · Read-Only · EST. 2026',
    sideRailRight: 'SECURE · PRIVATE · LOCAL-FIRST',
    heroEyebrow: 'Read-only AI · Inbox Triage',
    heroHeadline: 'Understand<br />your inbox,<br />never send<span style="color: var(--az-accent)">.</span>',
    sectionIIMeta: 'By the numbers · zero write operations · verified',
    stats: {
      emailsWritten: 'Emails written',
      deletions: 'Deletions',
      daysMaxRetention: 'Days max retention',
      localProcessing: 'Local processing',
    },
    sectionIIIMeta: 'Capabilities · read-only triage system',
    featuresHeadline: 'Safe by <em>design,</em> secure<span style="color: var(--az-accent)">.</span>',
    features: [
      { tag: 'Read-only', title: 'Read Access Only', desc: 'IMAP EXAMINE / POP3 LIST — no STORE, APPEND, COPY, or DELETE. Your mailbox stays exactly as you left it.' },
      { tag: 'Privacy', title: 'Privacy First', desc: 'Passwords never touch disk. Email content is retained for at most 5 days on the local Desktop. Nothing leaves your machine unencrypted.' },
      { tag: 'AI Triage', title: 'AI Structured Summaries', desc: 'LLM-powered analysis produces structured summaries with priority levels and action recommendations — never automated responses.' },
      { tag: 'Local-first', title: 'Local-first Desktop', desc: 'Desktop application processes everything locally. Web experience requires explicit consent and runs in-session only.' },
    ],
    sectionIVMeta: 'Workflow · four steps from connection to insight',
    howItWorks: 'How it <em>works,</em><span style="color: var(--az-accent)">.</span>',
    workflowSubtitle: 'From protocol handshake to structured summary — every step is read-only, encrypted, and ephemeral.',
    workflowSteps: [
      { num: 'I', title: 'Protocol Auth', desc: 'IMAP/POP3 CONNECT with read-only mode enabled' },
      { num: 'II', title: 'Encrypted Link', desc: 'STARTTLS / STLS secured channel established' },
      { num: 'III', title: 'AI Analysis', desc: 'Local LLM parses & structures email content' },
      { num: 'IV', title: 'Read Summary', desc: 'Priority triage delivered — zero writes persisted' },
    ],
    ctaSectionMeta: 'Get started · free & open source',
    ctaHeadline: 'Your inbox,<br /><em>understood.</em><span style="color: var(--az-accent)">.</span>',
    footerBrand: 'MailMind v0.1 · Hackathon Edition · MMXXVI',
    footerCredit: 'by Gavin Chen from Mindrose Team',
    footerLicense: 'MIT License',
    footerFiled: 'Filed under: AI · Privacy · Read-only',
  },

  // ---- About Page ----
  about: {
    intro: 'MailMind is built by Gavin Chen (Leader of MindRose Team).',
    gavinBio: 'Gavin Chen leads product direction, technical implementation, and content strategy for this project, deploying and maintaining the product under the CI/CD system of MindRose team.',
    team: {
      title: 'The MindRose Team',
      desc: 'A group of engineers and strategists with multilingual and multidisciplinary backgrounds, dedicated to solving real business problems.',
      lindsay: 'Familiar with cross-border product marketing strategies and highly experienced in hands-on SEO, leading our SEO & GEO strategies.',
      anthony: 'Expert in online marketing strategies, content creation, and analysis, helping products and services succeed in digital marketing.',
      simon: 'Leads various server architecture designs, database optimizations, and cloud-native deployments.',
    },
    mindrose: {
      title: 'About MindRose Studio',
      desc: 'Developed and open-sourced by Gavin Chen of the MindRose team. MindRose is a multidisciplinary team of engineers and strategists with multilingual backgrounds, focused on delivering lightweight digital solutions for small and medium manufacturers, logistics companies, and cross-border traders. We do not peddle empty "digital transformation" concepts — instead, through AI and multi-modal application development (React, Next.js, Mendix, LangChain, n8n, Java, etc.), we ship practical applications that solve real business pain points within weeks.',
    },
    openSource: {
      title: 'Open Source Tools',
      meta: 'Open Source Projects · Browser-based Tools',
      deepseek: {
        name: 'DeepSeek API Usage Analysis',
        desc: 'A browser-side analytics dashboard for DeepSeek API usage. Drag your monthly CSV exports onto the page and get instant cost charts, per-key breakdowns, cache analysis, and usage trends — all processed locally in your browser. No upload, no signup.',
        link: 'https://github.com/GavinCnod/deepseek-api-usage-analysis',
      },
      agnes: {
        name: 'Agnes API Usage Analysis',
        desc: 'A browser-side analytics dashboard for Agnes AI API usage. Drag your usage CSV exports onto the page and get instant cost charts, per-key breakdowns, and usage trends — all processed locally in your browser. No upload, no signup.',
        link: 'https://github.com/GavinCnod/agnes-api-usage-analysis',
      },
    },
  },

  // ---- Experience Page ----
  experience: {
    eyebrow: 'Read-only AI · Inbox Triage',
    headline: 'Connect.<br /><em>Analyze.</em><br />Understand<span style="color: var(--az-accent)">.</span>',
    modeLabel: 'EXPERIENCE MODE · PLATE Nº 02',
    step1: 'Initial authorization',
    step2: 'Email connection configuration',
    step3: 'AI analysis & summary',
    analyzeEmails: 'Analyze Emails',
    generateBrief: 'Generate Brief',
    analyzing: 'Analyzing...',
    generating: 'Generating...',
    analysisComplete: 'Analysis complete',
    digestComplete: 'Brief generated',
    analysisResult: 'Analysis Result',
  },

  // ---- Desktop App ----
  desktop: {
    title: 'MailMind Desktop',
    syncEmails: 'Sync Emails',
    syncing: 'Syncing...',
    clearData: 'Clear Data',
    emptyMessage: 'No emails yet. Click "Sync Emails" to get started.',
    footer: 'All data stored locally, never uploaded',
    footerDetail: 'SQLite • 5 days / 500 emails retention • Zero password persistence',
    noSubject: '(No Subject)',
  },
} as const;

export type TranslationShape = typeof en;
