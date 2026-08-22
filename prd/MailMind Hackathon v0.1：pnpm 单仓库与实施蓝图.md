# MailMind Hackathon v0.1：pnpm 单仓库与实施蓝图

## 1. 推荐结论

**应采用 pnpm 单仓库，但保持仓库很小。**你的 Web 与 Desktop 都是 React 前端，且必须共享邮件摘要 schema、LLM 提示词、演示夹具和设计语言；将这些内容复制到两个仓库会在 4 天内快速分叉。pnpm 原生支持以 `pnpm-workspace.yaml` 定义多包工作区，并可用 `workspace:` 协议确保内部依赖只解析为本地包，因此足够支撑本项目，无须在 Day 1 同时上 Nx、Turborepo、Changesets 或复杂的微前端体系。[1]

本项目建议以 **pnpm workspaces + TypeScript project references + 根目录统一 lint/test 命令**为最低配单仓库。只有在 Day 3 以后构建耗时明显、且主流程已稳定时，再选择性加 Turborepo 做缓存；不要把它当作 P0 依赖。

| 方案 | 建议 | 依据 |
|---|---:|---|
| 两个独立仓库 | 否 | 共享 schema、提示词、测试邮件和 UI 需要手工同步，演示风险高 |
| pnpm 单仓库 | 是 | 共享类型与 UI，同时让 Web / Desktop 独立构建与发布 |
| pnpm + Turborepo | 备选 | 不是功能依赖；若 CI 已慢再引入 |
| Nx / Bazel / Rush | 否 | 4 天交付中学习与配置成本大于收益 |
| 共享邮件网络层 | 否 | Node 与 Rust 的 I/O / TLS 实现不同，共享抽象会降低交付速度 |
| 共享领域 schema、提示词、UI | 是 | 最大化一致性，并能让“同一 Agent 输出”成为评审亮点 |

## 2. 仓库目录

```text
mailmind/
├── apps/
│   ├── web/                         # Next.js App Router：公开体验端与 BFF
│   │   ├── app/
│   │   │   ├── (marketing)/page.tsx
│   │   │   ├── experience/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── api/demo/
│   │   │       ├── analyze/route.ts # 单次请求，SSE / NDJSON 渐进返回
│   │   │       └── digest/route.ts  # 仅接收已验证摘要
│   │   ├── lib/server/              # request redaction、IP guard、Node IMAP adapter
│   │   └── next.config.ts
│   └── desktop/                     # Vite + React + Tauri 2
│       ├── src/                     # React 视图、Tauri command 调用
│       └── src-tauri/
│           ├── src/
│           │   ├── commands/        # connect, sync, query, digest, purge
│           │   ├── mail/            # imap.rs, pop3.rs, mime.rs
│           │   ├── llm/             # openai_compatible.rs
│           │   ├── db/              # migrations、repositories
│           │   ├── secrets/         # P1 native keychain adapter
│           │   └── lib.rs
│           └── migrations/
├── packages/
│   ├── contracts/                   # Zod schema、DTO、API 事件、类型
│   ├── ai-core/                     # 提示词、output parsers、deterministic ranking
│   ├── ui/                          # React 展示组件：Masonry / EmailCard / Digest
│   ├── fixtures/                    # 脱敏 .eml、模型响应、注入攻击样本
│   ├── eslint-config/               # 可选；若时间紧，可放根目录
│   └── tsconfig/                    # base / react / next config
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRIVACY.md
│   ├── THREAT_MODEL.md
│   └── DEMO_SCRIPT.md
├── scripts/
│   ├── verify-no-write-mail-commands.mjs
│   └── seed-demo-fixtures.mjs
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── LICENSE                           # 建议 Apache-2.0
└── README.md
```

`packages/contracts` 是唯一事实源。Web API DTO、Desktop command DTO、模型 JSON Schema、Zod 验证和 fixture 均从此生成或引用。Rust 不应尝试直接消费 TypeScript 类型；Day 1 在 `contracts/schemas/email-insight.schema.json` 导出 JSON Schema，并在 Rust 用 `serde` 对应结构 + JSON Schema 测试夹具验证，以避免跨语言 codegen 的额外复杂度。

## 3. 最小工作区配置

### 3.1 `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*

catalog:
  react: ^19.0.0
  react-dom: ^19.0.0
  zod: ^3.24.0

onlyBuiltDependencies:
  - '@tauri-apps/cli'
```

实际版本以建项目当天的稳定兼容版本锁定；不要在冲刺中做大版本升级。每一个内部依赖显式声明为 `workspace:*`，例如 `"@mailmind/contracts": "workspace:*"`。pnpm 的 workspace 协议会拒绝将此类依赖意外解析到注册表中的同名包，有助于保持单仓库依赖确定性。[1]

### 3.2 根 `package.json`

```json
{
  "name": "mailmind",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "engines": { "node": ">=22.0.0", "pnpm": ">=10.0.0" },
  "scripts": {
    "dev:web": "pnpm --filter @mailmind/web dev",
    "dev:desktop": "pnpm --filter @mailmind/desktop tauri dev",
    "build": "pnpm -r --workspace-concurrency=2 build",
    "build:web": "pnpm --filter @mailmind/web build",
    "build:desktop": "pnpm --filter @mailmind/desktop tauri build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "test:security": "node scripts/verify-no-write-mail-commands.mjs",
    "format": "prettier --write .",
    "check": "pnpm lint && pnpm typecheck && pnpm test && pnpm test:security"
  }
}
```

请注意，`packageManager` 的精确 pnpm 版本应在第一天实际执行 `pnpm --version` 后写入；上例仅展示格式。锁文件必须提交。根级 `pnpm check` 是合并前唯一必跑命令；不要让开发者手工判断要运行哪些零散脚本。

## 4. 技术栈：保守但完整

| 层 | Web 体验端 | Desktop 本地端 | 共享 / 备注 |
|---|---|---|---|
| Shell | Next.js App Router | Tauri 2 + Vite + React | 两端都用 TypeScript、React、Tailwind |
| UI | `@mailmind/ui` + Tailwind CSS | 同左 | 只共享无宿主依赖的展示组件 |
| 状态 | React state / Zustand（仅内存） | Zustand + command query cache | Web 禁止持久化插件、localStorage 和 IndexedDB |
| 领域模型 | `@mailmind/contracts` + Zod | TS DTO + Rust `serde` DTO | JSON Schema 版本化 |
| 邮件 I/O | Node：`imapflow` + `mailparser` | Rust：`async-imap` / TLS client + `mailparse` | 接口同名，具体实现不共享 |
| LLM | OpenAI SDK（自定义 `baseURL`）或原生 `fetch` | Rust `reqwest` | 只实现 chat-completions 最小交集 |
| 数据 | 不设业务数据库 | `rusqlite`（bundled SQLite）+ migrations | Desktop DB 仅由 Rust command 访问 |
| 密钥 | 部署环境变量或本次请求内存 | P0 memory；P1 native Keychain / Credential Manager | Key 永不入 SQLite |
| 校验与测试 | Vitest、route 级测试 | Rust unit / integration tests | fixture + contract test 共用 |
| 部署 / 打包 | Docker 化 Node runtime | `tauri build` | Web 需能发起外部 TCP TLS 连接 |

**Web 不建议优先部署到纯静态托管或仅针对 HTTP fetch 优化的边缘运行时。**IMAP/POP3 是面向邮箱服务器的 TLS/TCP 连接，需要运行 Node 进程并允许出站 TCP；将 Next.js 以 Docker Node runtime 部署至支持普通出站网络的托管平台更可控。实际发布前应以演示邮箱验证目标平台的 993 / 995 / 143 / 110 端口 egress。

## 5. 共享边界：什么必须共享，什么绝不共享

### 5.1 必须共享的内容

`contracts` 包保存 `NormalizedEmail`、`EmailInsight`、`DigestReport`、`EmailCardViewModel` 以及 `StreamEvent` 的类型、Zod schema 和 JSON Schema。`ai-core` 保存固定提示词、基于 priority / deadline / action 的纯函数排序、结构化输出校验和半日窗口计算。`fixtures` 保存完全脱敏的 `.eml` 文件、预期 JSON 结果、模型错误、MIME 异常和提示注入样本。

`ui` 包只保存展示层，包括 `EmailCard`、`FeedFilters`、`DigestPanel`、`ConsentGate`、`DataBoundaryNotice` 和可访问性样式。Web 的 landing page、Desktop 的菜单 / 原生窗体配置、路由和数据加载组件不共享。这样能让 UI 有一致观感，又避免将 Next Server Component 约束带入 Vite。

### 5.2 不共享的内容

邮件连接、MIME 解析、Socket、数据库写入、Keychain、Node route handler、Tauri command、环境变量读取均为宿主专有。它们只通过契约传递 `NormalizedEmail` 或 `EmailInsight`，禁止将 `IMAPClient`、Node `Buffer`、Rust connection handle 等泄露进 `contracts`。

| 包 / 模块 | 允许依赖 | 禁止依赖 |
|---|---|---|
| `contracts` | Zod、纯 TypeScript | React、Next、Tauri、Node fs / net、API Key |
| `ai-core` | contracts、纯 util | 网络客户端、数据库、宿主环境变量 |
| `ui` | React、contracts、样式工具 | Next navigation、Tauri API、邮件 I/O |
| `apps/web` | 上述包、Node mail / LLM adapter | Desktop / Rust 文件 |
| `apps/desktop` | 上述包、Tauri frontend API | Web route handler |
| `src-tauri` | Rust crates、JSON Schema | 任意 WebView 直接 SQL 字符串 |

## 6. Web API：无服务端会话库的流式体验

为了兑现 Web “会话内读取、结束即清除”，最简洁的设计不是创建带数据库的 session，也不是维持不可靠的 serverless 内存 Map，而是使用**一次性流式分析请求**。

```text
POST /api/demo/analyze
  输入：consent + connection config + mail credentials + optional demo model config
  输出：text/event-stream 或 NDJSON
      event: progress    {stage, message}
      event: email       {card: EmailCardViewModel, detail: SanitizedEmailDetail}
      event: completed   {insights: EmailInsight[], usage: minimal}
      event: error       {code, retryable, safeMessage}

POST /api/demo/digest
  输入：consent token + 已验证 EmailInsight[] + time window
  输出：DigestReport
```

`/api/demo/analyze` 在一个请求生命周期中完成：参数验证 → 连接邮箱 → 列出限定数量 → 逐封读取 → LLM 解析 → 流式吐卡 → 退出协议会话。它不创建业务表、不保留全局对象、不写临时快照；浏览器前端用 React 内存 store 保存卡片，刷新、关闭标签页或点击“结束体验”即清除。`/api/demo/digest` 只接收已结构化的 insight，不接收邮箱密码或原文。

用户若请求“原文详情”，P0 仅展示清洗后的正文摘录（例如 1,500 字符）。这足以支撑可解释性且避免让更多原始内容在浏览器中长期存留。完整原文浏览留给本地端；如果一定要在 Web 加入，应在 stream 的同一会话内返回，绝不能建立可通过 URL / ID 回取的服务端邮件缓存。

所有 API 需校验 `Origin`、Content-Type、大小上限和防重复提交 token；连接信息只存在请求 body。日志中间件必须在 request body 解析之前或通过显式字段删除保证不落 body。错误响应仅提供安全错误码。

## 7. Desktop command 合同

Tauri WebView 不应持有网络 socket、数据库句柄或密码。前端只通过下列业务级 command 与 Rust 后端交互；每个 command 返回 `Result<T, AppError>`，其中 `AppError` 只有安全错误码与用户可读 message。

| Command | 请求 | 响应 | 备注 |
|---|---|---|---|
| `test_connection` | `ConnectionInput` | `ConnectionTestResult` | 不保存账号、不同步正文 |
| `save_account` | `AccountDraft + SecretInput?` | `AccountSummary` | P0 仅元数据；P1 秘密交原生 Keychain |
| `sync_account` | `accountId` | 进度事件 + `SyncSummary` | 5 天 / 500 封硬限制 |
| `list_feed` | `FeedQuery` | `EmailCardViewModel[]` | 仅返回 UI 所需字段 |
| `get_email_detail` | `emailId` | `EmailDetail` | 用户显式进入详情才读全量本地正文 |
| `generate_digest` | `DigestWindow` | `DigestReport` | 输入优先使用本地 insight，不重复上传全文 |
| `set_triage_state` | `emailId, state` | `void` | 不回写邮箱 |
| `purge_account_data` | `accountId, confirmation` | `PurgeResult` | 事务删除邮件、摘要、报告、secret reference |
| `clear_all_local_data` | `confirmation` | `PurgeResult` | 演示“数据掌控”场景 |

Rust 端 `sync_account` 在接收 command 后创建 run id，向前端发送进度事件：`connecting`、`listing`、`fetching(n/total)`、`analyzing(n/total)`、`indexing`、`completed`。浏览器侧不允许通过 Tauri `shell`、`fs` 或任意 SQL plugin 访问实现同一功能；Tauri capabilities 仅授权实际使用的 command。

## 8. 数据库迁移与留存算法

Desktop 的 SQLite 应由 Rust `rusqlite` 通过嵌入式 migration 在应用启动时执行。DB 文件放在 app data 目录，目录权限尽可能遵从平台默认应用数据隔离；账号密码和 LLM key 不得存入任何列。

同步 run 成功后执行同一事务内的留存清理：先删除 `received_at < now - 5 days` 的邮件及外键数据；然后对仍保留邮件按 `received_at DESC, id DESC` 排序，删除第 501 封及之后的记录；最后限制 digest report 到最近 10 份。任何一步失败则事务回滚并显示“同步未完成，已有数据未改变”，不进行半清理。

## 9. 质量门槛与测试矩阵

| 层级 | 必做测试 | 通过标准 |
|---|---|---|
| `contracts` | Zod schema、JSON fixture、序列化 | Web / Rust / 模型返回同一 fixture 均可解析 |
| `ai-core` | ranking、时间窗口、输出截断、fallback digest | 相同输入得到固定排序；不因模型文本风格变化乱序 |
| Web | route 输入校验、body redaction、流式事件顺序 | 凭证错误 / 模型错误 / 解析错误都不包含秘密 |
| Desktop Rust | MIME parser、IMAP / POP3 mock、SQLite migration、purge | 500 / 5 天限制准确，删除可验证 |
| 安全 | 提示注入 fixture、HTML fixture、禁止写命令扫描 | 无 `DELE/STORE/APPEND/COPY/EXPUNGE` 生产调用；无 raw HTML 渲染 |
| 体验 | 5–10 封测试邮箱的手工 E2E | 首张卡在 15 秒内出现；可以完成结束体验 / 清除数据 |

`verify-no-write-mail-commands.mjs` 不应只是 grep 文本，而应扫描生产邮件适配器导出的 command allowlist：IMAP 允许 `CAPABILITY, STARTTLS, AUTHENTICATE, LOGIN, EXAMINE, SELECT(readOnly), SEARCH, FETCH, UID FETCH, LOGOUT`；POP3 允许 `CAPA, STLS, USER, PASS, AUTH, STAT, LIST, UIDL, TOP, RETR, NOOP, RSET, QUIT`。对任何不在 allowlist 的调用失败构建。IMAP 协议同时包含写命令，因而仅承诺“我们不会调用写命令”并不足够，应以代码结构和测试使其可验证。[2]

## 10. 环境变量与开源卫生

```dotenv
# apps/web/.env.local（绝不提交）
DEMO_LLM_BASE_URL=https://provider.example/v1
DEMO_LLM_API_KEY=replace_me
DEMO_LLM_MODEL=replace_me
DEMO_SESSION_MAX_EMAILS=10
DEMO_ALLOWED_ORIGINS=https://demo.example.com

# Desktop：P0 在 UI 当次输入；开发调试才可使用此文件，且不读取生产 secrets
VITE_DEFAULT_LLM_BASE_URL=
VITE_DEFAULT_LLM_MODEL=
```

`.env.example` 仅含字段名和安全说明，不包含任何真实 key、邮箱地址、测试邮件、请求 dump 或从浏览器复制的配置。GitHub Actions 在最后半天加入最小 CI：`pnpm install --frozen-lockfile`、`pnpm check`、Web build；Desktop 仅在开发机 / release tag 打包，避免在时间紧张时被多平台 Rust 交叉编译拖慢。

开源许可证建议选 **Apache-2.0**：它适合希望被采用、又希望保留明确专利授权条款的工程型项目；若你更偏好极简，MIT 也可。README 必须用醒目文字说明：这是只读演示项目；不要用主密码，优先使用专门测试账户或应用专用密码；模型供应商与邮件服务商分别处理何种数据；项目并未做安全审计。

## 11. 第一天初始化顺序

1. 在根目录执行 `pnpm init`，创建 `pnpm-workspace.yaml` 与四个包骨架；先使 `pnpm check` 全绿。
2. 创建 `packages/contracts` 和 `packages/fixtures`，把 8–10 封脱敏 `.eml` 邮件及预期 insight 写入测试。
3. 初始化 Next App 与 Tauri + Vite + React；将 `EmailCard` 做在 `packages/ui`，两端各渲染同一 fixture。
4. Web 先完成 `/api/demo/analyze` 的 fixture 模式（无需真实邮箱 / 模型），验证流式信息卡体验。
5. Desktop 先用 Rust command 返回 fixture，打通 UI、SQLite schema 与本地 feed。
6. 只有“双端 UI 对同一 contract 正确显示”的基础完成后，再接入 IMAP、模型和真实同步。

## 参考资料

[1]: https://pnpm.io/workspaces "pnpm Workspace Documentation"
[2]: https://www.rfc-editor.org/rfc/rfc3501 "RFC 3501 — IMAP4rev1"
