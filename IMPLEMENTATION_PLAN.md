# MailMind 构建计划 v1.0

**日期：** 2026-08-22
**目标：** 在 4 天内完成 MailMind Hackathon 核心产品闭环

---

## 一、项目目录结构（pnpm monorepo）

```
mailmind/
├── apps/
│   ├── web/                     # Next.js App Router（含 BFF）
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   │   └── page.tsx           # Landing 页
│   │   │   ├── experience/
│   │   │   │   └── page.tsx           # 体验主页面
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx           # 隐私说明页
│   │   │   ├── globals.css            # Tailwind + CSS tokens
│   │   │   └── layout.tsx             # 根布局
│   │   ├── lib/server/
│   │   │   ├── imap-client.ts         # Node IMAP adapter
│   │   │   ├── mime-parser.ts         # mailparser
│   │   │   ├── sanitize-html.ts       # HTML→文本清洗
│   │   │   ├── ip-guard.ts            # SSRF 防护
│   │   │   └── stream-sse.ts          # SSE 推送工具
│   │   ├── app/api/demo/
│   │   │   ├── analyze/route.ts       # POST: 单次流式分析
│   │   │   ├── digest/route.ts        # POST: 半日简报
│   │   │   └── dispose/route.ts       # POST: 会话清除
│   │   ├── components/
│   │   │   ├── ConsentGate.tsx
│   │   │   ├── ConnectionForm.tsx
│   │   │   ├── FeedFilters.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── store/
│   │   │   └── sessionStore.ts        # Zustand memory-only
│   │   ├── hooks/
│   │   │   ├── useSSE.ts
│   │   │   └── useSessionDispose.ts
│   │   └── next.config.ts
│   └── desktop/                  # Vite + React + Tauri 2
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── components/         # 同 Web UI 包组件
│       │   └── pages/
│       └── src-tauri/
│           ├── src/
│           │   ├── commands/       # Tauri command 实现
│           │   ├── mail/           # Rust IMAP/POP3 adapter
│           │   ├── llm/            # OpenAI-compatible client
│           │   ├── db/             # rusqlite migrations
│           │   ├── secrets/        # P1 keychain adapter
│           │   └── lib.rs
│           └── migrations/
├── packages/
│   ├── contracts/                # Zod schema + DTO
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── email-insight.ts
│   │   │   ├── digest-report.ts
│   │   │   ├── preferences.ts
│   │   │   ├── stream-events.ts
│   │   │   └── index.ts
│   │   └── tests/
│   └── i18n/                     # zh-CN / en 字典
│       ├── package.json
│       └── src/
│           ├── locale.ts
│           ├── zh-CN.ts
│           ├── en.ts
│           ├── labels.ts
│           ├── format.ts
│           └── index.ts
│   ├── ui/                       # React 展示组件
│       ├── package.json
│       └── src/
│           ├── EmailCard.tsx
│           ├── Feed.tsx
│           ├── DigestPanel.tsx
│           ├── ConsentGate.tsx
│           ├── ThemeToggle.tsx
│           ├── LocaleToggle.tsx
│           ├── providers/
│           │   ├── ThemeProvider.tsx
│           │   └── LocaleProvider.tsx
│           └── styles/
│               └── tokens.css
│   ├── fixtures/                 # 脱敏 .eml 样本
│       ├── sample-01-customer-inquiry.eml
│       ├── sample-02-logistics-issue.eml
│       ├── sample-03-meeting-change.eml
│       ├── sample-04-billing-reminder.eml
│       ├── sample-05-marketing.spam.eml
│       ├── sample-06-system-notice.eml
│       └── injection-attempt.eml
│   └── tsconfig/
│       ├── base.json
│       ├── react.json
│       └── next.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRIVACY.md
│   ├── THREAT_MODEL.md
│   └── DEMO_SCRIPT.md
├── scripts/
│   └── verify-no-write-mail-commands.mjs
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## 二、技术栈确认

| 层 | 选择 |
|---|---|
| Shell | pnpm workspaces |
| Web 框架 | Next.js 15 (App Router) |
| Desktop | Tauri 2 + Vite + React |
| UI | Tailwind CSS + 自定义 tokens |
| 状态管理 | Zustand (memory-only for Web) |
| Schema | Zod (shared validation) |
| 邮件协议 | `imapflow` (Node), `async-imap` (Rust) |
| MIME 解析 | `mailparser` (Node), `mailparse` (Rust) |
| LLM | OpenAI SDK (custom baseURL) / reqwest (Rust) |
| 数据库 | rusqlite (bundled SQLite) |
| 密钥链 | P0: 不落盘；P1: native Keychain/Credential Manager |

---

## 三、关键契约定义（packages/contracts）

### 3.1 EmailInsight Schema

```typescript
export type EmailCategoryCode = 
  | 'customer_order'    // 订单/客户
  | 'logistics'         // 账单/物流
  | 'meeting'           // 日程/会议
  | 'billing'           // 账单提醒
  | 'notification'      // 系统通知
  | 'marketing'         // 营销
  | 'social'            // 社交
  | 'other'             // 其他
  | 'needs_review';     // 需人工复核（提示注入等）

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export type SuggestedAction = {
  action: string;           // 动词开头，如"确认现货与生产周期"
  due_at?: string;          // ISO datetime or null
  reason?: string;
};

export type KeyFact = {
  label: string;            // "产品", "数量", "金额"
  value: string;
};

export type Deadline = {
  value: string;            // ISO date
  source: string;           // "本周四"
  confidence: number;       // 0-1
};

export type EmailInsight = {
  schemaVersion: '1.1';
  sourceEmailId: string;
  outputLocale: Locale;
  oneLineSummary: string;           // ≤70 汉字
  category: EmailCategoryCode;
  priority: Priority;
  requiresAction: boolean;
  suggestedActions: SuggestedAction[];  // ≤3
  keyFacts: KeyFact[];
  deadline: Deadline | null;
  riskFlags: string[];
  confidence: number;               // 0-1
  needsHumanReview: boolean;
};
```

### 3.2 DigestReport Schema

```typescript
export type DigestItem = {
  text: string;
  email_refs: string[];   // source_email_id 列表
};

export type DigestAction = {
  action: string;
  email_refs: string[];
  due_at?: string;
};

export type DigestReport = {
  schemaVersion: '1.1';
  periodStart: string;
  periodEnd: string;
  headline: string;
  topPriorities: DigestItem[];      // ≤5
  recommendedActions: DigestAction[];  // ≤7
  risksAndBlockers: DigestItem[];
  noActionRequired: DigestItem[];
  outputLocale: Locale;
};
```

### 3.3 StreamEvent Types

```typescript
export type StreamEventType =
  | 'progress'
  | 'email'
  | 'completed'
  | 'error';

export type StreamEvent =
  | { type: 'progress'; stage: string; message: string }
  | { type: 'email'; card: EmailCardViewModel; detail: SanitizedEmailDetail }
  | { type: 'completed'; insights: EmailInsight[]; usage?: LlmUsage }
  | { type: 'error'; code: ErrorCode; retryable: boolean; safeMessage: string };
```

---

## 四、分日实施计划

### Day 1：工程骨架 + Fixture 双端体验

**目标：** 两个端都能用 fixture 数据渲染一致的摘要瀑布流

#### 上午（09:00–12:30）

| 任务 | 文件 | 验收 |
|---|---|---|
| 1.1 初始化 pnpm workspace | `pnpm-workspace.yaml`, `package.json` | `pnpm check` 通过 |
| 1.2 创建 contracts 包 | `packages/contracts/src/*.ts` | Zod schema 可解析所有 fixture |
| 1.3 创建 fixtures 包 | `packages/fixtures/*.eml` × 8 | 手动验证 `.eml` 格式 |
| 1.4 创建 i18n 包 | `packages/i18n/src/{zh-CN,en,locale}.ts` | 双字典 key 集合一致 |
| 1.5 创建 UI 包基础 | `packages/ui/src/providers/ThemeProvider.tsx` | Light/Dark token 生效 |

#### 下午（13:30–18:00）

| 任务 | 文件 | 验收 |
|---|---|---|
| 1.6 Web Landing 页 | `apps/web/app/(marketing)/page.tsx` | 只读承诺可见 |
| 1.7 ConsentGate 组件 | `packages/ui/src/ConsentGate.tsx` | 未三项勾选按钮禁用 |
| 1.8 EmailCard 组件 | `packages/ui/src/EmailCard.tsx` | 双主题可读 |
| 1.9 Feed 组件（fixture）| `apps/web/app/experience/page.tsx` | 8 张卡正确渲染 |
| 1.10 Desktop 骨架 | `apps/desktop/src/main.tsx` | 启动成功 |

#### 晚上（19:30–21:00）

| 任务 | 验收 |
|---|---|
| 1.11 Web mock SSE | 渐进出现卡片，不等全部完成 |
| 1.12 Desktop mock command | 同 fixture 显示 |
| 1.13 统一走查 | 录 60 秒 fixture Demo |

---

### Day 2：Web 真实闭环

**目标：** 48 小时截止，Web IMAP + LLM + SSE 摘要 + 半日简报 + 结束清除

#### 上午（09:00–12:30）

| 任务 | 验收 |
|---|---|
| 2.1 Node IMAP adapter | `apps/web/lib/server/imap-client.ts` |
| 2.2 TLS 连接 + host guard | `ip-guard.ts` 拦截 loopback/私网 IP |
| 2.3 MIME 解析 + 文本化 | 附件仅标记，不 OCR |
| 2.4 HTML sanitization | `dangerouslySetInnerHTML` 禁用 |
| 2.5 SSE progress 推送 | 首卡在 15 秒内 |

#### 下午（13:30–18:00）

| 任务 | 验收 |
|---|---|
| 2.6 LLM adapter | OpenAI-compatible，支持 JSON schema fallback |
| 2.7 `/api/demo/analyze` route | 10 封上限，单封 12k 字符 |
| 2.8 确定性排序 | priority → deadline → requires_action |
| 2.9 `/api/demo/digest` route | 仅接收已验证 insight |
| 2.10 Session dispose | 结束体验后内存清空 |

#### 晚上（19:30–21:00）

| 任务 | 验收 |
|---|---|
| 2.11 部署测试邮箱 E2E | 3 次完整演练通过 |
| 2.12 日志脱敏检查 | 密码/key 不出现在任何日志 |

---

### Day 3：Desktop 持续使用叙事

**目标：** SQLite、5 天/500 封、triage、purge、至少一端打包

#### 上午（09:00–12:30）

| 任务 | 验收 |
|---|---|
| 3.1 Rust IMAP adapter | `src-tauri/src/mail/imap.rs` |
| 3.2 SQLite migrations | 7 张表 + retention 算法 |
| 3.3 `sync_account` command | 5 天/500 封硬限制 |
| 3.4 保留策略测试 | 单测证明第 501 封被剔除 |

#### 下午（13:30–18:00）

| 任务 | 验收 |
|---|---|
| 3.5 Feed query command | 返回 EmailCardViewModel[] |
| 3.6 Local triage state | 已处理/稍后看/忽略 |
| 3.7 Purge account/clear all | 事务删除，半清除回滚 |
| 3.8 Tauri capabilities 收紧 | 无 shell/fs/sql 权限 |

#### 晚上（19:30–21:00）

| 任务 | 验收 |
|---|---|
| 3.9 Keychain P1（可选）| macOS/Windows 任一平台验证 |
| 3.10 桌面打包 | 至少一个平台可运行 |

---

### Day 4：开源、演示与回退

**目标：** 公网 Demo、开源仓库、录屏与讲稿

| 任务 | 验收 |
|---|---|
| 4.1 Full E2E + 负向测试 | 错误密码、模型失败有回退 |
| 4.2 README 完成 | 3 分钟 fixture 启动路径 |
| 4.3 文档完整 | PRIVACY.md, SECURITY.md, THREAT_MODEL.md |
| 4.4 公网 Web 验证 | 无缓存浏览器中访问正常 |
| 4.5 录屏 90 秒备份视频 | 可离线播放完整价值闭环 |
| 4.6 5 分钟讲稿 | 团队成员可独立讲解 |
| 4.7 Git tag/release | v0.1.0 |

---

## 五、优先级矩阵

| 优先级 | 功能 | 截止时间 |
|---|---|---|
| **P0** | Landing + ConsentGate + IMAP + LLM + SSE | Day 2 结束 |
| **P0** | EmailCard + Feed + Filters + Detail | Day 1 结束 |
| **P0** | Light/Dark theme + zh-CN/en locale | Day 1 结束 |
| **P0** | SQLite + 5 days/500 emails retention | Day 3 结束 |
| **P0** | Triage state + purge | Day 3 结束 |
| **P1** | POP3 adapter | Day 2 晚（IMAP 通后再做） |
| **P1** | Native Keychain | Day 3 晚 20:30 前 |
| **P2** | 附件 OCR | 赛后 roadmap |
| **P2** | OAuth | 赛后 roadmap |
| **P2** | RAG/语义搜索 | 赛后 roadmap |

---

## 六、安全控制清单（必须实现）

- [ ] 三项协议必须全勾才能连接
- [ ] 仅 TLS/STARTTLS，无不安全开关
- [ ] 禁止写邮件命令（IMAP DELE/STORE/APPEND/COPY/EXPUNGE，POP3 DELE）
- [ ] Web 会话结束后内存清空，无可回取缓存
- [ ] 密码/API Key 不进 SQLite、不写日志
- [ ] 邮件内容视为不可信，不与系统提示混排
- [ ] HTML 正文仅文本化，禁用 dangerouslySetInnerHTML
- [ ] Host 校验拦截 loopback/私网/metadata IP
- [ ] 提示注入样本测试通过

---

## 七、第一周工作项（本 Turn 执行）

基于以上计划，立即开始的工作：

1. **创建项目根配置文件**
   - `package.json`（根）
   - `pnpm-workspace.yaml`
   - `.gitignore`（更新，加入 Node/Tauri 规则）

2. **创建 packages 骨架**
   - `packages/contracts/`
   - `packages/i18n/`
   - `packages/ui/`
   - `packages/fixtures/`
   - `packages/tsconfig/`

3. **创建 apps/web 基础结构**
   - `apps/web/package.json`
   - `apps/web/next.config.ts`
   - `apps/web/tsconfig.json`

4. **初始化 Contracts 包**
   - `EmailInsight` Zod schema
   - `DigestReport` Zod schema
   - `StreamEvent` types
   - `Preferences` types
