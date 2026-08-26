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
    notice: 'MailMind only reads emails you explicitly authorize. It never sends, deletes, moves, or modifies any email.',
    connect: 'Connect Email',
    connected: 'Connected',
    connecting: 'Connecting...',
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

  // ---- About Page ----
  about: {
    intro: 'MailMind is built by Gavin Chen and the MindRose team — a small group of engineers and strategists who believe privacy-first software can solve real business problems.',
    gavinBio: 'Gavin Chen leads product direction, technical implementation, and content strategy for this project, working together with the MindRose team on product delivery, marketing, and maintenance.',
    team: {
      title: 'The MindRose Team',
      lindsay: 'Familiar with cross-border product marketing strategies and highly experienced in hands-on SEO, leading our SEO & GEO strategies.',
      anthony: 'Expert in online marketing strategies, content creation, and analysis, helping products and services succeed in digital marketing.',
      simon: 'Leads various server architecture designs, database optimizations, and cloud-native deployments.',
    },
    mindrose: {
      title: 'About MindRose Studio',
      desc: 'This project is open-sourced by Gavin Chen and the MindRose team. MindRose is a tech team focused on delivering lightweight digital solutions for small and medium manufacturers, logistics companies, and cross-border traders. We use AI and full-stack agile development (Next.js, React, etc.) to deliver applications that solve real business pain points within weeks.',
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
