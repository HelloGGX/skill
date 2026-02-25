<div align="center">

# 🌊 Vibe Coding CLI

**专为 OpenCode 打造的 vibe coding 生态构建工具**

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](./package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)
[![Built with Bun](https://img.shields.io/badge/Bun-%23000000.svg?logo=bun&logoColor=white)](https://bun.sh)

[English](./README.md) · **简体中文**

</div>

## 📖 简介 (Introduction)

`vibe-coding-cli` 是一个专为 **OpenCode** 平台打造的现代命令行脚手架工具。它的核心目标是快速搭建 Vibe Coding 的开发环境，简化规范驱动开发的资源管理。

通过 `vibe` 命令，你可以一键拉取远程 GitHub 仓库中的 TypeScript/Python 工具脚本或 Markdown 规则文件，自动将其无缝注册到 OpenCode 配置中，并接管其底层的运行依赖环境，让你专注于“与 AI 共创代码”本身。

## ✨ 核心特性 (Features)

- 🛠 **全自动化工具管理**: 支持从任意 GitHub 仓库快速解析、选择并下载 `.ts` / `.py` 脚本至本地 `.opencode/tool/` 目录，开箱即用。
- 📜 **集成 Vibe Coding 所需的一切**: 独创的生态聚合能力，将 Agent 执行所需的 **Capabilities（工具与技能）** 与 **Context（行为准则与最佳实践）** 完美融合。支持按需安装 `.md` 规则文件，让 AI 真正懂你的架构意图与代码规范。
- 📦 **智能配置注入**: 自动拦截并更新 `.opencode/opencode.jsonc`，无感注入工具的启用开关与 Prompt 指令（instructions）路径，彻底告别繁琐的手动配置。
- ⚡ **并行极速更新**: 基于并发模型设计，同时处理多个源仓库的资源对比与拉取，大幅缩短多依赖场景下的更新等待时间。
- 🪄 **标准技能聚合**: 与 Vercel 的 `pnpx skills` 生态深度集成，在统一的 CLI 流程中同时管理标准 Agent 技能库和本地化扩展资源。

---

## 🚀 快速开始 (Quick Start)

### 安装

作为全局包安装（推荐使用 npm 或 bun）：

```bash
# 使用 npm
npm install -g vibe-coding-cli

# 使用 bun
bun add -g vibe-coding-cli
```

### 基础用法

初始化并添加一个生态库（例如本项目的 `helloggx/skill`）：

```bash
vibe add helloggx/skill
```

*此命令将会弹出交互式菜单，允许你灵活多选想要安装的 **Tools (工具)** 和 **Rules (规则)**，CLI 将会自动为你完成所有环境的配置。*

---

## 📚 命令指南 (Commands)

### 1. 添加资源 (`add` / `a`)

```bash
vibe add <repository>
```

**执行流程**:

1. 调用原生能力，安装目标仓库中的基础 Agent 技能。
2. 克隆并解析目标仓库中的 `skill`、`tool` 和 `rules` 资产目录。
3. 唤起交互式多选列表，按需挑选具体的工具脚本和规则文档。
4. 自动执行文件拷贝、智能合并公共规则、更新 `opencode.jsonc` 并配置 Python 依赖环境（如需）。

### 2. 查看已安装项 (`list` / `ls`)

```bash
vibe list
```

**功能**:
清晰打印当前项目中安装的所有资源态势图，包含：

* 🛠️ 本地扩展工具 (Local Tools)
* 📜 注入的上下文规则 (Local Rules)
* 🪄 全局标准技能 (Standard Skills)

### 3. 一键同步更新 (`update` / `up`)

```bash
vibe update
```

**功能**:
一键执行工作区全量更新。CLI 会并发拉取 `vibe-lock.json` 中记录的所有源仓库，智能比对并覆盖最新的本地脚本和规则文件，同时触发标准技能库的升级。

### 4. 移除资源 (`remove` / `rm`)

```bash
# 交互式模式：弹出 UI 列表选择要移除的工具和规则
vibe remove

# 快捷模式：直接指定要移除的资源（支持标准 skills 和本地工具/规则）
vibe remove <resource>
```

**执行流程**:

1. 调用原生能力，移除目标仓库中的标准 Agent 技能（通过 `pnpx skills remove`）。
2. 解析本地 `vibe-lock.json` 中的已安装资源列表。
3. **交互模式**：弹出多选列表，允许你选择具体的工具和规则分类进行移除。
4. **快捷模式**：根据传入的参数直接匹配并移除本地工具/规则文件。
5. 自动清理对应的物理文件（`.opencode/tool/` 和 `.opencode/rules/`），并同步更新 `opencode.jsonc` 配置。

---

## 📂 目录与配置规范 (Workspace Structure)

运行 `vibe add` 后，工具将在你的项目根目录下自动创建并维护以下标准 Vibe Coding 结构：

```text
your-project/
├── .opencode/
│   ├── tool/                   # 存放被拉取下来的底层 .ts / .py 工具脚本
│   │   ├── get_dsl.ts
│   │   └── ...
│   ├── rules/                  # 存放被拉取下来的 .md 规则文件（按类别分类归档）
│   │   ├── common/
│   │   └── typescript/
│   ├── opencode.jsonc          # OpenCode 核心配置文件
│   │                           # (vibe 会自动管理其中的 "tools": {...} 和 "instructions": [...])
│   └── vibe-lock.json          # 内部状态锁文件，精准记录资源来源仓库、版本与更新时间戳
├── .venv/                      # (按需自动创建) 隔离的 Python 虚拟环境
└── requirements.txt            # (按需自动维护) Python 脚本所需的依赖清单
```

---

## 🛠️ 开发者指南 (Development)

本项目底层基于 [Bun](https://bun.sh/) 构建，拥有极速的执行与打包体验。

```bash
# 1. 安装项目依赖
bun install

# 2. 本地调试运行 CLI
bun run dev --help

# 3. 严格类型检查
bun run typecheck

# 4. 构建生产版本 (输出至 ./dist)
bun run build
```

## 📄 许可证 (License)

本项目采用 [MIT License](https://www.google.com/search?q=../../LICENSE.md) 进行开源。
© 2026 [HelloGGX](https://github.com/HelloGGX)
