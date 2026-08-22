# MailMind Hackathon v0.1：4 天冲刺与发布计划

## 1. 总体策略

这不是“4 天做两个完整产品”，而是“48 小时交付一个可演示的可信闭环，再用 48 小时把它扩展成双端叙事”。因此，所有任务必须围绕同一条价值路径排列：**用户显式同意 → 只读连接演示邮箱 → 渐进出现邮件摘要流 → 得到半日处理建议 → 结束时可证明数据边界。**

Day 2 结束前只允许解决这条路径上的阻塞问题。Desktop 与 Web 必须共用 schema、fixture 和 UI，但完成度不必对称：Web 负责“低门槛、公开体验、零留存”，Desktop 负责“5 天 / 500 封、本机数据与持续使用”。任何需要登录、付费、第三方审批、全量邮件历史、附件 OCR、自动化发信的工作，一律排到赛后。

| 里程碑 | 截止 | 必须可演示 | 绝不允许缺失 |
|---|---|---|---|
| M0：工程与视觉骨架 | Day 1 结束 | 同一 fixture 在 Web / Desktop 都能渲染摘要流 | contracts、consent gate、基本 UI |
| M1：核心闭环 | Day 2 结束（48h） | Web 真实 IMAP + 模型 + SSE 摘要 + 半日简报 + 结束清除 | 只读边界、错误处理、真实模型结果 |
| M2：本地完整叙事 | Day 3 结束 | Desktop SQLite、5 天 / 500 封、处理状态、清除数据 | 不把 secret 写入 SQLite |
| M3：可评审发布 | Day 4 结束 | 公网 Demo、至少一个桌面平台构建、开源仓库、录屏与讲稿 | 演示稳定性、README、隐私说明、回退演示 |

## 2. Day 1：先让“假数据版双端”站起来

Day 1 的产物应是完全可点击的 Demo，而非半完成的协议客户端。上午先建立工作区、共享 schema、脱敏邮件 fixture 和基础设计 token；下午完成 landing、协议同意页、摘要瀑布流、邮件详情与简报面板，让 Web 和 Desktop 同时使用 fixture。晚上只完成 Web 的流式 mock 和 Desktop 的 command mock。此时用户尚未输入任何真实凭证，也不接入模型。

| 时段 | P0 交付物 | 验收方式 | 负责人建议 |
|---|---|---|---|
| 09:00–10:30 | pnpm workspace、CI skeleton、contracts、fixtures | `pnpm check` 通过；8–10 封 fixture 均可解析 | 全员 / 主开发 |
| 10:30–12:30 | 共享 `EmailCard`、Masonry Feed、筛选与详情页 | Web / Desktop 对相同 fixture 的卡片字段一致 | 前端 |
| 13:30–15:00 | Landing、协议 / 隐私 / 授权 gate、连接表单 | 未同意三项不得点击连接；范围文案正确 | 前端 / 产品 |
| 15:00–17:30 | Web `analyze` mock 流、progress UI、summary cards | 逐张卡出现，不等全部完成 | Web |
| 17:30–19:30 | Desktop Tauri mock command、SQLite migration 骨架 | Desktop 显示相同 feed，数据库无 secrets | Desktop |
| 20:00–21:00 | 统一走查、录一段 60 秒 fixture Demo | 可以无网络完成展示 | 全员 |

### Day 1 完成定义

1. `pnpm dev:web` 和 `pnpm dev:desktop` 能同时启动。
2. 每个端都能从 fixture 显示至少 8 张摘要卡、1 份半日简报和 1 个详情页。
3. 用户不勾选三项同意时，连接入口不能工作。
4. UI 已展示 5–10 封（Web）与 5 天 / 500 封（Desktop）限制，避免 Day 4 才补关键承诺。
5. 有一个 `fixtures/injection.eml`，显示“此邮件内容被视为不可信数据”的提示。

## 3. Day 2：完成 Web 真实闭环，先锁演示价值

Day 2 上午完成 IMAP only。不要先做 POP3；先用准备好的测试邮箱跑通 TLS、认证、列出最近 N 封、只读正文获取和 MIME 文本化。下午接入 OpenAI-compatible 模型、Zod 校验、半日简报。晚上部署可公网访问的 Node runtime，并使用真实测试邮箱做 3 次完整演练。POP3 仅在 IMAP Web 通过以后再用 60–90 分钟增加。

| 时段 | P0 交付物 | 验收方式 | 如果受阻的止损线 |
|---|---|---|---|
| 09:00–11:00 | Node IMAP adapter、TLS、入参 / 出站 host guard | 演示邮箱正确拉到最近 5–10 封；不改已读状态 | 11:00 未通：先用 fixture + 手工导出的 `.eml` 保底，并继续排障 |
| 11:00–12:30 | MIME 转文本、附件仅标记、SSE progress | 首卡在连接后 15 秒内返回 | 只取 5 封、将单封正文限为 4k 字符 |
| 13:30–15:30 | OpenAI-compatible gateway、EmailInsight schema、单封重试 | 真实模型输出通过结构校验；错误只影响单卡 | JSON 模式不兼容：改 JSON object + Zod 校验 |
| 15:30–16:30 | deterministic ranking 与 DigestReport | 能生成“上午 / 下午重点与建议” | 失败回退到规则汇总 |
| 16:30–18:00 | 会话清除、错误码、日志脱敏、security tests | 密码 / 正文不出现在日志；结束后页面清空 | 去除 raw detail，先保证摘要与清除 |
| 19:30–21:00 | Node runtime 部署、测试邮箱 E2E、录屏 | 公网完成 3 次成功演练 | 外网 TCP egress 不通：录制本地 Web Demo + 使用 fixture 公网展示 |

### Day 2 Gate：核心闭环验收

下面八项必须全部打勾，才可投入 Desktop 的深入功能：

- [ ] 落地页和协议 gate 正常。
- [ ] Web 能使用 IMAP 从测试邮箱只读拉到 5–10 封。
- [ ] 每封显示分类、优先级、一句话摘要和至多 3 条行动建议。
- [ ] 摘要卡逐张出现，单封失败不会使会话失败。
- [ ] 半日简报只基于已验证的 insight 生成。
- [ ] 无模型时有 fixture / 规则回退，不出现空白页。
- [ ] 点击结束体验后前端清空、网络连接关闭、服务端无可回取会话。
- [ ] 密码、API key、主题和邮件正文不被请求日志 / 错误日志记录。

## 4. Day 3：在 Desktop 完成“持续使用”叙事

Day 3 的工作不是重新实现 Web。优先复用已完成的 feed、card、detail 和 AI contract，把差异集中在 Rust：账号元数据、同步、SQLite、保留策略、产品内处理状态和一键清除。若 Desktop 的真实 IMAP 连接在中午仍未打通，保留 Desktop fixture 展示，主 Demo 仍由 Web 完成；不要为追求两端同时真实连接而危及 Web 的稳定性。

| 时段 | P0 / P1 交付物 | 验收方式 | 停止条件 |
|---|---|---|---|
| 09:00–11:00 | SQLite migration、repository、5 天 / 500 封保留算法 | 单测证明第 501 封被剔除；5 天外邮件被清理 | 不实现 FTS / 索引优化 |
| 11:00–13:00 | Rust IMAP adapter 与 `sync_account` command | 同一测试账号拉取并入库 | 13:00 不通：fixture / Web-export fallback |
| 14:00–15:30 | Feed 查询、详情、local triage state | “已处理 / 稍后看 / 忽略”仅影响本地 | 不回写 server flags |
| 15:30–16:30 | local digest、purge account / clear all | 运行后 DB 中无 email / insight / report | 保留 account 元数据仅在用户明确选择时 |
| 16:30–18:00 | Tauri capabilities 收紧、secret 不入 DB 检查 | `sqlite3` 字符串扫描找不到 test secret | P1 keychain 若未开始，不强插入 |
| 19:30–21:00 | P1 native keychain（可选）、桌面打包与演练 | macOS 或 Windows 至少一个平台可运行 | 20:30 未完成则 P0 “不保存凭证”方案冻结 |

## 5. Day 4：工程收尾、开源与评委叙事

Day 4 的第一优先级不是新增功能，而是让评委第一遍就成功看到价值。上午完成外部视角的审计：新浏览器、测试邮箱、模型 Key、弱网络、模型失败、错误密码。午后冻结功能，准备公开仓库、截图、录屏和 5 分钟讲述。晚间只修复 P0 阻塞缺陷，不再重构。

| 时段 | 交付物 | 验收方式 |
|---|---|---|
| 09:00–10:30 | Full E2E、负向测试、演示计时 | 5 分钟内完整走一遍；故障有回退 |
| 10:30–12:00 | README、架构图、隐私说明、威胁模型、LICENSE | 陌生开发者可在 15 分钟内理解与启动 fixture mode |
| 13:30–14:30 | 公网 Web、域名 / TLS、深链接检查 | 隐私页、体验页、错误页均可访问 |
| 14:30–15:30 | 至少一个平台的 Desktop release、SHA / 版本号 | 从干净账户安装并打开 |
| 15:30–17:00 | 录制 90 秒备份视频、准备测试邮箱数据重置脚本 | 现场网络或模型故障仍可播放完整价值闭环 |
| 17:00–18:00 | 5 分钟讲稿、Q&A、最终 tag / release | 团队成员可独立讲解同一故事 |
| 19:30–结束 | Buffer：仅 P0 bug fix | 不引入新库 / 新特性 |

## 6. 并行分工建议

以下表以 2–3 人小队为理想情况；若单人，请严格按 Day 1 → Day 2 → Day 3 顺序，不在相同时间并行启动多条高风险链路。

| 角色 | Day 1 | Day 2 | Day 3 | Day 4 |
|---|---|---|---|---|
| 产品 / 前端 | Landing、consent、shared feed 与详情 | Web stream UI、digest、错误态 | Desktop UI、triage、设置页 | demo、README、录屏 |
| Web / AI | contracts、fixtures、mock stream | IMAP、LLM、SSE、deploy、redaction | Web 稳定性与 POP3（可选） | E2E、线上修复 |
| Desktop / Rust | Tauri skeleton、DB migration | command / adapter mock、DB tests | sync、SQLite、purge、打包、Keychain P1 | release、安装验证 |

如果你单人开发，建议**放弃真实 POP3 和 Keychain P1**，先在 README 中写明路线图。并在 48 小时前完成“Web IMAP + LLM + Web 静态 Desktop mock”闭环；Day 3 再决定是否要将 Desktop mock 替换为真实 IMAP。评委更容易奖励可靠演示，而不是两个半成品。

## 7. 演示邮箱与模型准备

测试邮箱应提前创建，并使用非真实姓名、非真实客户、无附件敏感内容的 8–10 封测试邮件。内容要故意覆盖可解释的场景：客户询价及交期、会议改期、物流异常、发票提醒、营销邮件、普通系统通知和一封带提示注入文本的可疑邮件。每封预先人工写好“正确摘要 / 关键事实 / 建议行动”，作为模型结果验收 goldens。

| 样本 | 预期分类 | 预期优先级 | 可展示价值 |
|---|---|---:|---|
| 客户 500 件询价，周四前确认交期 | 订单/客户 | P1 | 提取数量、截止期、建议查库存 |
| 物流异常：港口延迟 48 小时 | 账单/物流 | P0 | 风险提示、建议通知客户 |
| 今日 15:00 会议改期 | 日程/会议 | P1 | 时间敏感、行动明确 |
| 发票到期提醒 | 账单/物流 | P1 | 金额 / 截止日提取 |
| 促销邮件 | 营销 | P3 | 证明过滤噪音能力 |
| 系统安全通知 | 通知 | P1 / P2 | 不误判为营销 |
| `Ignore previous instructions...` 邮件 | 其他 / 待人工复核 | P3 | 展示不可信内容隔离 |

模型 Key 准备两套：线上受限 Demo Key（有额度 / 限速 / 允许域名或 IP 限制时优先启用）和开发备用 Key。模型不可用时，使用 fixture mode 的确定性结果；UI 必须明确标识“演示数据模式”，不能把它伪装成真实模型调用。

## 8. 演示讲述结构（5 分钟）

开场 20 秒先陈述矛盾：邮件里同时有客户、物流、账单与噪音；人并不是缺少邮件列表，而是缺少可信的“下一步判断”。紧接 30 秒显示只读承诺、协议 gate 和 Web 零留存，建立处理敏感数据的信任。

中段 2 分钟连接演示邮箱，让摘要卡逐张出现，筛选 P0 / P1，打开物流异常邮件并将“摘要—关键事实—建议—原文摘录”串成一条可追溯链。随后 45 秒生成半日简报，说明 Agent 不是简单总结，而是将已经验证的单封结论二次编排为工作优先级。

最后 1 分钟切换 Desktop，展示本机 5 天 / 500 封边界、处理状态与一键清除。以“没有邮箱写权限、没有自动发信、模型没有任何外部工具”收尾，强调把 Agent 的能力限制在可信的理解和建议。最后 25 秒展示开源架构：一个 pnpm 仓库、同一 schema / prompt / UI、两种隐私模式。

## 9. 风险登记与回退决策

| 风险 | 预警信号 | 第一回退 | 最终回退 |
|---|---|---|---|
| Web 部署禁止 IMAP / POP3 egress | 公网环境连接超时但本地成功 | 换 Node container 托管 / 目标区域 | 公网展示 fixture；现场本地真实 Web Demo |
| 某邮箱只支持 OAuth | Basic auth 反复失败 | 换专用测试邮箱 / 应用专用密码 | 仅展示 `.eml` fixture 导入模式 |
| 模型不按 JSON 输出 | Zod 失败率高 | 一次修复重试、缩短输入 | fixture / 规则摘要模式 |
| 模型响应慢 | 首卡超过 15 秒 | 5 封、4k 字符、并发 2 | 预先处理的 fixture 流 |
| Desktop 打包阻塞 | Day 3 晚上仍无法出包 | 录制本地桌面演示 + source build guide | 以 Web 作为主交付，不承诺二进制 |
| Keychain 不兼容 | 不同 OS 返回错误 | P0 不保存 secret | 明确披露，不写入 SQLite |
| UI 瀑布流影响信息密度 | 评委找不到行动 | 默认按 priority 排序，增加列表切换 | 停留在单列 cards |

## 10. Release Checklist

### 体验与安全

- [ ] 体验前必须勾选用户协议、隐私说明和邮件数据处理授权。
- [ ] Web 仅支持 TLS / STARTTLS，不提供明文连接。
- [ ] 所有生产路径禁止发送、删除、移动、标记邮件。
- [ ] Web 结束体验后内存 UI 清空，服务端不能按 ID 回取邮件。
- [ ] SQLite、`.env`、日志和 Git 历史不含任何真实密码、API Key 或真实邮件。
- [ ] 提示注入样本不会获得任何工具权限；不存在发信工具。

### 工程与开源

- [ ] `pnpm install --frozen-lockfile && pnpm check` 通过。
- [ ] README 有 3 分钟 fixture 启动路径、真实邮箱风险提示、架构图、截图和路线图。
- [ ] `.env.example`、`.gitignore`、LICENSE、SECURITY.md、PRIVACY.md 完整。
- [ ] GitHub release / tag 已创建；Desktop 产物至少有一个可下载平台或清晰编译方式。
- [ ] 公开 Web link 已在无登录、无缓存的浏览器中验证。

### 演示韧性

- [ ] 测试邮箱可登录，邮件顺序和样本内容正确。
- [ ] 有演示模式开关、fixture 数据和 90 秒备份视频。
- [ ] 已在网络较差、错误密码、模型故障条件下演练过错误提示。
- [ ] 每位演示者都有 5 分钟版和 90 秒版讲稿。

## 11. 冻结原则

Day 2 之后只要新增功能不能直接提升“理解、判断、行动建议、隐私可信度、演示稳定性”五项之一，就不做。Day 3 晚上后不添加新依赖、不更换 LLM SDK、不换 CSS 系统、不迁移数据库、不接 OAuth。最终交付最有说服力的版本应当是一个小而完整、可解释、可恢复的产品，而不是一张宏大的路线图。
