# MailMind - 待提交变更清单

## 需要提交的修改

### 1. Desktop Rust 改进 (8 文件)
- `apps/desktop/src-tauri/Cargo.toml` - 更新依赖版本，添加 dirs crate
- `apps/desktop/src-tauri/src/db/mod.rs` - 改进错误处理
- `apps/desktop/src-tauri/src/main.rs` - 完善命令注册
- 其他 Rust 源文件 - 编译修复

### 2. 构建配置 (4 文件)
- `packages/contracts/tsconfig.json` - 新增，用于编译输出
- `packages/i18n/tsconfig.json` - 新增
- `packages/ui/tsconfig.json` - 新增
- `apps/desktop/src-tauri/build.rs` - Tauri 构建脚本

### 3. 图标资源 (2 文件)
- `32x32.png` - 应用图标
- `icon.ico` - Windows 图标

### 4. 配置更新 (11 文件)
- `package.json` 系列 - 添加 build 脚本和导出配置
- `pnpm-lock.yaml` - 锁定文件更新

## 不需要提交的生成文件

### Build 输出 (gitignore)
- `packages/*/dist/` - TypeScript 编译产物
- `apps/desktop/src-tauri/target/` - Rust 编译产物
- `apps/web/tsconfig.tsbuildinfo` - TS 构建信息

### 自动生成
- `apps/desktop/src-tauri/Cargo.lock` - Cargo 自动管理
- `tsconfig.json` - 根目录临时配置
