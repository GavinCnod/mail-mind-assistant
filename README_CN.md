# MailMind v0.3.1

> 您的只读 AI 邮件分诊助手 · AgnesCode Build Challenge 2026

MailMind 帮助繁忙的专业人士快速理解并优先处理邮件，同时确保不会误发、误删或修改任何邮件。

## 问题与目标

邮件是用户与 AI 代理之间最脆弱的交互界面。几乎所有接触收件箱的自动化工具都承担着误发、误删或数据泄露的风险——因为大多数系统默认拥有写入权限。

MailMind 推翻了这一假设。它是一个 **只读** AI 邮件分诊助手，永不发送、删除、移动或标记邮件。它只负责阅读、摘要、分类和给出建议——然后停止。

本项目为 **AgnesCode Build Challenge** 而构建，旨在证明：当隐私与安全是架构约束而非事后补救时，可信 AI 代理是什么样子的。

### 为什么现在做？

- 专业人士每周收到数百封邮件，自动化分诊可节省数小时
- 公众对拥有广泛文件/邮件访问权限的 AI 工具信任度下降
- 邮件仍是专业沟通的主要渠道，但鲜有工具以只读纪律对待其数据

## 特性

- ✉️ **只读访问** — MailMind 永远不会发送、删除或修改您的邮件
- 🤖 **AI 智能分诊** — 智能摘要、分类与优先级排序
- 🔒 **隐私优先** — Web 端零留存，桌面端本地存储
- 🌙 **深色/浅色主题** — 舒适观看，支持自动切换
- 🌐 **双语支持** — 简体中文 / English
- ⚡ **流式分析** — 逐封展示分析结果，无需等待全部完成

## 架构

```
mailmind/
├── apps/
│   ├── web/              # Next.js Web 体验端（BFF + 流式 API）
│   └── desktop/          # Tauri 2 桌面端（SQLite + 本地存储）
├── packages/
│   ├── contracts/        # 共享 Zod Schema 和 TypeScript 类型
│   ├── i18n/             # 国际化（zh-CN, en）
│   ├── ui/               # 共享 React 组件
│   ├── fixtures/         # 脱敏测试邮件样本
│   └── tsconfig/         # 共享 TypeScript 配置
└── docs/                 # 文档与设计规范
```

## 快速开始（演示模式）

开发和本地演示时，可使用预加载的示例邮件数据：

```bash
# 克隆仓库
git clone https://github.com/GavinCnod/mail-mind-assistant.git
cd mail-mind-assistant

# 安装依赖
pnpm install

# 启动 Web 应用
pnpm dev:web
# 访问 http://localhost:3000

# 或启动桌面应用
pnpm dev:desktop
```

## 真实邮箱配置

**⚠️ 重要提示：** 请使用 **应用专用密码**，而非主邮箱密码。

### 前置条件
- Node.js 22+
- pnpm 10+
- 已启用 IMAP 的邮箱账号
- OpenAI 兼容格式的 AI API 密钥

### 配置步骤

复制示例环境变量文件并填写您的值：

```bash
cp .env.example .env.local
```

```env
DEMO_LLM_BASE_URL=https://api.openai.com/v1
DEMO_LLM_API_KEY=<your-api-key>
DEMO_LLM_MODEL=gpt-4o-mini
```

## 支持的邮箱协议

MailMind 支持两种标准邮件获取协议，均强制使用加密 TLS 连接：

**IMAP（互联网消息访问协议）**
- 完整的邮箱同步能力：可读取、搜索和拉取邮件，且不修改服务器副本
- 支持文件夹导航、邮件标记和大邮箱下的增量拉取，性能更优
- 适合需要在多设备间保持邮箱同步的用户
- 因其丰富的功能集和高效的查询能力，是大多数场景的推荐协议

**POP3（邮局协议版本 3）**
- 将邮件从服务器下载到本地设备，通常下载后从服务器删除
- 协议更简单、开销更低，适合单设备工作流程
- 支持可重试的拉取操作和用于邮件追踪的 UIDL（唯一标识符）
- 适合偏好本地优先存储、尽量减少与服务端交互的用户

两种协议默认均强制使用 TLS 加密（IMAP 端口 993，POP3 端口 995）。MailMind 仅使用只读命令——绝不会发送任何可能改变邮箱状态的 STORE、APPEND、COPY、EXPUNGE 或 DELE 操作。

## 安全承诺

MailMind 做出以下承诺：

1. **只读访问** — 永不执行任何邮件写入命令
2. **凭证不落盘** — 密码仅存在于内存中
3. **敏感数据不上日志** — API Key 和密码绝不出现于任何日志
4. **加密传输** — 仅允许 TLS/STARTTLS 连接
5. **提示注入防御** — 邮件内容视为不可信数据，与系统提示隔离

## 测试

```bash
# 运行全量检查
pnpm check

# 类型检查
pnpm typecheck

# 安全扫描
pnpm test:security
```

## 项目结构

| 目录 | 用途 |
|------|------|
| `apps/web/` | Next.js Web 应用（含 BFF 后端） |
| `apps/desktop/` | Tauri 2 桌面应用 |
| `packages/contracts/` | 共享类型定义与 Zod Schema |
| `packages/i18n/` | 国际化字典 |
| `packages/ui/` | 共享 React UI 组件 |
| `packages/fixtures/` | 测试邮件样本（.eml 文件） |
| `docs/` | 文档与设计规范 |

## 技术栈

- **前端框架：** React 19, Next.js 15, Vite
- **桌面端：** Tauri 2, Rust
- **语言：** TypeScript
- **样式：** Tailwind CSS + 自定义 CSS Token
- **数据校验：** Zod
- **数据库：** SQLite（本地嵌入，按需打包）
- **邮件协议：** IMAP/POP3 over TLS
- **AI：** OpenAI 兼容 API

## 功能列表

### Web 应用（`apps/web/`）

| 序号 | 功能 | 状态 |
|------|------|------|
| 1 | 着陆页（Editorial Dark-Academic 设计风格） | ✅ 已完成 |
| 2 | 邮件分诊体验（IMAP/TLS 连接） | ✅ 已完成 |
| 3 | AI 驱动的流式邮件分析与摘要 | ✅ 已完成 |
| 4 | ConsentGate — 隐私优先的账户授权流程 | ✅ 已完成 |
| 5 | 深色/浅色主题（Atelier Zero 美学风格） | ✅ 已完成 |
| 6 | 双语支持（简体中文 / English，通过 i18n 包） | ✅ 已完成 |
| 7 | 隐私政策与关于页面 | ✅ 已完成 |
| 8 | API 路由：`/api/demo/analyze`、`/api/demo/digest`、`/api/demo/dispose` | ✅ 已完成 |
| 9 | BFF 代理转发 AI 模型调用（OpenAI 兼容格式） | ✅ 已完成 |

### Desktop 应用（`apps/desktop/`）

| 序号 | 功能 | 状态 |
|------|------|------|
| 1 | Tauri 2 外壳 + Rust 后端 | ✅ 已完成 |
| 2 | SQLite 本地优先存储（账户、邮件、洞察） | ✅ 已完成 |
| 3 | IMAP 邮件同步（Tauri 命令：`query_feed`、`clear_all_data`） | ✅ 已完成 |
| 4 | 与 Web 共享的可复用 React UI（`packages/ui/`） | ✅ 已完成 |
| 5 | 深色/浅色主题 + 双语切换 | ✅ 已完成 |
| 6 | POP3 协议支持 | 🚧 进行中 |
| 7 | macOS Keychain / Windows Credential Manager 集成 | 🔲 待规划 |
| 8 | 构建与测试（桌面端专属） | ⚠️ 待最终验证 |

> ⚠️ **说明：** 桌面端的构建与打包步骤尚待最终验证。所有源代码均已就绪且功能正常，剩余工作为 Tauri 二进制文件的最终打包与验证。

## 后续规划

### Post-Hackathon 功能
- [ ] OAuth 授权支持（Gmail、Outlook）
- [ ] 附件 OCR
- [ ] 语义搜索（基于 Embedding）
- [ ] 自动回复草稿
- [ ] 日历集成
- [ ] RAG 邮件历史检索
- [ ] macOS Keychain / Windows Credential Manager 密钥管理（P1）
- [ ] POP3 完整支持

## 黑客松参赛信息

| 字段 | 内容 |
|------|------|
| **项目** | MailMind v0.3.1 |
| **赛道** | AI in Product |
| **模型** | Agnes 2.5 Flash（通过 AgnesCode 调用） |
| **构建时间** | AgnesCode Build Challenge 2026，8月20日–26日 |
| **演示视频** | [YouTube 未公开](https://youtu.be/bCos3H7ASMw) |
| **诊断文件** | 所有会话的 AgnesCode 诊断文件均可提供 |

本项目全程使用 **AgnesCode** 构建，底层模型为 **Agnes 2.5 Flash**。

### AgnesCode 使用情况

- **架构设计：** 迭代完善只读安全契约、共享包结构、威胁模型
- **代码生成：** IMAP 邮件同步、BFF API 路由、Zod Schema、React UI 组件、Tauri Rust 后端的完整实现
- **安全审计：** `verify-no-write-mail-commands.mjs` 脚本与 AGENTS.md 安全契约均通过 AgnesCode 会话生成和迭代
- **文档维护：** README、SECURITY.md、PRD 文档通过 AgnesCode 多会话工作流创建与维护

## 参与贡献

欢迎提交 Issue 和 Pull Request！请阅读我们的贡献指南。

## 许可

本项目采用 MIT 许可证 — 详见 [LICENSE](LICENSE) 文件。

## 致谢

- 为 AgnesCode Build Challenge 2026 构建
- 灵感源于对可信 AI 邮件工具的需求
- 安全设计参考 OWASP 指南

---

**免责声明：** MailMind 仅使用应用专用密码，从不在磁盘上存储任何凭证。所有邮件数据仅在本地或内存中处理。我们重视安全性，但本项目尚未经过专业安全审计，请自行判断使用。
