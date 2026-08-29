# MailMind 开源项目评估报告

> 评估对象：https://github.com/GavinCnod/mail-mind-assistant
> 版本：v0.3.1（main @ d4a5210）｜评估时间：2026-08-29
> 评估方式：全量克隆 + 源码逐文件审计 + 线上实例实测 + 依赖库源码核对（imapflow 1.7.2 发布包）

---

## 一、一句话结论

**这是一个"叙事完成度远大于代码完成度"的项目。** 文档、架构图、安全声明、README 功能清单都做到了成熟项目的水准，但支撑这些声明的核心代码链路存在系统性缺陷——最严重的是：**真实邮件分析主链路根本跑不通，且被 `as any` + 可选调用 `?.()` 完全掩盖**。

作为 4 天黑客松原型，它的"壳"（i18n、contracts 包、设计系统、文档）相当不错；作为对外发布的作品集/开源项目，当前状态下**README 里的 ✅ 大部分不成立**，主动展示反而会伤害可信度。

---

## 二、项目概况

| 项目 | 值 |
|------|-----|
| 定位 | 只读 AI 邮件分诊助手（IMAP/POP3 + LLM 分析） |
| 技术栈 | pnpm 单仓库 / Next.js 15 / Tauri 2 + Rust / TypeScript / Zod / SQLite |
| 规模 | TS/TSX ≈ 5,670 行（Web 3,643 行）；Rust 891 行 |
| 许可证 | MIT |
| 创建时间 | 2026-08-22（至评估日仅 7 天） |
| 提交数 | **1**（全部工作压成单个 commit，无开发叙事） |
| Stars / Forks | 0 / 0 |
| CI | **无**（无 `.github/`，无工作流、无 PR 模板） |
| 测试文件 | **0 个**（无 vitest/jest，各包无 `test` 脚本） |
| 线上实例 | mail-mind-assistant-web.vercel.app（HTTP 200，可访问） |
| 仓库体积问题 | `diagnostics/` 目录 **115 MB**（13 个 zip），根目录 488 KB 的 `32x32.png` |

---

## 三、评分卡

| 维度 | 评分 | 说明 |
|------|------|------|
| 创意与定位 | ★★★★☆ | "只读"作为架构约束而非功能开关，切入角度好，有记忆点 |
| 文档与叙事 | ★★★★☆ | README/ARCHITECTURE/SECURITY/PRD 齐备，架构图规范 |
| 前端与设计 | ★★★☆☆ | Atelier Zero 编辑风、双语、深浅色，完成度高于平均黑客松水平 |
| 架构设计 | ★★★☆☆ | 共享 domain core + 薄宿主，分包边界清晰（*设计*层面） |
| 代码实现 | ★☆☆☆☆ | 主链路方法名全错且被静默吞掉；桌面端全为 stub |
| 安全实现 | ★☆☆☆☆ | 6 项公开安全声明中至少 4 项未落地，安全扫描脚本恒绿 |
| 工程质量 | ★☆☆☆☆ | 无测试、无 CI、仓库混入 115MB 垃圾、单提交 |
| 声明真实性 | ★☆☆☆☆ | README 功能表与代码实际状态存在系统性偏差 |
| **综合** | **2.4 / 5** | 骨架优秀，血肉缺失，且对外声明超卖了 3 倍以上 |

---

## 四、真实亮点（这些是站得住的）

1. **产品定位精准。** "Email is the most vulnerable interface between users and AI agents"——把"只读"上升为产品的第一性原理，而不是一个功能点。这个立意比绝大多数黑客松项目高。
2. **分包结构专业。** `contracts / i18n / ui / fixtures` 四包边界清晰，依赖规则明确（contracts 纯 TS、i18n 无框架依赖），这是正经 monorepo 的设计水平。
3. **Zod 契约写得完整。** `packages/contracts/src/schemas.ts` 283 行，从 `EmailInsight` 到 `StreamEvent` 判别联合都覆盖了——**质量很高，可惜几乎没被调用**（见 P1-1）。
4. **降级策略设计合理。** LLM 失败 → 确定性规则兜底 → 空状态提示，四层降级在 `triage-agent.ts` 里是认真写过的。
5. **文档密度高。** ARCHITECTURE 里写了 8 层防御纵深、数据流安全表、级联失败模型——思路是对的，只是代码没跟上。
6. **线上 Demo 可达且首屏正常**（实测 200，1.5s），演示模式能跑通。

---

## 五、P0 致命问题（必须立刻处理）

### P0-1｜真实 IMAP 主链路是死代码，核心功能从未跑通过

**这是全项目最严重的问题。**

`apps/web/lib/server/imap-client.ts` 调用的方法，在依赖库 imapflow **1.7.2**（项目 `package.json` 锁定 `^1.7.2`）里**根本不存在**。

我下载了 npm 上 imapflow 1.7.2 的实际发布包，枚举了其全部公开方法，逐一核对：

| 代码中的调用 | imapflow 1.7.2 实际方法 | 结果 |
|---|---|---|
| `(conn as any).openBox?.(mailbox, true)` | `mailboxOpen()` | ❌ 不存在 → `?.()` 直接短路，**邮箱从未被 SELECT** |
| `(conn as any).getMailboxes?.()` | `list()` | ❌ 不存在 → 返回 `[]`，邮箱列表恒空 |
| `(conn as any).fetch?.(uid, {...})` | `fetchOne()` / `fetchAll()` / `download()` | ❌ 不存在 → 返回 `undefined` → `Buffer.from('')` **邮件正文恒为空** |
| `(conn as any).tlsInfo?.()` | 无对应方法 | ❌ 不存在 → 恒返回 `{valid: true}`（见 P0-5） |
| `(conn as any).closeBox?.()` | `mailboxClose()` | ❌ 不存在 → 清理逻辑空转 |
| `search?.({})` | `search()` ✅ 存在 | 但见下方 |
| `logout()` | ✅ 存在 | 唯一正确的调用 |

**连带效应链（已核对 imapflow 源码）：**

```
openBox 不存在 → 邮箱未选中
   ↓
imapflow.search() 源码第 3484 行：if (!this.mailbox) return;  ← 静默返回 undefined，不抛错
   ↓
triage-agent: uids = await search?.({}) ?? [] → []
   ↓
再试 search?.('ALL') → 仍然是 []
   ↓
API 返回 error: LIMIT_REACHED「邮箱中没有找到邮件」
```

**这正好解释了仓库里 `FIX_ANALYSIS.md` 记录的症状**（"IMAP 连接测试成功 ✓，点击分析后无返回内容"）。但那份文档把根因误判为"搜索条件太严格"和"空结果处理"，作者改的是**空结果时的错误提示**，真因从未被找到——因为 `(conn as any).xxx?.()` 这套写法让 TypeScript 和运行时**双重沉默**：类型靠 `as any` 绕过（全项目 28 处），运行靠 `?.` 吞掉，再外层还有 `try/catch` 和 `?? []` 兜底。

**同一个 bug 还造成 TLS 校验失效（P0-5）。**

**修复：**
```ts
// 1. 删掉全部 as any 与 ?.，换成真实 API
await this.conn.mailboxOpen(mailbox, { readOnly: true });   // 注意：必须是对象
const list = await this.conn.list();
for await (const msg of this.conn.fetch('1:*', { envelope: true, source: true })) { ... }
await this.conn.mailboxClose();
```
> ⚠️ 顺带一个隐藏雷：原代码写的是 `openBox(mailbox, true)`。即使方法名对了，imapflow 的签名是 `mailboxOpen(path, options)`，内部取 `options.readOnly`。传布尔值 `true` → `true.readOnly === undefined` → 源码第 3128 行 `!options.readOnly ? 'SELECT' : 'EXAMINE'` 判定为 **SELECT（读写模式）**。也就是说，这个号称"只读"的项目，一旦改用正确方法名仍传 `true`，会以**读写模式**打开邮箱——**必须传 `{ readOnly: true }`**。

---

### P0-2｜安全扫描脚本正则失效，永远返回通过

`scripts/verify-no-write-mail-commands.mjs` 是项目对外宣传的核心安全凭证（README：`pnpm test:security`）。

第 34 行：
```js
if (/(?:^|\s|["'`;=])(?:${cmd})(?=[\s;"'`]|$)/i.test(line) && !line.includes('//'))
```

`${cmd}` 写在**正则字面量**里，不会被插值。实测：
```
regex source: (?:^|\s|["'`\;=])(?:)(?=[\s;"'`]|$)     ← ${cmd} 被当成字面字符
test 'conn.store(uid)': false
```
`(?:)` 是空分组，永远匹配成功——**无论代码里写了什么，这个脚本都打印 ✅**。

我直接运行了它：
```
🔍 MailMind Security Scan
✅ All checks passed! No prohibited commands found.
EXIT=0
```
（`pnpm check` = `typecheck && test && test:security`，其中两条是空操作，于是"全部检查通过"永远是绿的。）

**另外两个次级问题：**
- 扫描范围只覆盖 `apps/web/lib` 和 `packages`，**不包含 API 路由** `apps/web/app/api/` 和**整个 Rust 目录** —— 桌面端的协议实现完全不在扫描视野内。
- `/i` 大小写不敏感 + 只排除含 `//` 的行，若正则修好，正常代码里的 `delete`/`copy` 会被大量误报。

**修复：** 改用 `new RegExp(...)` 或 AST 级检查（禁止 `conn.store/append/copy/move/delete` 方法调用），并纳入 CI。

---

### P0-3｜线上接口无鉴权 + 可 SSRF（已实测确认）

我对生产实例做了**无害探测**（使用不存在的凭证、指向 127.0.0.1:1，未连接任何真实邮箱）：

```bash
curl -X POST https://mail-mind-assistant-web.vercel.app/api/demo/analyze \
  -d '{"consent":{...三个 true...},"connection":{"protocol":"imap","host":"127.0.0.1",
       "port":993,"encryption":"ssl","username":"probe@example.com"},"password":"probe",...}'
```
返回：
```
event: error
data: {"type":"error","code":"connect ECONNREFUSED 127.0.0.1:993", ...}
```

**确认三件事：**

1. **SSRF 成立**：服务器接受了 `host=127.0.0.1` 并真实发起了连接。`lib/server/ip-guard.ts` 里那个 SSRF 防护模块写得有模有样（私网/回环/链路本地/IPv6 ULA 全覆盖），但**全项目零调用**——我 grep 过，`isSafeHost` 只在自己的文件里出现。README 与 ARCHITECTURE 都把 "Host validation (SSRF protection)" 列为安全特性，实际是**死代码**。
2. **无任何鉴权/限流**：接口公开，任何人可调用，无 token、无 rate limit、无 origin 校验。
3. **同意门是纸糊的**：`consent` 只需客户端 POST 三个 `true`，服务端无任何校验（连 `policyVersion` 都不查）。README 称其为"Layer 1: Consent Gate → 显式用户授权"，实际是客户端自控。

**被滥用的后果（对部署者自己）：**
- 你的 Vercel 实例成为**免费 IMAP 代理 / 内网端口扫描器**
- 你的 `DEMO_LLM_API_KEY` 成为**免费 LLM 代理**（攻击者提供任意可达邮箱即可消耗你的 token 配额）
- 服务器日志会打印 `host/username`（`route.ts` 第 25–33 行），等于留存他人邮箱地址

**另外**，错误码直接把内部异常 `connect ECONNREFUSED 127.0.0.1:993` 塞进 `code` 字段，违反了 `errorCodeSchema` 定义的枚举，属信息泄露。

**修复：** 立即下线真实模式或加鉴权；所有 host 请求前调用 `isSafeHost` 并做 DNS 解析后校验；错误码走白名单映射；按 IP 限流。

---

### P0-4｜桌面端是空壳，README 声称"✅ Complete"

README 桌面端功能表声称：IMAP 同步 ✅、SQLite 本地存储 ✅、POP3 🚧、Keychain 🔲，并加了一句"**All source code is present and functional**"。

实际 `apps/desktop/src-tauri/src/`（891 行 Rust）内容：

| 文件 | 实际内容 |
|------|---------|
| `commands/email.rs` | `sync_emails()` 直接 `Ok(SyncResponse { synced_count: 0 })`，注释 `// TODO: Implement real IMAP/POP3 sync`；`query_feed()` 返回硬编码空 JSON；`get_insight()` 直接 `Ok(None)` |
| `mail/imap.rs` | `connect()` 直接 `Err("IMAP client requires real network connection")`；`fetch_emails()` 返回 `Ok(vec![])` |
| `mail/pop3.rs` | `connect()` 空实现返回 `Ok(())`；`list_messages()` 返回空数组；`fetch_message()` 返回 `Err("not implemented in demo")` |
| `secrets/mod.rs` | 只实现了 `MemorySecretStore`，无任何 Keychain/Credential Manager |

**即：桌面端连一封邮件都同步不了。** 而且 `secrets/mod.rs` 第 59–63 行有一段**在 Linux 下无法编译**的代码：

```rust
std::env::var("XDG_DATA_HOME")
    .ok()                                    // Result<String,_> → Option<String>
    .map(|p| PathBuf::from(p).join("mailmind"))  // Option<PathBuf>
    .or_else(|_| std::env::var("HOME").map(|h| ...))  // ❌ 闭包返回 Result，应为 Option
```
`Option::or_else` 要求闭包返回 `Option<T>`，这里返回了 `Result<PathBuf, VarError>` → 类型不匹配（E0308）。Windows/macOS 分支被 `cfg` 排除不编译，所以只在 Linux 暴露——这大概就是 README 里"pending final verification"的真实含义。

**修复：** 诚实标注状态。把桌面端功能表的 3 个 ✅ 改为 🔲，删掉"source code is present and functional"这句——这是评估者最先核对、也最容易翻车的一句话。

---

### P0-5｜TLS 证书校验形同虚设

`imap-client.ts` 的 `getCertificateInfo()`：
```ts
const info = await (this.conn as any).tlsInfo?.() ?? {};
return { valid: !info?.rejected, ... };
```
`tlsInfo` 在 imapflow 中不存在 → `?.()` 短路返回 `undefined` → `?? {}` → `{}` → `valid = !undefined = **true**`。

**所以"正在验证安全证书"这一步永远通过，即使连接根本没有加密。** `triage-agent.ts` 第 92–96 行依赖它做 `TLS_FAILED` 判定，等于零。README 声称 "Encryption required - Only TLS/STARTTLS connections are permitted"，实际校验逻辑是一个恒真表达式。

（真正的 TLS 强制来自 imapflow 的 `secure: true` 与默认 STARTTLS 行为，所以 IMAP 路径**碰巧**还是加密的；但 POP3 路径不同，见 P1-2。）

---

### P0-6｜中文邮件内容被清洗成空白

`sanitize-html.ts` 第 47 行：
```ts
.replace(/[^\x20-\x7E\n]/g, ' ')   // 把 ASCII 可打印范围外的所有字符替换为空格
```
这会把**所有中文、日文、韩文、emoji、全角标点**全部变成空格。

对一个：① 主打简体中文界面、② system prompt 强制要求中文输出、③ 目标用户是中文用户的产品来说，这是致命的——`sanitizedExcerpt` 同时是**喂给 LLM 的输入**和**展示给用户的正文**，中文邮件进去就是一片空白，LLM 只能对着空格生成摘要。

讽刺的是 `mime-parser.ts` 里的中文 fallback 文案（`'(无主题)'`、`'(解析失败)'`）说明作者确实是中文语境开发，但显然只用了英文样本测试。

**修复：** 白名单改黑名单，只剔除控制字符：`/[^\P{Cc}\n]/gu` 或 `/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g`。

---

## 六、P1 严重问题

| # | 问题 | 证据 | 影响 |
|---|------|------|------|
| P1-1 | **Zod schema 写了但完全没接线** | 全项目 `analyzeRequestSchema` / `emailInsightSchema` / `digestRequestSchema` **零调用**；API 直接 `await request.json()` 后手动取字段；LLM 输出用裸 `JSON.parse(raw)`（`triage-agent.ts:226`）后 `as any` 塞进响应 | ARCHITECTURE 宣称的 "Layer 2 输入校验 / Layer 6 输出校验" 两层都不存在；模型返回任意结构都会被渲染 |
| P1-2 | **POP3 在 starttls 模式下明文传输密码** | `pop3-client.ts:30-32`：`secure = encryption === 'ssl'`，选 starttls 时走 `net.createConnection()` 明文 socket，随后 `socket.write('PASS ${password}')`。自研客户端**完全没有实现 STARTTLS 升级** | README 声称"两种协议均强制 TLS 加密"，POP3 + starttls 组合下邮箱密码以明文上网 |
| P1-3 | **Digest 接口返回硬编码假数据** | `api/demo/digest/route.ts`：整个 `mockDigest` 是写死的字符串（"处理物流异常，通知客户"），注释自称 placeholder | README 功能表列为 "✅ Complete"，实际与用户输入无关，展示时会穿帮 |
| P1-4 | **Dispose 接口是空操作** | `api/demo/dispose/route.ts` 29 行，注释写着"真实实现里我们会…"，然后直接 `return { success: true }` | "Verified disposal paths" 是架构文档第 8 层防御，实际什么都没清理 |
| P1-5 | **零测试、零 CI** | 无任何测试文件；`packages/*` 与 `apps/*` 均无 `test` 脚本；无 `.github/` | `pnpm check` 里的 `test` 是空操作，改动无法回归验证 |
| P1-6 | **提示注入检测可被 trivially 绕过** | 7 条正则（`/ignore\s+(all\s+)?instructions/i` 等），中文只覆盖 3 条 | 换个说法（"请忽略上述系统要求"）即可绕过；且 `/system\s+prompt/i` 会让正常讨论误报 |
| P1-7 | **凭证信任模型未说清** | 用户把邮箱应用专用密码 POST 到公开 Vercel 实例；服务端再把邮件正文发给第三方 LLM | README "Passwords exist only in memory" 技术上成立，但没告诉用户"密码会经过我部署的第三方服务器"。对一个主打隐私的产品，这是最关键的一句话，不能省 |
| P1-8 | **日志噪音** | 44 处 `console.log`，其中 `analyze/route.ts` 连续打印 3 段请求详情；`triage-agent.ts` 打印完整邮箱列表 | 调试痕迹未清理，生产环境泄露用户邮箱地址等元数据 |

---

## 七、P2 工程卫生

| 问题 | 说明 |
|------|------|
| **115 MB 诊断包入库** | `diagnostics/` 13 个 `agnes-diagnostics-*.zip`（115 MB）——AI 编程工具的会话日志，与项目无关，且名称泄露了开发工具链细节 |
| **根目录散落临时文件** | `$null`（PowerShell 重定向失误产生的文件，内容是报错文本）、`upload_63b73e12-*.jpg`、`icon.ico`（**0 字节**）、`32x32.png`（488 KB 放在根目录）、`tsconfig.tsbuildinfo`（构建产物） |
| **`.gitignore` 是抄的库模板** | 含 `*.js`（会忽略**所有** JS 源文件）、`*.d.ts`、`dist/`、`build/`——这不是应用项目的 .gitignore，长期会静默漏提交文件 |
| **AI 会话文档入库** | `AGENTS.md`、`MEMORY.md`（内含"Git lock 文件处理教训"等与项目无关的会话心得）、`FIX_ANALYSIS.md`、`IMPLEMENTATION_PLAN.md` 全部推到仓库根目录，且 README 还链接了 `AGENTS.md` |
| **单提交** | 7 天工作压成 1 个 commit，无开发过程、无 issue、无 PR 记录。黑客松评审常看 commit 密度来判断真实投入 |
| **根目录 ad-hoc 脚本** | `cleanup.py`、`read_docs.py`、`version.py`、`create_dirs.js`、`start-server.ps1`、`run-server.ps1`、`watch-logs.ps1` —— 会话产物 |
| **版本号不一致** | root `0.3.1` / web `0.3.2` / desktop `0.3.1` / ui `0.3.2` |
| **仓库 description 为空** | GitHub API 返回 `"description": null`，影响搜索与分享卡片 |
| **`.env.example` 埋雷** | 含 `NEXT_PUBLIC_LLM_API_KEY=`——Next.js 中 `NEXT_PUBLIC_` 前缀的变量会**打包进浏览器**。若有人照模板填，API Key 直接公开 |

---

## 八、定位与竞争性评估

**赛道判断：** AI 邮件助手是 2024–2026 最拥挤的赛道之一（Superhuman、Shortwave、Missive、Fyxer、SaneBox，以及 Gmail/Outlook 原生 AI）。MailMind 的差异化**不在功能**——IMAP + LLM 摘要是 Commodity；**在"只读"这个信任契约上**，这一步走对了。

**但这个差异化的前提是：只读必须被证明，而不是被声明。** 当前项目恰恰在最需要"证明"的地方失守：
- 安全扫描脚本恒绿（P0-2）
- SSRF 防护未接线（P0-3）
- TLS 校验恒真（P0-5）
- 一旦修对方法名反而会以 SELECT（读写）模式打开邮箱（P0-1 附注）

评审只要花 10 分钟读 `imap-client.ts`，就会发现"只读"这个核心卖点没有一行代码在真正保证它。**这比"功能少"严重得多——它动摇的是项目的立身之本。**

**可行的差异化加固方向（按性价比排序）：**
1. **把只读做成可验证的**：提供一条命令，输出协议级证据（"本次会话发出的全部 IMAP 命令日志：SELECT(EXAMINE) / FETCH / LOGOUT，无 STORE/APPEND/COPY/EXPUNGE"）。这是竞品做不到、而你能一句话讲清的东西。
2. **放弃 Web 端的真实邮件模式**，只保留 Demo 模式 + 主推桌面端本地运行。Web 端让用户把邮箱密码交给一个公开 Vercel 实例，在隐私叙事下是自相矛盾的；而本地运行天然强化了"数据不出设备"。
3. **聚焦一个垂类场景**（如外贸 B2B 询盘分诊——`customer_order / logistics / billing` 这套分类体系本就是按外贸场景设计的），做成"给外贸业务员的只读收件箱"，比通用邮件助手更容易活下来。

---

## 九、修复路线

### 第一阶段：保命（24 小时内，止血 + 诚信）

| 动作 | 工作量 |
|------|--------|
| 线上实例关闭真实邮件模式（或加鉴权 + 限流 + `isSafeHost` 接线） | 1h |
| README 桌面端功能表 3 个 ✅ 改 🔲，删除 "source code is present and functional" | 10min |
| 修复 `sanitizeContent` 的 ASCII 过滤（P0-6） | 15min |
| 修好安全扫描脚本正则，改为 `new RegExp` 或 AST 检查，纳入 CI | 1h |
| 清理仓库：删 `diagnostics/`（115MB）、`$null`、`icon.ico`、`upload_*.jpg`、根目录 py/js/ps1 脚本、`tsbuildinfo`；重写 `.gitignore` | 30min |
| 从 `.env.example` 删除 `NEXT_PUBLIC_LLM_API_KEY` | 5min |

### 第二阶段：兑现核心功能（1 周）

| 动作 | 工作量 |
|------|--------|
| 重写 `imap-client.ts`：去掉全部 `as any` 与 `?.`，改用 `mailboxOpen(path, {readOnly:true})` / `list()` / `fetch()` / `mailboxClose()` | 3h |
| 修复 TLS 校验（改用 imapflow 真实的 socket 信息 `client.socket.getPeerCertificate()` 或连接前校验） | 1h |
| 端到端验证：真实邮箱 → 中英文各 5 封 → 确认双向都能出摘要 | 1h |
| POP3 补 STARTTLS，或暂时禁用非 SSL 选项 | 2h |
| 把 Zod 接到 API 边界（请求体 + LLM 输出双向校验） | 3h |
| 修 Rust `secrets/mod.rs` 的 `or_else` 编译错误 | 15min |

### 第三阶段：补齐可信度（2 周）

| 动作 | 工作量 |
|------|--------|
| 补测试：imap-client 的协议调用、sanitize 的中英文用例、Zod 校验（vitest + CI） | 1 天 |
| Digest 接真实 LLM；Dispose 实现真实清理或删除该接口 | 0.5 天 |
| 提交历史重建：按功能拆成 15–25 个语义化 commit | 0.5 天 |
| 补充"只读"的可验证证据（协议命令日志导出） | 1 天 |
| 桌面端二选一：要么实现真实 IMAP 同步（2–3 天），要么从 README 主叙事里拿掉 | — |

---

## 十、最终判断

| 场景 | 结论 |
|------|------|
| **作为黑客松原型** | 合格偏上。定位、设计、文档都超过平均线，4 天内搭出双端 monorepo 骨架已是相当高的效率 |
| **作为开源作品 / 求职作品集（当前状态）** | **不建议公开**。评审只要读 200 行 `imap-client.ts` 就能击穿全部安全声明，风险远大于收益 |
| **修复第一阶段后** | 可以公开——把叙事收缩到"一个只读邮件助手的设计与原型"，并诚实标注未实现部分 |
| **修复第一 + 二阶段后** | 有真实竞争力，"只读"契约能讲成一个可信的故事 |

> **最该改的一句话**：README 里 "All source code is present and functional"。
> 它是这个项目唯一一处把"未完成"直接说成"已完成"的地方，也是评估者核对成本最低、翻车代价最高的一处。

---

## 附：证据索引

| 结论 | 文件:行 |
|------|---------|
| imapflow 无 openBox/getMailboxes/closeBox/tlsInfo/fetch | npm 包 imapflow@1.7.2 `lib/imap-flow.js` 方法枚举 |
| imapflow mailboxOpen 的 options 必须是对象 | `lib/imap-flow.js:3070` + `lib/commands/select.js:3128`（`!options.readOnly ? 'SELECT' : 'EXAMINE'`） |
| search 无邮箱时静默返回 undefined | `lib/imap-flow.js:3484` `if (!this.mailbox) return;` |
| 安全扫描正则失效 | `scripts/verify-no-write-mail-commands.mjs:34`（实测 `re.source` 为 `(?:)`） |
| isSafeHost 零调用 | 全项目 grep，仅命中 `apps/web/lib/server/ip-guard.ts` 自身 |
| 线上 SSRF 实测 | POST `https://mail-mind-assistant-web.vercel.app/api/demo/analyze` → `connect ECONNREFUSED 127.0.0.1:993` |
| 中文被清洗 | `apps/web/lib/server/sanitize-html.ts:47` |
| 桌面端 stub | `apps/desktop/src-tauri/src/commands/email.rs`、`mail/imap.rs:18`、`mail/pop3.rs:25` |
| Rust Linux 编译错误 | `apps/desktop/src-tauri/src/secrets/mod.rs:59-63` |
| Zod 未使用 | 全项目 grep `analyzeRequestSchema`/`emailInsightSchema` → 0 命中 |
| LLM 输出无校验 | `apps/web/lib/server/triage-agent.ts:226` `JSON.parse(raw)` |
| POP3 明文 | `apps/web/lib/server/pop3-client.ts:30-32, 59` |
| Digest 硬编码 | `apps/web/app/api/demo/digest/route.ts:36-58` |
| Dispose 空实现 | `apps/web/app/api/demo/dispose/route.ts:11-21` |
| TLS 校验恒真 | `apps/web/lib/server/imap-client.ts:168-179` |
