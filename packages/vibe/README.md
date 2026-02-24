<div align="right">
<a href="./README.zh.md">简体中文</a> | <b>English</b>
</div>

# vibe

<p>
  <a href="https://www.npmjs.com/package/vibe-coding-cli">
    <img src="https://img.shields.io/npm/v/vibe-coding-cli.svg" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/vibe-coding-cli">
    <img src="https://img.shields.io/npm/dt/vibe-coding-cli.svg" alt="npm downloads">
  </a>
  <a href="https://github.com/helloggx/skill/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/helloggx/skill.svg" alt="license">
  </a>
</p>

> Design-Driven Agent Skills CLI for OpenCode

`vibe` 是一个专为 [OpenCode](https://opencode.ai) 设计的工具与技能管理 CLI，帮助开发者快速添加、更新和管理 AI 编码助手的扩展能力。

## ✨ 特性

- **一键安装** - 从 GitHub 仓库快速添加工具和技能
- **版本锁定** - 自动管理已安装工具的版本，确保一致性
- **批量更新** - 一条命令更新所有已安装的工具和标准技能
- **配置集成** - 自动将工具注入 OpenCode 配置文件

## 🚀 快速开始

```bash
# 安装
npm install -g vibe-coding-cli

# 添加工具包
vibe add helloggx/skill

# 查看已安装的工具
vibe list

# 更新所有工具
vibe update
```

## 📖 使用指南

### 添加工具

从 GitHub 仓库添加工具包：

```bash
# 使用 short repo 格式
vibe add helloggx/skill

# 使用完整 GitHub URL
vibe add https://github.com/helloggx/skill
```

### 查看已安装列表

```bash
vibe list
# 或
vibe ls
```

输出示例：

```
🛠️  Installed Tools (.opencode/tool):

  ◆ skill (helloggx/skill)

🪄  Installed Skills (Standard):
...
```

### 更新工具

更新所有已安装的工具和标准技能：

```bash
vibe update
# 或
vibe up
```

## 📋 命令参考

| 命令 | 说明 |
|------|------|
| `vibe add <repo>` | 添加工具包 (别名: `a`) |
| `vibe list` | 列出已安装的工具和技能 (别名: `ls`) |
| `vibe update` | 更新所有工具和技能 (别名: `up`) |
| `vibe --help` | 显示帮助信息 |

## ⚙️ 配置说明

### 目录结构

安装工具后，会在当前项目目录下创建以下结构：

```
your-project/
├── .opencode/
│   ├── vibe-lock.json      # 版本锁定文件
│   ├── opencode.jsonc      # OpenCode 配置文件
│   └── tool/               # 工具目录
│       ├── *.ts
│       └── *.py
```

### 环境变量

部分工具可能需要环境变量支持，请在 `.env` 文件中配置：

```bash
# MasterGo Personal Access Token
MG_MCP_TOKEN="your_token_here"
```

## 🛠️ 配套技能

`vibe` 与 [helloggx/skill](https://github.com/helloggx/skill) 配合使用可实现完整的 Design-to-Code 工作流：

| 技能 | 描述 |
|------|------|
| **vue-creater** | Vue 3 项目脚手架，支持从 MasterGo 同步设计令牌 |
| **component-creater** | 将 MasterGo 设计链接转换为生产级 Shadcn-Vue 组件 |
| **code-review-expert** | 资深工程师视角的代码审查 |
| **coding-standards** | TypeScript & Node.js 编码规范 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 查看 [LICENSE.md](./LICENSE.md) 了解更多。
