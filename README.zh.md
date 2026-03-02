<div align="right">
<b>简体中文</b> | <a href="./README.md">English</a>
</div>

# HelloGGX 的技能库 (HelloGGX's Skills)

一个精心策划的 [Agent Skills](https://opencode.ai) 集合，专为 **设计驱动开发 (Design-Driven Development)** 打造，聚焦于 **Vue 3**、**Shadcn UI**、**MasterGo** 集成以及高质量的工程标准。

> [!IMPORTANT]
> 这个集合旨在彻底改变“设计到代码”的工作流。它连接了 MasterGo 设计稿与生产级 Vue 应用，实现了项目脚手架搭建、设计 Token 同步以及组件生成的全自动化。

## 安装

将这些技能添加到你的 Agent 环境（如 OpenCode）中：
```bash
pnpx skills add helloggx/skill --skill='*'
```
or to install all of them globally:

```bash
pnpx skills add helloggx/skill --skill='*' -g
```

## 技能生态系统

本仓库分为两大类：用于加速开发的 **生成器 (Generators)** 和用于维护代码质量的 **专家 (Experts)**。

### 🚀 生成器 (设计到代码)

用于搭建项目并将设计稿转换为代码的自动化工作流。

| 技能 | 描述 | 技术栈 |
| --- | --- | --- |
| **vue-creater** | **项目脚手架。** 采用“CSS 优先”策略创建高保真的 Vue 3 应用。支持直接从 MasterGo DSL 同步设计 Token。 | Vite 8, Tailwind 4, Pinia, Vue Query |
| **component-creater** | **组件生成器。** 一个自主工作流，可将 MasterGo 设计链接转换为生产就绪的 Shadcn-Vue 组件。自动将样式映射为 Tailwind 工具类。 | Shadcn-Vue, TypeScript, Tailwind CSS |

### 🛡️ 专家 (质量保证)

最佳实践和审查标准，确保代码的长期可维护性与安全性。

| 技能 | 描述 | 关注领域 |
| --- | --- | --- |
| **code-review-expert** | 以高级工程师的视角执行结构化代码审查。检测 SOLID 违规、安全风险，并提出可落地的改进建议。 | SOLID, 安全性, 性能, 重构 |
| **coding-standards** | TypeScript 和 Node.js 的通用编码规范与模式。强制执行命名约定、不可变性和错误处理。 | 可读性, 类型安全, 整洁代码 |

## 工具 (Tools)

支撑上述技能的底层工具，也可直接调用。

| 工具 | 功能 |
| --- | --- |
| `shadcn_vue_init` | 初始化现代 Vue 3 技术栈 (Vite 8 + Tailwind 4)，并预配置 Shadcn UI 和 Pinia。 |
| `get_dsl` | 获取并解析 MasterGo 分享链接中的设计稿 DSL JSON 数据。 |
| `get_token` | 从 DSL 中提取设计 Token (颜色、排版)，并使用现代色彩空间 (OKLCH) 更新项目的 CSS 变量。 |

## 配置指南

为了充分利用 **设计到代码** 的特性（MasterGo 集成），你需要配置环境密钥。

### 1. 环境变量

创建 `.env` 文件或在 Agent 的配置中设置以下变量：

```bash
# MasterGo 个人访问令牌 (获取设计稿必须)
MG_MCP_TOKEN="your_mastergo_token_here"

# 默认设计 DSL 链接 (可选的快速访问预设)
TOKEN_URL_LIGHT="https://mastergo.com/goto/..."
TOKEN_URL_DARK="https://mastergo.com/goto/..."

```

### 2. Opencode 配置

确保你的 `opencode.jsonc` 启用了必要的权限, 我们的component-creater, 需要 `shadcnVue` mcp的能力：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "theme": "one-dark",
  "mcp": {
    "shadcnVue": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "shadcn-vue@latest", "mcp"],
    },
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
    },
  },
  "tools": {
    "shadcn_vue_init": true,
    "get_dsl": true,
    "get_token": true,
  },
  "permission": {
    "edit": "ask",
    "skill": {
      "*": "allow",
    },
  },
}
```

## 💡 最佳实践工作流 (Best Practice Workflows)

为了帮助你更高效地使用这些技能，我们将工作流拆分为四个核心场景：

### 场景一：从零构建全栈应用 (脚手架与设计同步)

**核心技能**: `vue-creater`

当开启一个新项目时，该技能会处理繁琐的配置（Vite, Tailwind, Shadcn, Pinia）并直接同步 MasterGo 的设计系统。

1. **初始化项目**
> **User:** "帮我创建一个名为 `crm-dashboard` 的 Vue 项目，并完成初始化配置。"
> **Agent:** 调用 `shadcn_vue_init`，设置项目结构、安装依赖、配置 Tailwind 4 和 CSS 变量。


2. **注入设计系统**
> **User:** "使用此 MasterGo 链接 [URL] 同步设计规范。" (或者 "使用默认的 Light 主题配置")
> **Agent:**
> 1. 调用 `get_dsl` 获取设计数据。
> 2. 调用 `get_token` 将颜色、圆角、排版等映射为 CSS 变量（支持 OKLCH 色域）。
---

### 场景二：组件驱动开发 (设计稿转代码)

**核心技能**: `component-creater`

将具体的 UI 组件设计稿（如卡片、表单、侧边栏）转换为代码。

1. **生成组件**
> **User:** "基于这个设计链接 [URL] 生成一个 `UserProfile` 组件。"
> **Agent:**
> 1. 解析 DSL 并识别其中的 Shadcn 组件（如 Button, Input）。
> 2. 自动安装缺少的 Shadcn 组件 (`npx shadcn-vue@latest add ...`)。
> 3. 编写 Vue 代码，自动将设计属性映射为 Tailwind 类名 (如 `bg-card`, `text-primary`)。
---

### 场景三：代码重构与规范 (提升代码质量)

**核心技能**: `coding-standards`

在编写复杂逻辑或重构旧代码时，确保代码符合 TypeScript 和 Node.js 的最佳实践。

1. **规范化重构**
> **User:** "重构 `src/utils/api.ts`，使其符合我们的编码规范。"
> **Agent:** 参考 `coding-standards`：
> * **命名检查**: 确保变量名具有描述性（如 `isUserAuthenticated` 而非 `flag`）。
> * **不可变性**: 使用扩展运算符 (`...user`) 而非直接修改对象。
> * **错误处理**: 确保异步操作包含 `try-catch` 和清晰的错误信息。

2. **新功能开发指导**
> **User:** "我想添加一个市场搜索功能，应该如何组织文件和类型？"
> **Agent:** 根据规范建议文件结构（`types/market.types.ts`, `hooks/useMarket.ts`）并提供类型安全的函数签名示例。
---

### 场景四：提交前审查 (安全与架构审计)

**核心技能**: `code-review-expert`

在合并代码或提交 PR 之前，进行深度技术审查。

1. **执行审查**
> **User:** "审查我当前暂存区的更改 (git staged changes)。"
> **Agent:** 扫描 `git diff` 并根据清单检查：
> * **SOLID 原则**: 检查是否有单一职责 (SRP) 或 开放封闭 (OCP) 的违规。
> * **安全性**: 扫描 XSS、注入风险、密钥泄露或不安全的 API 调用。
> * **代码异味**: 标记过长的函数、深层嵌套或魔法数字。

2. **输出报告**
> **Agent:** 生成一份包含 **P0 (高危)** 到 **P3 (低优)** 的分级报告，并询问是否需要自动修复。


## 许可证

MIT License © 2026 [HelloGGX](https://www.google.com/search?q=https://github.com/HelloGGX)

---

## 🛠️ 开发指南

面向贡献者和开发者：

- **[开发指南](./docs/development.md)** - 环境配置、测试和贡献指南
- **[网络问题排查](./packages/vibe/docs/network-troubleshooting.md)** - 解决连接问题

### 快速命令

```bash
# 安装依赖
bun install

# 运行所有测试
bun run test

# 类型检查
bun run typecheck

# 开发模式
bun run dev
```

### Git Hooks

本项目使用 Husky 管理 Git hooks：
- **pre-commit**: 每次提交前运行类型检查和测试
- **pre-push**: 推送前验证 Bun 版本并运行类型检查