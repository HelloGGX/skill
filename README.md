<div align="right">
<a href="./README.zh.md">简体中文</a> | <b>English</b>
</div>

# HelloGGX's Skills

A curated collection of [Agent Skills](https://opencode.ai) built for **Design-Driven Development**, focusing on **Vue 3**, **Shadcn UI**, **MasterGo** integration, and high-quality engineering standards.

> [!IMPORTANT]
> This collection aims to revolutionize the "Design-to-Code" workflow. It connects MasterGo designs with production-grade Vue applications, fully automating project scaffolding, design token synchronization, and component generation.

## Installation

Add these skills to your Agent environment (e.g., OpenCode):

```bash
pnpx skills add HelloGGX/skill --skill='*'

```

or to install all of them globally:

```bash
pnpx skills add HelloGGX/skill --skill='*' -g

```

## Skill Ecosystem

This repository is divided into two main categories: **Generators** for accelerating development and **Experts** for maintaining code quality.

### 🚀 Generators (Design-to-Code)

Automated workflows for scaffolding projects and converting design drafts into code.

| Skill | Description | Tech Stack |
| --- | --- | --- |
| **vue-creater** | **Project Scaffolding.** Creates high-fidelity Vue 3 applications using a "CSS-First" strategy. Supports syncing Design Tokens directly from MasterGo DSL. | Vite 8, Tailwind 4, Pinia, Vue Query |
| **component-creater** | **Component Generator.** An autonomous workflow that converts MasterGo design links into production-ready Shadcn-Vue components. Automatically maps styles to Tailwind utility classes. | Shadcn-Vue, TypeScript, Tailwind CSS |

### 🛡️ Experts (Quality Assurance)

Best practices and review standards to ensure long-term code maintainability and security.

| Skill | Description | Focus Areas |
| --- | --- | --- |
| **code-review-expert** | Performs structured code reviews from a senior engineer's perspective. Detects SOLID violations, security risks, and offers actionable improvement suggestions. | SOLID, Security, Performance, Refactoring |
| **coding-standards** | Universal coding standards and patterns for TypeScript and Node.js. Enforces naming conventions, immutability, and error handling. | Readability, Type Safety, Clean Code |

## Tools

The underlying tools that support the skills above, which can also be invoked directly.

| Tool | Function |
| --- | --- |
| `shadcn_vue_init` | Initializes a modern Vue 3 stack (Vite 8 + Tailwind 4) with Shadcn UI and Pinia pre-configured. |
| `get_dsl` | Fetches and parses design draft DSL JSON data from a MasterGo share link. |
| `get_token` | Extracts Design Tokens (colors, typography) from the DSL and updates the project's CSS variables using modern color spaces (OKLCH). |

## Configuration Guide

To fully utilize the **Design-to-Code** features (MasterGo integration), you need to configure your environment secrets.

### 1. Environment Variables

Create a `.env` file or set the following variables in your Agent's configuration:

```bash
# MasterGo Personal Access Token (Required for fetching designs)
MG_MCP_TOKEN="your_mastergo_token_here"

# Default Design DSL Link (Optional quick-access preset)
TOKEN_URL_LIGHT="https://mastergo.com/goto/..."
TOKEN_URL_DARK="https://mastergo.com/goto/..."

```

### 2. Opencode Configuration

Ensure your `opencode.jsonc` has the necessary permissions enabled. Our `component-creater` requires `shadcnVue` MCP capabilities:

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

## 💡 Best Practice Workflows

To help you use these skills more efficiently, we have broken down the workflows into four core scenarios:

### Scenario 1: Building Full-Stack Apps from Scratch (Scaffolding & Design Sync)

**Core Skill**: `vue-creater`

When starting a new project, this skill handles tedious configuration (Vite, Tailwind, Shadcn, Pinia) and directly syncs the MasterGo design system.

1. **Initialize Project**
> **User:** "Help me create a Vue project named `crm-dashboard` and complete the initialization config."
> **Agent:** Calls `shadcn_vue_init` to set up project structure, install dependencies, and configure Tailwind 4 and CSS variables.


2. **Inject Design System**
> **User:** "Sync design specs using this MasterGo link [URL]." (or "Use the default Light theme config")
> **Agent:**


> 1. Calls `get_dsl` to fetch design data.
> 2. Calls `get_token` to map colors, radiuses, and typography to CSS variables (supports OKLCH color space).
> 
> 



---

### Scenario 2: Component-Driven Development (Design-to-Code)

**Core Skill**: `component-creater`

Converts specific UI component designs (e.g., cards, forms, sidebars) into code.

1. **Generate Component**
> **User:** "Generate a `UserProfile` component based on this design link [URL]."
> **Agent:**
> 1. Parses the DSL and identifies Shadcn components within it (e.g., Button, Input).
> 2. Automatically installs missing Shadcn components (`npx shadcn-vue@latest add ...`).
> 3. Writes Vue code, automatically mapping design properties to Tailwind utility classes (e.g., `bg-card`, `text-primary`).

---

### Scenario 3: Refactoring & Standardization (Improving Code Quality)

**Core Skill**: `coding-standards`

Ensures code aligns with TypeScript and Node.js best practices when writing complex logic or refactoring old code.

1. **Standardized Refactoring**
> **User:** "Refactor `src/utils/api.ts` to match our coding standards."
> **Agent:** References `coding-standards`:


> * **Naming Check:** Ensures variable names are descriptive (e.g., `isUserAuthenticated` instead of `flag`).
> * **Immutability:** Uses spread operators (`...user`) instead of direct object modification.
> * **Error Handling:** Ensures asynchronous operations include `try-catch` blocks and clear error messages.


2. **New Feature Guidance**
> **User:** "I want to add a market search feature. How should I organize the files and types?"
> **Agent:** Suggests a file structure (e.g., `types/market.types.ts`, `hooks/useMarket.ts`) based on standards and provides type-safe function signature examples.

---

### Scenario 4: Pre-Commit Review (Security & Architecture Audit)

**Core Skill**: `code-review-expert`

Performs deep technical reviews before merging code or submitting a PR.

1. **Execute Review**
> **User:** "Review my current staged changes."
> **Agent:** Scans `git diff` and checks against the checklist:


> * **SOLID Principles:** Checks for Single Responsibility (SRP) or Open-Closed (OCP) violations.
> * **Security:** Scans for XSS, injection risks, leaked secrets, or unsafe API calls.
> * **Code Smells:** Flags overly long functions, deep nesting, or magic numbers.


2. **Output Report**
> **Agent:** Generates a graded report ranging from **P0 (Critical)** to **P3 (Low Priority)** and asks if you want to apply auto-fixes.



## License

MIT License © 2026 [HelloGGX](https://www.google.com/search?q=https://github.com/HelloGGX)