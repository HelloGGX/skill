# 开发指南

## 快速开始

### 安装依赖

```bash
bun install
```

### 开发命令

```bash
# 运行开发模式
bun run dev

# 运行所有包的测试
bun run test

# 运行类型检查
bun run typecheck
```

## Git Hooks

项目使用 Husky 管理 Git hooks，确保代码质量。

### Pre-commit Hook

在每次 commit 之前，会自动执行：

1. **类型检查** (`bun turbo typecheck`)
   - 检查所有包的 TypeScript 类型错误
   
2. **测试** (`bun turbo test`)
   - 运行所有包的单元测试
   - 确保所有测试通过

如果任何检查失败，commit 将被阻止。

### Pre-push Hook

在每次 push 之前，会自动执行：

1. **Bun 版本检查**
   - 确保使用正确的 Bun 版本
   
2. **类型检查**
   - 再次确保类型正确

### 跳过 Hooks（不推荐）

如果在特殊情况下需要跳过 hooks：

```bash
# 跳过 pre-commit hook
git commit --no-verify -m "message"

# 跳过 pre-push hook
git push --no-verify
```

> ⚠️ 警告：跳过 hooks 可能导致代码质量问题，仅在紧急情况下使用。

## 测试

### 运行所有测试

```bash
bun run test
```

### 运行特定包的测试

```bash
cd packages/vibe
bun test
```

### 运行特定测试文件

```bash
cd packages/vibe
bun test git.test.ts
```

### 监听模式（开发时使用）

```bash
cd packages/vibe
bun test --watch
```

## 类型检查

### 检查所有包

```bash
bun run typecheck
```

### 检查特定包

```bash
cd packages/vibe
bun run typecheck
```

## 构建

```bash
cd packages/vibe
bun run build
```

## 发布流程

1. 确保所有测试通过
   ```bash
   bun run test
   ```

2. 确保类型检查通过
   ```bash
   bun run typecheck
   ```

3. 更新版本号
   ```bash
   cd packages/vibe
   # 编辑 package.json 中的 version
   ```

4. 构建
   ```bash
   bun run build
   ```

5. 提交并推送
   ```bash
   git add .
   git commit -m "chore: release v1.x.x"
   git push
   ```

6. 发布到 npm
   ```bash
   cd packages/vibe
   npm publish
   ```

## 故障排查

### Husky hooks 不工作

如果 Git hooks 没有执行，尝试重新安装：

```bash
bun run prepare
```

### 测试失败

1. 确保依赖已安装：
   ```bash
   bun install
   ```

2. 清理缓存：
   ```bash
   rm -rf node_modules
   rm -rf packages/*/node_modules
   bun install
   ```

3. 检查 Bun 版本：
   ```bash
   bun --version
   # 应该是 1.3.9 或兼容版本
   ```

### 类型检查失败

1. 确保 TypeScript 版本正确
2. 删除 `node_modules` 并重新安装
3. 检查 `tsconfig.json` 配置

## 代码规范

- 使用 Prettier 格式化代码
- 遵循 TypeScript 最佳实践
- 编写测试覆盖新功能
- 提交前确保所有检查通过

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### Commit 消息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响代码运行）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

示例：
```bash
git commit -m "feat: add retry mechanism for git clone"
git commit -m "fix: resolve network timeout issue"
git commit -m "docs: update network troubleshooting guide"
```
