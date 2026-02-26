import * as p from "@clack/prompts"
import { execSync } from "child_process"
import { existsSync, mkdirSync, readdirSync } from "fs"
import path from "path"
import { cloneRepo, cleanupTempDir, GitCloneError } from "../git"
import { readLockFile, writeLockFile, ensureOpencodeConfig, updateOpencodeConfig } from "../utils/config"
import { copyToolFiles, installRules } from "../utils/file"
import { setupPythonEnvironment, getPythonActivationCmd } from "../utils/python"
import { ErrorSeverity, handleExecError } from "../utils/error"
import { ensureBunInstalled, ensurePythonInstalled } from "../utils/env"
import { OPENCODE_DIR, TOOL_SUBDIR, RULES_SUBDIR, RESET, CYAN, BG_CYAN, GREEN, YELLOW } from "../constants"

export async function runAdd(args: string[]) {
  const repository = args[0]
  if (!repository) {
    handleExecError(new Error("Repository name is missing"), "Argument Error", ErrorSeverity.ERROR)
    return // process.exit 已经在 handleExecError 中处理
  }

  p.intro(`${BG_CYAN} vibe cli ${RESET}`)

  // 1. 核心前置检查：确保系统拥有 Bun 环境
  ensureBunInstalled()

  const repoUrl = `https://github.com/${repository}.git`
  p.note(`Repository: ${CYAN}${repoUrl}${RESET}\nTarget: ${CYAN}${OPENCODE_DIR}${RESET}`, "Initializing")

  // 2. 执行标准技能安装 (pnpx skills add)
  p.log.step("Executing standard skills installer (pnpx skills add)...")
  try {
    execSync(`pnpx skills add ${repository} --agent opencode`, { stdio: "inherit" })
  } catch (err) {
    handleExecError(err, "Skills installer finished with warnings", ErrorSeverity.WARN)
  }

  const s = p.spinner()
  s.start("Fetching remote repository...")
  let tempDir: string | null = null

  try {
    // 3. 拉取并解析远程仓库
    tempDir = await cloneRepo(repoUrl)
    s.stop("Remote repository parsed.")

    const toolDirPath = path.join(tempDir, "tool")
    const rulesDirPath = path.join(tempDir, "rules")
    const hasTools = existsSync(toolDirPath)
    const hasRules = existsSync(rulesDirPath)

    if (!hasTools && !hasRules) {
      return handleExecError(new Error("Neither 'tool' nor 'rules' directory found in repository."), "Parse Error", ErrorSeverity.WARN)
    }

    let selectedTools: string[] = []
    let selectedRules: string[] = []

    // 4. UI 交互：选择 Tools
    if (hasTools) {
      const opts = readdirSync(toolDirPath)
        .filter((f) => f.endsWith(".ts"))
        .map((f) => f.replace(/\.ts$/, ""))
      if (opts.length > 0) {
        const res = await p.multiselect({
          message: "Select tools to install (space to toggle)",
          options: opts.map((t) => ({ value: t, label: t })),
          required: false,
        })
        if (p.isCancel(res)) return p.cancel("Installation cancelled.")
        if (Array.isArray(res)) selectedTools = res as string[]
      }
    }

    // 5. UI 交互：选择 Rules
    if (hasRules) {
      const opts = readdirSync(rulesDirPath, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== "common")
        .map((d) => d.name)
      if (opts.length > 0) {
        const res = await p.multiselect({
          message: "Select rule categories to install",
          options: opts.map((r) => ({ value: r, label: r })),
          required: false,
        })
        if (p.isCancel(res)) return p.cancel("Installation cancelled.")
        if (Array.isArray(res)) selectedRules = res as string[]
      }
    }

    if (selectedTools.length === 0 && selectedRules.length === 0) return p.cancel("No tools or rules selected.")

    // 6. 智能探测并检查 Python 环境
    let requiresPython = false
    if (selectedTools.length > 0) {
      for (const tool of selectedTools) {
        // 如果选中的工具在源目录中配套了 .py 脚本，则标记为需要 Python
        if (existsSync(path.join(toolDirPath, `${tool}.py`))) {
          requiresPython = true
          break
        }
      }
    }

    if (requiresPython) {
      ensurePythonInstalled()
    }

    // 7. 执行物理安装与状态更新
    const installSpinner = p.spinner()
    installSpinner.start(`Installing to ${OPENCODE_DIR}/ ...`)

    ensureOpencodeConfig()
    const lockData = readLockFile()
    const now = new Date().toISOString()
    let installedRulePaths: string[] = []

    // 拷贝 Tools
    if (selectedTools.length > 0) {
      const targetToolDir = path.join(process.cwd(), OPENCODE_DIR, TOOL_SUBDIR)
      if (!existsSync(targetToolDir)) mkdirSync(targetToolDir, { recursive: true })
      
      for (const tool of selectedTools) {
        copyToolFiles(tool, toolDirPath, targetToolDir)
        if (lockData.tools) lockData.tools[tool] = { source: repoUrl, installedAt: now }
      }
    }

    // 拷贝 Rules
    if (selectedRules.length > 0) {
      const targetRulesDir = path.join(process.cwd(), OPENCODE_DIR, RULES_SUBDIR)
      installedRulePaths = installRules(selectedRules, rulesDirPath, targetRulesDir)
      
      for (const rule of selectedRules) {
        if (!lockData.rules) lockData.rules = {}
        lockData.rules[rule] = { source: repoUrl, installedAt: now }
      }
    }

    // 更新配置文件与锁文件
    updateOpencodeConfig(selectedTools, installedRulePaths)
    writeLockFile(lockData)

    // 构建 Python 虚拟环境 (如果探测到需要)
    if (requiresPython) setupPythonEnvironment(process.cwd(), installSpinner)

    await new Promise((r) => setTimeout(r, 400)) // 增加一小段 UI 缓冲时间，体验更好
    installSpinner.stop(`${GREEN}Successfully installed ${selectedTools.length + selectedRules.length} items.${RESET}`)

    if (requiresPython) {
      p.note(
        `Your Python tools are ready. Run the following command to activate the environment:\n\n  ${CYAN}${getPythonActivationCmd()}${RESET}`,
        "🐍 Python Environment",
      )
    }

  } catch (error) {
    s.stop("Failed to fetch repository.")
    if (error instanceof GitCloneError) {
      handleExecError(error, "Git Error", ErrorSeverity.ERROR)
    } else {
      handleExecError(error, "Repository Fetch Error", ErrorSeverity.ERROR)
    }
  } finally {
    if (tempDir) await cleanupTempDir(tempDir).catch(() => {})
  }

  p.outro(`✨ Workspace updated for ${CYAN}${OPENCODE_DIR}${RESET}`)
}