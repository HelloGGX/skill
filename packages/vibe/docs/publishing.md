# 发布指南

## 发布前检查清单

在发布新版本之前，请确保完成以下步骤：

### 1. 代码质量检查

```bash
# 运行所有测试
bun run test

# 类型检查
bun run typecheck

# 确保所有测试通过
```

### 2. 构建验证

```bash
# 清理并重新构建
bun run build

# 测试构建产物
node dist/cli.js --help
node dist/cli.js list

# 确保没有模块缺失错误
```

### 3. 版本更新

更新 `package.json` 中的版本号：

```json
{
  "version": "1.0.x"  // 根据语义化版本规范更新
}
```

版本号规范：
- **补丁版本** (1.0.x): Bug 修复
- **次要版本** (1.x.0): 新功能，向后兼容
- **主要版本** (x.0.0): 破坏性变更

### 4. 更新 CHANGELOG

在 `CHANGELOG.md` 中记录变更：

```markdown
## [1.0.8] - 2026-03-02

### Fixed
- 修复构建时模块缺失的问题
- 优化依赖打包策略

### Added
- 添加 agents 选择功能
- 添加网络重试机制
```

### 5. 提交变更

```bash
git add .
git commit -m "chore: release v1.0.8"
git push
```

### 6. 发布到 npm

```bash
# 确保已登录 npm
npm whoami

# 如果未登录
npm login

# 发布
npm publish

# 或发布快照版本（用于测试）
bun run publish:snapshot
```

### 7. 创建 Git Tag

```bash
git tag v1.0.8
git push origin v1.0.8
```

### 8. 验证发布

```bash
# 全局安装最新版本
npm install -g @vibe-coder/cli@latest

# 验证版本
vibe --version

# 测试基本功能
vibe --help
vibe list
```

## 常见问题

### 发布失败：权限错误

确保你有发布权限：
```bash
npm owner ls @vibe-coder/cli
```

### 模块缺失错误

检查 `scripts/build.ts` 中的 `external` 配置：
```typescript
external: [
  "simple-git",
  "@clack/prompts",
  "picocolors",
  "jsonc-parser",
]
```

所有使用动态 require 或 UMD 格式的包都应该标记为 external。

### 构建产物过大

- 检查是否有不必要的依赖被打包
- 考虑启用 minify
- 使用 `bun build --analyze` 分析包大小

## 自动化发布（未来）

可以考虑使用 GitHub Actions 自动化发布流程：

```yaml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test
      - run: bun run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 回滚版本

如果发布的版本有问题：

```bash
# 废弃有问题的版本
npm deprecate @vibe-coder/cli@1.0.8 "This version has critical bugs, please upgrade"

# 发布修复版本
# 更新版本号为 1.0.9
npm publish
```

## 发布检查脚本

创建一个自动化检查脚本 `scripts/pre-publish.ts`：

```typescript
#!/usr/bin/env bun

import { $ } from "bun"

console.log("🔍 Running pre-publish checks...")

// 1. Run tests
console.log("\n1️⃣ Running tests...")
await $`bun run test`

// 2. Type check
console.log("\n2️⃣ Type checking...")
await $`bun run typecheck`

// 3. Build
console.log("\n3️⃣ Building...")
await $`bun run build`

// 4. Test build output
console.log("\n4️⃣ Testing build output...")
await $`node dist/cli.js --help`

console.log("\n✅ All checks passed! Ready to publish.")
```

使用：
```bash
bun run scripts/pre-publish.ts
```
