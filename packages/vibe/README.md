<div align="center">

# 🌊 Vibe Coding CLI

**A vibe coding ecosystem builder tailored for OpenCode**

**English** · [简体中文](./README.zh.md)

</div>

## 📖 Introduction

`vibe-coding-cli` is a modern command-line scaffolding tool built specifically for the **OpenCode** platform. Its core objective is to quickly set up a Vibe Coding development environment and simplify resource management for specification-driven development.

With the `vibe` command, you can pull TypeScript/Python tool scripts or Markdown rule files from remote GitHub repositories with a single click. It automatically and seamlessly registers them into your OpenCode configuration and manages the underlying runtime dependency environments, allowing you to focus entirely on "co-creating code with AI".

## ✨ Features

* 🛠 **Fully Automated Tool Management:** Quickly parse, select, and download `.ts` / `.py` scripts from any GitHub repository straight to your local `.opencode/tool/` directory, ready to use out of the box.
* 📜 **Integrates Everything You Need for Vibe Coding:** A unique ecosystem aggregation capability that perfectly blends the **Capabilities (tools and skills)** needed for Agent execution with the **Context (guidelines and best practices)**. Supports on-demand installation of `.md` rule files so the AI truly understands your architectural intent and coding standards.
* 📦 **Smart Configuration Injection:** Automatically intercepts and updates `.opencode/opencode.jsonc`, silently injecting tool enable-switches and Prompt instruction paths. Say goodbye to tedious manual configuration forever.
* ⚡ **Lightning-Fast Parallel Updates:** Designed with a concurrency model to simultaneously handle resource comparison and pulling from multiple source repositories, drastically reducing update wait times in multi-dependency scenarios.
* 🪄 **Standard Skills Aggregation:** Deeply integrated with Vercel's `pnpx skills` ecosystem, allowing you to manage standard Agent skill libraries alongside localized extension resources within a unified CLI workflow.

---

## 🚀 Quick Start

### Installation

Install as a global package (npm or bun recommended):

```bash
# Using npm
npm install -g vibe-coding-cli

# Using bun
bun add -g vibe-coding-cli

```

### Basic Usage

Initialize and add an ecosystem library (e.g., `helloggx/skill` from this project):

```bash
vibe add helloggx/skill

```

*This command will pop up an interactive menu, allowing you to flexibly select the **Tools** and **Rules** you want to install. The CLI will automatically configure the entire environment for you.*

---

## 📚 Commands

### 1. Add Resources (`add` / `a`)

```bash
vibe add <repository>

```

**Execution Flow**:

1. Invokes native capabilities to install basic Agent skills from the target repository.
2. Clones and parses the `skill`, `tool`, and `rules` asset directories in the target repository.
3. Triggers an interactive multi-select list to pick specific tool scripts and rule documents on demand.
4. Automatically executes file copying, intelligently merges common rules, updates `opencode.jsonc`, and configures the Python dependency environment (if needed).

### 2. List Installed Items (`list` / `ls`)

```bash
vibe list

```

**Function**:
Clearly prints a status map of all installed resources in the current project, including:

* 🛠️ Local Tools
* 📜 Injected Context Rules (Local Rules)
* 🪄 Global Standard Skills

### 3. One-Click Sync & Update (`update` / `up`)

```bash
vibe update

```

**Function**:
Executes a full workspace update with one click. The CLI will concurrently pull all source repositories recorded in `vibe-lock.json`, intelligently compare and overwrite the latest local scripts and rule files, and simultaneously trigger an upgrade of the standard skills library.

### 4. Remove Resources (`remove` / `rm`)

```bash
# Interactive mode: Pops up a UI list to select tools and rules to remove
vibe remove

# Shortcut mode: Directly specify the resource to remove (supports standard skills and local tools/rules)
vibe remove <resource>

```

**Execution Flow**:

1. Invokes native capabilities to remove standard Agent skills from the target repository (via `pnpx skills remove`).
2. Parses the list of installed resources in the local `vibe-lock.json`.
3. **Interactive Mode**: Pops up a multi-select list, allowing you to choose specific tools and rule categories for removal.
4. **Shortcut Mode**: Directly matches and removes local tool/rule files based on the passed arguments.
5. Automatically cleans up the corresponding physical files (`.opencode/tool/` and `.opencode/rules/`) and synchronously updates the `opencode.jsonc` configuration.

---

## 📂 Workspace Structure

After running `vibe add`, the tool will automatically create and maintain the following standard Vibe Coding structure in your project's root directory:

```text
your-project/
├── .opencode/
│   ├── tool/                   # Stores the pulled underlying .ts / .py tool scripts
│   │   ├── get_dsl.ts
│   │   └── ...
│   ├── rules/                  # Stores the pulled .md rule files (categorized by type)
│   │   ├── common/
│   │   └── typescript/
│   ├── opencode.jsonc          # Core OpenCode configuration file
│   │                           # (vibe automatically manages "tools": {...} and "instructions": [...] inside)
│   └── vibe-lock.json          # Internal state lock file, accurately recording resource sources, versions, and update timestamps
├── .venv/                      # (Auto-created as needed) Isolated Python virtual environment
└── requirements.txt            # (Auto-maintained as needed) Dependency list required for Python scripts

```

---

## 🛠️ Development

This project is built on top of [Bun](https://bun.sh/), offering a lightning-fast execution and bundling experience.

```bash
# 1. Install project dependencies
bun install

# 2. Run CLI locally for debugging
bun run dev --help

# 3. Strict type checking
bun run typecheck

# 4. Build production version (outputs to ./dist)
bun run build

```

## 📄 License

This project is open-sourced under the [MIT License](https://www.google.com/search?q=../../LICENSE.md).
© 2026 [HelloGGX](https://github.com/HelloGGX)
