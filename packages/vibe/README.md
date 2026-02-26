<div align="center">

# 🌊 Vibe Coding CLI

**A vibe coding ecosystem builder tailored for OpenCode**

[![npm version](https://img.shields.io/npm/v/@vibe-coder/cli.svg?style=flat-square)](https://www.npmjs.com/package/@vibe-coder/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../../LICENSE.md)
[![Built with Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat-square&logo=bun&logoColor=white)](https://bun.sh)

**English** · [简体中文](https://github.com/HelloGGX/skill/blob/main/packages/vibe/README.zh.md)

> *Seamlessly aggregate AI tools and context rules, making your Agent truly understand your codebase.*

</div>

## 📖 Introduction

`@vibe-coder/cli` is a modern command-line scaffolding tool built specifically for the **OpenCode** platform. Its core objective is to quickly set up a Vibe Coding development environment and simplify resource management for specification-driven development.

With the `vibe` command, you can pull TypeScript/Python tool scripts or Markdown rule files from remote GitHub repositories with a single click. It seamlessly registers them into your OpenCode configuration and manages the underlying runtime dependency environments, allowing you to focus entirely on "co-creating code with AI."

## ✨ Features

* 🛠 **Fully Automated Tool Management:** Quickly parse, select, and download `.ts` / `.py` scripts from any GitHub repository straight to your local setup, ready to use out of the box.
* 📜 **Context & Capabilities United:** A unique ecosystem aggregation capability that perfectly blends the **tools/skills** needed for Agent execution with your **guidelines and best practices**. Supports on-demand installation of `.md` rule files so the AI truly understands your architectural intent.
* 📦 **Smart Configuration Injection:** Automatically intercepts and updates `.opencode/opencode.jsonc`, silently injecting tool enable-switches and Prompt instruction paths. Say goodbye to manual configuration forever.
* ⚡ **Lightning-Fast Parallel Updates:** Designed with a concurrency model to simultaneously handle resource comparison and pulling from multiple source repositories, drastically reducing update wait times.
* 🪄 **Standard Skills Aggregation:** Deeply integrated with Vercel's `pnpx skills` ecosystem, allowing you to manage standard Agent skill libraries alongside local extension resources within a unified CLI workflow.

---

## 🚀 Quick Start

### Prerequisites

* [Node.js](https://www.google.com/search?q=https://nodejs.org/) >= 18.0.0 or [Bun](https://bun.sh/) >= 1.0.0

### Installation

Install as a global package:

```bash
# Using npm
npm i -g @vibe-coder/cli

# Using bun
bun add -g @vibe-coder/cli
```

### Basic Usage

Initialize and add an ecosystem library (e.g., `helloggx/skill` from this project):

```bash
vibe add helloggx/skill
```

*The CLI will pop up an interactive menu, allowing you to flexibly select the **Tools** and **Rules** you want to install, automatically configuring the entire environment for you.*

---

## 📚 Commands

| Command | Alias | Description |
| --- | --- | --- |
| `vibe add <repo>` | `a` | Parses the target GitHub repository, pops up a UI list, installs selected tools and rules on demand, and automatically injects configurations. |
| `vibe list` | `ls` | Prints a clear status map of all installed resources (local tools, context rules, global standard skills) in the current project. |
| `vibe update` | `up` | Concurrently pulls all source repositories recorded in `vibe-lock.json`, intelligently comparing and overwriting local scripts and rules. |
| `vibe remove [resource]` | `rm` | **No arguments:** Opens a UI multi-select list to remove local items.<br>

<br>**With arguments:** Quickly matches and removes specified standard skills or local tools, cleaning up configurations synchronously. |

---

## 🏗️ Build Your Own Resource Repository

We highly encourage you or your team to create a dedicated Vibe Coding resource repository on GitHub to standardize your favorite AI tools and custom coding guidelines across all your projects.

### Recommended Directory Structure

To ensure perfect compatibility with `@vibe-coder/cli`, we recommend the following convention (referencing the `helloggx/skill` repository):

```text
your-custom-repo/
├── skill/                  # (Optional) Standard Vercel AI Agent skills
├── tool/                   # Custom TS/Python executable tools
│   ├── get_dsl.ts
│   ├── get_dsl.py          # 💡 Python scripts should share the exact name as the TS tool calling them
│   └── shadcn_vue_init.ts
└── rules/                  # Personalized Markdown context rules
    ├── common/             # Global rules applicable to all projects
    │   ├── coding-style.md
    │   └── security.md
    └── typescript/         # Tech-stack specific rules
        └── coding-style.md # 💡 Recommended to share the name with the extended common rule

```

### Organization Best Practices

* **Cross-Language Tool Linkage**: If your `.ts` tool script relies on an underlying `.py` script, **ensure both files share the exact same base name** (e.g., `get_dsl.ts` and `get_dsl.py`). The CLI intelligently detects and pulls both files together.
* **Rule Inheritance & Overrides**:
* Always place your global, universal coding rules in the `rules/common/` directory.
* When creating tech-stack specific rules (e.g., under `rules/typescript/`) that need to inherit from a `common` rule, it is highly recommended to **use the exact same file name** and explicitly state the inheritance at the top of the file:
*> This file extends [common/coding-style.md](https://www.google.com/search?q=../common/coding-style.md) with TypeScript specific content.*



---

## 📂 Workspace Structure

After running `vibe add`, the tool will automatically take over and maintain the following structure in your project's root directory:

```text
your-project/
├── .opencode/
│   ├── tool/                   # Pulled underlying .ts / .py tool scripts
│   ├── rules/                  # Pulled .md rule files (categorized by type)
│   ├── opencode.jsonc          # Core OpenCode config (CLI auto-injects tool switches and paths)
│   └── vibe-lock.json          # State lock file, accurately recording resource sources and versions
├── .venv/                      # (Auto-created as needed) Isolated Python virtual environment
└── requirements.txt            # (Auto-maintained as needed) Python script dependencies
```

---

## 🛠️ Development

This project is built on top of the lightning-fast [Bun](https://bun.sh/) runtime.

```bash
bun install             # 1. Install dependencies
bun run dev --help      # 2. Local debugging
bun run typecheck       # 3. Type checking
bun run build           # 4. Build production version (outputs to ./dist)
```

## 📄 License

[MIT License](https://www.google.com/search?q=../../LICENSE.md) © 2026 [HelloGGX](https://github.com/HelloGGX)
