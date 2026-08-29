# Read-only AI Email Triage Assistant · 只读 AI 邮件分诊助手

一个隐私优先的 AI 邮件助手，只读、总结、分类邮件，永不发送、删除或修改。专为 AgnesCode Build Challenge 2026 构建。

MailMind helps busy professionals quickly understand and prioritize their email without the risk of accidental sends, deletions, or modifications.

## 功能特性

- **只读设计**：永不发送、删除、移动或修改邮件
- **AI 分析**：自动总结、分类邮件并给出优先级建议
- **双语支持**：简体中文 / English
- **TLS 加密**：IMAP/POP3 连接强制加密
- **隐私保护**：密码仅在内存中流转，不落地存储

## 技术栈

- **前端**：Next.js 15 + React 19
- **桌面端**：Tauri 2 + Rust
- **语言**：TypeScript
- **验证**：Zod schemas
- **邮件**：IMAP/POP3 over TLS

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动 Web 应用
pnpm dev:web

# 或启动桌面应用
pnpm dev:desktop
```

## 安全扫描

```bash
pnpm test:security
```

## 项目状态

这是一个 4 天黑客松原型项目。核心功能（IMAP 连接、邮件分析）已在 Web 端实现，桌面端目前为 stub 状态。

## 许可证

MIT License
