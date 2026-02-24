
<div align="center">

# 🌊 Vibe Coding CLI

**专为 OpenCode 打造的 vibe coding 生态构建工具**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)
[![Built with Bun](https://img.shields.io/badge/Bun-%23000000.svg?logo=bun&logoColor=white)](https://bun.sh)

[English](#) · **简体中文**

</div>

## 📖 简介 (Introduction)

`vibe-coding-cli` 是一个专为 **OpenCode** 平台打造的现代命令行脚手架工具。它的核心目标是简化和自动化 Agent 技能（Skills）与底层脚本工具（Tools）的管理。

通过 `vibe` 命令，你可以一键拉取远程 GitHub 仓库中的 TypeScript 或 Python 工具脚本，自动将其注册到 OpenCode 配置中，并无缝管理其依赖环境（包括自动配置独立的 Python 虚拟环境）。

## ✨ 核心特性 (Features)

- 🛠 **全自动化工具管理**: 支持从任意 GitHub 仓库快速解析、选择并下载 `.ts` / `.py` 工具至本地 `.opencode/tool/` 目录。
- 📦 **智能配置注入**: 自动维护状态锁文件 (`vibe-lock.json`) 并向 `.opencode/opencode.jsonc` 中无感注入工具注册信息，告别手动配置。
- 🐍 **自动 Python 环境集成**: 侦测到 Python 工具时，自动在项目根目录创建 `.venv` 虚拟环境，并安装必要的 `requests`、`dotenv` 等基础依赖。
- 🪄 **标准技能聚合**: 与 `pnpx skills` 生态深度集成，统一管理标准技能库和本地化扩展工具。
- ⚡ **极致性能**: 基于 [Bun](https://bun.sh/) 编写与构建，极速执行代码和处理文件 IO。

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

*如果你在本地 monorepo 环境中开发，可以直接使用 `bun run dev` 或构建后执行 `./bin/vibe`。*

### 基础用法

初始化并添加一个技能库（例如本项目的 `helloggx/skill`）：

```bash
vibe add helloggx/skill

```

*此命令将会弹出交互式菜单，让你选择想要安装的底层工具，并自动配置项目结构。*

---

## 📚 命令指南 (Commands)

### 1. 添加工具与技能 (`add` / `a`)

```bash
vibe add <repository>

```

**功能流程**:

1. 调用原生能力安装目标仓库中的 Agent 技能。
2. 克隆并解析目标仓库中的 `tool` 文件夹。
3. 提供交互式多选列表，让你选择需要的具体工具。
4. 自动拷贝文件、更新 `opencode.jsonc` 并配置 Python 依赖环境（如果需要）。

### 2. 查看已安装项 (`list` / `ls`)

```bash
vibe list

```

**功能**:
清晰打印当前项目中安装的所有本地 Tools（来自 `vibe-lock.json`）以及已安装的标准 Skills，便于进行环境审查。

### 3. 一键更新 (`update` / `up`)

```bash
vibe update

```

**功能**:
自动执行标准 Skills 的升级，并根据锁文件记录的源仓库，拉取并覆盖最新的本地工具脚本，保持生态环境最新。

---

## 📂 目录与配置规范 (Workspace Structure)

运行 `vibe add` 后，工具将在你的项目根目录下自动创建并维护以下结构：

```text
your-project/
├── .opencode/
│   ├── tool/                   # 存放被拉取下来的底层 .ts / .py 工具脚本
│   │   ├── get_dsl.ts
│   │   └── ...
│   ├── opencode.jsonc          # OpenCode 核心配置（vibe 会自动向 "tools" 字段注入注册信息）
│   └── vibe-lock.json          # Vibe 状态锁文件，记录工具来源和版本时间戳
├── .venv/                      # (自动创建) Python 虚拟环境，为 .py 工具提供隔离环境
└── requirements.txt            # (自动维护) 补充 Python 工具运行所需的核心依赖

```

---

## 🛠️ 开发者指南 (Development)

本项目使用 Bun 进行包管理和运行。

```bash
# 1. 安装依赖
bun install

# 2. 本地开发运行 CLI
bun run dev --help

# 3. 类型检查
bun run typecheck

# 4. 构建生产版本 (输出至 ./dist)
bun run build

```

## 📄 许可证 (License)

本项目采用 [MIT License](https://www.google.com/search?q=../../LICENSE.md) 进行开源。
© 2026 [HelloGGX](https://github.com/HelloGGX)
