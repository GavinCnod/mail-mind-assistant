# MailMind v1.1：主题、双语与模型输出语言实施附录

**关联文档：** `MailMind_Hackathon_PRD_v1.1.md`  
**适用范围：** Next.js Web 体验端、Tauri + React Desktop 端与共享 pnpm 单仓库  
**状态：** P0；必须在 Day 1 的 fixture 骨架阶段同时完成。

## 1. 实施目标

本附录将“Light / Dark 主题”和“简体中文 / 英文”固化为双端一致的核心能力。主题与语言不是各页面零散的 UI 选项，而是由同一份共享类型、Provider、翻译字典和测试规则驱动。`locale` 同时是每一次新 LLM 调用的 `outputLocale`：界面展示什么语言，新的摘要、行动建议和半日简报就必须生成什么语言。

语言切换**不得隐式重新上传邮件或重跑模型**。已完成的摘要继续以生成时的语言显示，并带有生成语言标识；只有用户明确点击“按当前语言重新生成”或“重新生成报告”时，才会用新语言调用模型。这样既尊重 Web 端零留存边界，也避免用户在无感知情况下增加模型调用和数据处理。

| 维度 | P0 决策 |
|---|---|
| 主题 | 仅 `light` 与 `dark` 两个确定值；首次可解析系统偏好，用户选择优先 |
| 界面语言 | 仅 `zh-CN` 与 `en`；默认优先匹配浏览器 / OS 简中，否则英文 |
| LLM 语言 | 每一次新分析、重试、重新生成和半日汇总显式带 `outputLocale` |
| 稳定数据 | JSON key、enum、priority code、filter value 一律不翻译 |
| 人类可读数据 | 摘要、建议、风险、错误信息、类别和日期格式遵从 `locale` |
| Web 持久化 | 只保存非敏感的 `theme` / `locale` preference；不与邮件会话、密码或正文关联 |
| Desktop 持久化 | `app_preferences` 保存 `theme` / `locale`；与 SQLite 中的邮件和 secret 分离 |

## 2. 单仓库增量结构

```text
packages/
├── contracts/
│   ├── preferences.ts            # ThemePreference、Locale、OutputLocale schema
│   └── email-insight.ts          # outputLocale 字段
├── ai-core/
│   ├── prompts.ts                # 把 outputLocale 写入系统提示与任务提示
│   ├── analyze-email.ts
│   └── generate-digest.ts
├── i18n/
│   ├── src/
│   │   ├── locale.ts             # SUPPORTED_LOCALES、fallback
│   │   ├── zh-CN.ts
│   │   ├── en.ts
│   │   ├── labels.ts             # category / priority 的显示映射
│   │   └── format.ts             # formatDate、formatNumber
│   └── tests/keys.test.ts        # 两套字典同键校验
└── ui/
    ├── src/
    │   ├── providers/ThemeProvider.tsx
    │   ├── providers/LocaleProvider.tsx
    │   ├── controls/ThemeToggle.tsx
    │   ├── controls/LocaleToggle.tsx
    │   └── styles/tokens.css
    └── tests/theme-and-locale.test.tsx
```

`apps/web` 与 `apps/desktop` 都只从 `@mailmind/i18n` 取文案与格式化能力，从 `@mailmind/ui` 取 Provider 和开关控件。Web 负责读取 / 写入非敏感的 first-party `mm_theme`、`mm_locale`；Desktop 通过 Rust command 读取 / 写入 SQLite 中的 `app_preferences`。共享包不得知道 cookie、SQLite、Tauri 或 Next.js 的实现细节。

## 3. 契约与模型调用

### 3.1 共享类型

```ts
export const SUPPORTED_LOCALES = ['zh-CN', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const SUPPORTED_THEMES = ['light', 'dark'] as const;
export type ThemePreference = (typeof SUPPORTED_THEMES)[number];

export type UiPreference = {
  locale: Locale;
  theme: ThemePreference;
};

export type EmailInsight = {
  schemaVersion: '1.1';
  sourceEmailId: string;
  outputLocale: Locale;
  oneLineSummary: string;
  category: EmailCategoryCode;    // stable code, e.g. customer_order
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  requiresAction: boolean;
  suggestedActions: SuggestedAction[];
  keyFacts: KeyFact[];
  deadline: Deadline | null;
  riskFlags: string[];
  confidence: number;
  needsHumanReview: boolean;
};
```

`category` 不应直接存储“订单/客户”或 “Customer & order”。应存储稳定 code，并在渲染层通过 `t('email.category.customer_order')` 展示。这样既能让 SQL 查询、筛选和统计稳定，又不会把 LLM 的语言变化误当成新的类别。

### 3.2 模型提示词规则

每次分析与汇总都传入 `outputLocale`。应将语言要求写入固定系统提示，并在 schema / contract 层保留同一字段。不要只在用户消息末尾临时加“请用中文回答”，否则难以测试、难以追踪，并且对于不同模型的遵从性不稳定。

```ts
export const outputLanguageInstruction = (locale: Locale) =>
  locale === 'zh-CN'
    ? '所有供人阅读的字符串值必须使用简体中文。JSON 键、枚举值、日期格式和代码保持不变。'
    : 'All human-readable string values must be in English. Keep JSON keys, enum values, dates, and codes unchanged.';

export type AnalyzeEmailInput = {
  normalizedEmail: NormalizedEmail;
  outputLocale: Locale;
};
```

提示词还应保留邮件不可信边界：邮件原文只能作为待理解的数据，不能改变语言、角色、权限或输出 schema。若邮件正文包含“reply in English only”或“忽略系统指令”，模型仍以用户当前 `outputLocale` 生成摘要。

### 3.3 已生成内容的语言切换语义

| 用户动作 | UI 行为 | 是否调用 LLM | 数据处理说明 |
|---|---|---:|---|
| 切换简中 / English | 所有静态文案、类别、日期和控件即时变更 | 否 | 已有 insight 保留原语言，显示其 `outputLocale` |
| 进入已有邮件详情 | 显示原 insight 和“生成语言”标签 | 否 | 不重新读取或上传邮件 |
| 点击“按当前语言重新生成” | 显示 loading，完成后替换 / 新增当前语言 insight | 是 | 仅针对用户明确选择的这封邮件 |
| 切换 Light / Dark | 改 `data-theme` 与语义 token | 否 | 纯展示偏好 |
| 点击“重新生成报告” | 用当前 locale 聚合现有 insight | 是 | 默认不上传原始邮件正文 |

Web 体验端为避免保存多版本洞察，可在内存中用 `emailId + outputLocale` 作为 key，仅保留当前会话中用户已生成的语言版本；会话结束时一并清除。Desktop 可存多版本 insight，或只保留最新版本；黑客松版本建议只保留最新版本，并在重生成前提醒“将替换当前摘要”。

## 4. 主题规格

### 4.1 CSS token 与 Provider

主题使用根节点属性 `data-theme="light"` 与 `data-theme="dark"`，由 CSS variables 定义色彩层级。Tailwind utility 或组件 CSS 只能引用语义 token；禁止把 `#ffffff`、`#111827` 之类主题颜色散落在业务组件中。

优先级、风险和成功状态需在两种主题下使用经过验证的语义颜色，但颜色不能是唯一表达：P0/P1 必须同时有文字优先级、图标与 aria label；错误有明确的标题和说明；置信度应显示数值或“需人工确认”。主题切换前后，卡片尺寸、瀑布流排序和正文布局不得改变。

### 4.2 首屏无闪烁策略

Web 的服务端 layout 根据 `mm_theme` cookie 在生成 HTML 时设置 `data-theme`；第一次没有 cookie 时，使用小型无依赖 bootstrap 在 hydration 前解析 `prefers-color-scheme`。Desktop 在 React 挂载前通过 `get_app_preferences` 读取当前值，并先设置根节点属性再渲染主界面。用户切换后先更新根节点和内存状态，再异步保存 preference，避免界面反应延迟。

## 5. 国际化规格

### 5.1 字典原则

字典必须使用相同 key，而不是让两个语言文件分别按页面组织。组件不得写死业务文案；包括 loading、错误、协议、空状态、筛选项、类别、优先级、数据清除确认和模型语言标签都必须从字典读取。

```ts
export const zhCN = {
  common: { language: '语言', theme: '主题', light: '浅色', dark: '深色' },
  settings: { outputLanguage: 'AI 输出语言跟随界面语言' },
  email: {
    generatedIn: '已按 {{language}} 生成',
    regenerate: '按当前语言重新生成',
    category: { customer_order: '订单/客户', logistics: '账单/物流' }
  }
} as const;

export const en = {
  common: { language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark' },
  settings: { outputLanguage: 'AI output follows the interface language' },
  email: {
    generatedIn: 'Generated in {{language}}',
    regenerate: 'Regenerate in current language',
    category: { customer_order: 'Customer & order', logistics: 'Billing & logistics' }
  }
} satisfies TranslationShape;
```

产品日期和数字使用 `Intl.DateTimeFormat(locale)` 与 `Intl.NumberFormat(locale)`，而不是手工拼接。模型给出的 deadline 应仍保存标准 ISO 时间 / date value，UI 按当前 locale 格式化。因此切换界面语言无需修改原始 insight，也不会影响排序。

### 5.2 Web 与 Desktop 偏好存储

| 宿主 | 首次默认 | 用户修改后的存储 | 读取位置 | 敏感性 |
|---|---|---|---|---|
| Web | `navigator.language` / `prefers-color-scheme` | first-party cookie：`mm_locale`、`mm_theme` | Next layout 与 client Provider | 非敏感；不含 session / 邮件数据 |
| Desktop | OS locale / system theme | SQLite `app_preferences` | Rust command + client Provider | 非敏感；与 secrets 和邮件表分离 |

Web 端不得将 `locale` 与 MailMind 邮件会话 ID 绑定，也不得因为用户切换语言创建新的邮件会话。Desktop 的 `app_preferences` 在“清除所有本地数据”时可以保留以改善下次使用体验；若产品把“清除所有数据”定义为严格的全量清除，则需要在确认文案中清楚说明主题与语言偏好是否也被移除。黑客松版本建议默认保留非敏感主题与语言，但在 UI 中明确提示。

## 6. API、Desktop Command 与数据库增量

```text
POST /api/demo/analyze
  input.uiPreference.locale: 'zh-CN' | 'en'
  response email / completed event: outputLocale

POST /api/demo/digest
  input.uiPreference.locale: 'zh-CN' | 'en'
  response: DigestReport.outputLocale

Tauri commands
  get_app_preferences() -> { theme, locale }
  set_app_preferences({ theme?, locale? }) -> { theme, locale }
  regenerate_email_insight({ emailId, outputLocale }) -> EmailInsight
  regenerate_digest({ window, outputLocale }) -> DigestReport
```

Desktop 新增表：

```sql
CREATE TABLE IF NOT EXISTS app_preferences (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

允许的 key 仅为 `theme`、`locale`。应在 Rust command 层做 enum 验证；不能让 WebView 写任意 preferences。邮件 insight 的 migration 增加 `output_locale TEXT NOT NULL DEFAULT 'zh-CN'`。Web 的此类字段只存在于当次流式 response 和浏览器内存。

## 7. 验收与测试

| 层 | 必测场景 | 通过标准 |
|---|---|---|
| 翻译字典 | `zh-CN` 与 `en` key 集合比较 | 缺少或多出任何业务 key 时 CI 失败 |
| 共享 schema | `outputLocale` 仅接受 `zh-CN/en` | 非法值在 Web route、Rust command 与 LLM response validator 都失败 |
| Agent | 同一 fixture 用两个 locale 运行 | 所有人类可读字段与请求 locale 一致；category / priority code 不变化 |
| Web UI | Light / Dark、简中 / 英文切换 | 切换不丢 cards、不触发隐式 LLM 请求、无明显 theme flash |
| Desktop UI | 首次启动、重启、切换后再启动 | theme / locale 保持；不把 preference 写入邮件表或 secret storage |
| 可访问性 | 键盘操作、focus ring、优先级 / 错误状态 | 仅靠颜色无法传达的语义均有文字、图标或 ARIA 信息 |
| 视觉回归 | Feed、详情、过滤、协议、设置、错误页 | 两种主题和两种语言均无截断、重叠或不可读文本 |

## 8. 4 天内的具体切分

Day 1 上午先建立 `Locale` / `ThemePreference` contract、同键翻译字典和 CSS token；Day 1 下午在 Web 与 Desktop fixture feed 中接入 Provider、两个 toggle 和双语测试。这样真实邮箱、模型和 SQLite 接入时只需要透传 `outputLocale`，而不会在 Day 3 重新改造 UI。

Day 2 将当前 locale 接入 Web Analyze / Digest API 和 LLM prompt；用中英文 fixture 各跑一次。Day 3 增加 Desktop preference command、`app_preferences` migration 与“按当前语言重新生成”。Day 4 以四组组合做演示回归：简中浅色、简中深色、英文浅色、英文深色。语言切换和主题切换应各占演示 10 秒左右，并强调它们使用同一份共享 UI 与 Agent contract。

## 9. 明确不做

黑客松版本不增加繁体中文、日语、RTL、第三种“跟随系统”主题状态、用户可编辑 prompt 的语言选择、自动翻译历史邮件或后台批量重生成。它们会扩大测试矩阵和模型调用成本。版本 v1.1 的承诺仅是：**双端 Light / Dark、简中 / 英文，且用户当前界面语言决定下一次明确发起的模型输出语言。**
