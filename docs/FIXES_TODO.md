## Day 4 遗留问题修复计划

### 问题清单

| # | 问题 | 优先级 | 影响 |
|---|------|--------|------|
| 1 | `main.rs` 命令未注册 | P0 | Tauri IPC 无法调用后端 |
| 2 | `AppState` 未初始化 SQLite | P0 | 数据库操作全部失败 |
| 3 | `query_feed` 返回空数组 | P0 | Feed 组件无数据展示 |
| 4 | App.tsx 类型不匹配 | P1 | TypeScript 警告，运行时可能崩溃 |
| 5 | Keychain stub 未完成 | P2 | 凭证持久化缺失（可接受） |

### 修改计划

#### 修复 1: main.rs - 注册所有命令
```rust
// 当前: 命令列表为空
// 修复: 导入并注册 auth, email, triage, digest, data 模块命令
```

#### 修复 2: lib.rs - 初始化 SQLite
```rust
// 当前: db 字段为 None
// 修复: 在 Builder::new() 后初始化数据库连接
```

#### 修复 3: commands/email.rs - 实现 query_feed
```rust
// 当前: 返回固定空 JSON
// 修复: 查询 SQLite emails 表，返回分页结果
```

#### 修复 4: App.tsx - 类型修正
```typescript
// 当前: any 类型过多
// 修复: 使用 contracts 包中的正确类型
```

### 执行顺序
1. 修复 lib.rs (初始化 DB)
2. 修复 main.rs (注册命令)
3. 修复 email.rs (实现 query_feed)
4. 修复 App.tsx (类型修正)
5. 运行 typecheck 验证
