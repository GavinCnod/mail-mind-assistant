# Agents.md — MailMind Agent 行为规范

## 1. 项目定位

MailMind 是一个 **只读的 AI 邮件分诊助手**（Read-only AI Email Triage Agent）。

核心价值：**理解、判断、建议——不发送、不修改、不留存。**

## 2. Agent 权限边界（Safety Contract）

| 能力 | 状态 | 说明 |
|------|------|------|
| 读取邮件 | ✅ 允许 | IMAP `EXAMINE` / POP3 `LIST`，只读操作 |
| 分析邮件内容 | ✅ 允许 | LLM 调用，输出结构化摘要与行动建议 |
| 发送邮件 | ❌ **绝对禁止** | 无任何 compose/send 能力 |
| 删除/移动/标记邮件 | ❌ **绝对禁止** | 无 DELE, STORE, MOVE, COPY 操作 |
| 访问外部文件系统 | ❌ 禁止 | 仅允许读取项目源码目录 |
| 执行 shell 命令 | ❌ 禁止 | 不允许 system()、exec()、spawn() |
| 写入 SQLite | ⚠️ 仅 Desktop 端 | Web 端零持久化；Desktop 仅用户设备本地 |
| 存储密码/密钥 | ❌ 禁止 | 仅在内存中流转，从不落盘或记录日志 |

### 允许的 IMAP 命令白名单

```
CAPABILITY  STARTTLS  AUTHENTICATE  LOGIN
EXAMINE     SELECT(readOnly)  SEARCH  FETCH  UID FETCH  LOGOUT
```

### 允许的 POP3 命令白名单

```
CAPA  STLS  USER  PASS  AUTH  STAT  LIST  UIDL  TOP  RETR  NOOP  RSET  QUIT
```

### 严格禁止的命令

```
IMAP:  STORE, APPEND, COPY, EXPUNGE, DELETE
POP3:  DELE
```

## 3. 推荐开发流程

遵循以下顺序以避免引入安全风险：

```
1. pnpm check          # 全量检查（lint + typecheck + security scan）
2. 修改 contracts      # 先改类型 → 再改 schema → 最后更新代码
3. 修改 UI 组件       # 在 packages/ui 中实现，两端共享
4. 本地预览           # pnpm dev:web 验证效果
5. 运行安全扫描        # pnpm test:security
6. 提交前复查         # git diff 确认无硬编码密钥
```

## 4. 禁止事项（Red Lines）

任何 commit 不得包含以下内容，否则安全扫描将阻断构建：

- ❌ 在日志、错误消息或 console 输出中打印密码、API Key、Token
- ❌ 添加任何形式的邮件写入操作（含测试代码）
- ❌ 绕过 ConsentGate 直接访问邮件数据
- ❌ 超出 5 天 / 500 封的留存策略（Desktop 端）
- ❌ 使用 plaintext / unencrypted 邮件连接
- ❌ 在 `dangerouslySetInnerHTML` 中渲染原始邮件内容
- ❌ 提交 `.env.local` 或包含真实凭证的文件

## 5. 提示注入防御

邮件内容是 **不可信数据**。处理规则：

1. 邮件原文与系统提示词 **严格隔离**（使用 XML 标签包裹）
2. 对常见注入模式进行关键词检测并标记 `needsHumanReview: true`
3. 模型输出必须通过 Zod schema 校验，校验失败则拒绝渲染
4. HTML 正文统一转文本，禁用 HTML 渲染能力

```typescript
// 示例：邮件内容与指令分离
const systemPrompt = `<INSTRUCTIONS>
你是一个只读邮件分诊助手。你的任务是总结邮件并给出优先级建议。
</INSTRUCTIONS>

<EMAIL_CONTENT>
${sanitizedEmailText}
</EMAIL_CONTENT>
`;
```

## 6. 紧急响应

如发现安全漏洞，立即：

1. **停止**：暂停相关功能开发
2. **记录**：写入 `docs/SECURITY.md` 已知问题列表
3. **通知**：报告给 `security@mailmind.app`
4. **修复**：不单独提交，附带回归测试一并修复

---

*本文件是 MailMind 安全契约的一部分，所有贡献者须阅读并遵守。*
