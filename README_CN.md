# MailMind

> 您的只读 AI 邮件分诊助手

MailMind 帮助繁忙的专业人士快速理解并优先处理邮件，同时确保不会误发、误删或修改任何邮件。

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

编辑 `.env.local`：
```env
DEMO_LLM_BASE_URL=https://api.openai.com/v1
DEMO_LLM_API_KEY=sk-您的API密钥
DEMO_LLM_MODEL=gpt-4o-mini
```

### 支持的中文邮箱服务商

| 服务商 | IMAP 主机 | IMAP 端口 (SSL) |
|--------|-----------|-----------------|
| QQ 邮箱 | imap.qq.com | 993 |
| 163 邮箱 | imap.163.com | 993 |
| 新浪邮箱 | imap.sina.cn | 993 |
| Gmail | imap.gmail.com | 993 |
| Outlook | outlook.office365.com | 993 |

> 请注意：QQ/163 等国内邮箱需先开启 IMAP 服务，并生成**应用专用密码**（非登录密码）。

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

## 参与贡献

欢迎提交 Issue 和 Pull Request！请阅读我们的贡献指南。

## 许可

本项目采用 MIT 许可证 — 详见 [LICENSE](LICENSE) 文件。

## 致谢

- 为黑客松挑战构建
- 灵感源于对可信 AI 邮件工具的需求
- 安全设计参考 OWASP 指南

---

**免责声明：** 本项目为演示性质。虽然我们重视安全性，但尚未经过专业安全审计。使用时请谨慎，始终优先使用应用专用密码而非主密码。
