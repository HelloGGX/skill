import * as p from "@clack/prompts"
import { execSync } from "child_process"
import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync } from "fs"
import path from "path"
import { cloneRepo, cleanupTempDir, GitCloneError } from "./git"
import {
  OPENCODE_DIR,
  TOOL_SUBDIR,
  RULES_SUBDIR,
  LOCK_FILE,
  CONFIG_FILE,
  RESET,
  CYAN,
  BG_CYAN,
  GREEN,
  YELLOW,
  DIM,
  TEXT,
} from "./constants"

// ==========================================
// 状态管理 (Lockfile & Config)
// ==========================================
export interface VibeLock {
  version: number
  tools: Record<string, { source: string; installedAt: string }>
  rules?: Record<string, { source: string; installedAt: string }>
}

function getLockFilePath() {
  return path.join(process.cwd(), OPENCODE_DIR, LOCK_FILE)
}

export function readLockFile(): VibeLock {
  const lockPath = getLockFilePath()
  try {
    if (existsSync(lockPath)) {
      const parsed = JSON.parse(readFileSync(lockPath, "utf-8"))
      if (!parsed.rules) parsed.rules = {}
      return parsed
    }
  } catch (e) {}
  return { version: 1, tools: {}, rules: {} }
}

export function writeLockFile(lockData: VibeLock) {
  const lockPath = getLockFilePath()
  const dir = path.dirname(lockPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(lockPath, JSON.stringify(lockData, null, 2), "utf-8")
}

export function ensureOpencodeConfig() {
  const configPath = path.join(process.cwd(), OPENCODE_DIR, CONFIG_FILE)
  const configDir = path.dirname(configPath)

  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  // 如果配置文件不存在，则写入带有 instructions 的默认纯净模板
  if (!existsSync(configPath)) {
    const jsoncContent = `{
  "$schema": "https://opencode.ai/config.json",
  "theme": "one-dark",
  "instructions": [],
  "mcp": {
    "shadcnVue": { "type": "local", "enabled": true, "command": ["npx", "shadcn-vue@latest", "mcp"] },
    "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" }
  },
  "tools": {},
  "permission": { "edit": "ask", "skill": { "*": "allow" } }
}`
    writeFileSync(configPath, jsoncContent, "utf-8")
  }
}

export function updateOpencodeConfigTools(newTools: string[]) {
  if (newTools.length === 0) return
  const configPath = path.join(process.cwd(), OPENCODE_DIR, CONFIG_FILE)
  if (!existsSync(configPath)) return

  try {
    const content = readFileSync(configPath, "utf-8")
    let safeJsonStr = content.replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (m) =>
      m.startsWith('"') ? m : "",
    )
    safeJsonStr = safeJsonStr.replace(/,\s*([\]}])/g, "$1")

    const config = JSON.parse(safeJsonStr)
    config.tools = config.tools || {}

    let updated = false
    for (const tool of newTools) {
      if (!config.tools[tool]) {
        config.tools[tool] = true
        updated = true
      }
    }
    if (updated) writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8")
  } catch (e) {
    console.error(`\n${YELLOW}Warning: Failed to inject tools into opencode.jsonc. ${(e as Error).message}${RESET}`)
  }
}

// 接收路径数组，依次注入到 instructions
export function updateOpencodeConfigInstructions(rulePaths: string[]) {
  if (rulePaths.length === 0) return
  const configPath = path.join(process.cwd(), OPENCODE_DIR, CONFIG_FILE)
  if (!existsSync(configPath)) return

  try {
    const content = readFileSync(configPath, "utf-8")
    let safeJsonStr = content.replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (m) =>
      m.startsWith('"') ? m : "",
    )
    safeJsonStr = safeJsonStr.replace(/,\s*([\]}])/g, "$1")

    const config = JSON.parse(safeJsonStr)
    config.instructions = config.instructions || []

    let updated = false
    for (const rulePath of rulePaths) {
      if (!config.instructions.includes(rulePath)) {
        config.instructions.push(rulePath)
        updated = true
      }
    }

    if (updated) writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8")
  } catch (e) {
    console.error(
      `\n${YELLOW}Warning: Failed to inject instructions into opencode.jsonc. ${(e as Error).message}${RESET}`,
    )
  }
}

// ==========================================
// 核心业务逻辑
// ==========================================

export function copyToolFiles(toolName: string, sourceDir: string, targetDir: string): boolean {
  let hasPython = false
  const tsFile = `${toolName}.ts`
  const pyFile = `${toolName}.py`

  const srcTs = path.join(sourceDir, tsFile)
  if (existsSync(srcTs)) cpSync(srcTs, path.join(targetDir, tsFile), { recursive: true })

  const srcPy = path.join(sourceDir, pyFile)
  if (existsSync(srcPy)) {
    cpSync(srcPy, path.join(targetDir, pyFile), { recursive: true })
    hasPython = true
  }
  return hasPython
}

// 原样拷贝文件夹，并返回相对路径列表
export function installRules(categories: string[], rulesSourceDir: string, targetRulesDir: string): string[] {
  if (!existsSync(targetRulesDir)) mkdirSync(targetRulesDir, { recursive: true })

  const installedRulePaths: string[] = []

  // 1. 拷贝 common 目录 (作为所有规则的基础)
  const commonSource = path.join(rulesSourceDir, "common")
  const commonTarget = path.join(targetRulesDir, "common")
  if (existsSync(commonSource)) {
    if (!existsSync(commonTarget)) mkdirSync(commonTarget, { recursive: true })
    const files = readdirSync(commonSource).filter((f) => f.endsWith(".md"))
    for (const file of files) {
      cpSync(path.join(commonSource, file), path.join(commonTarget, file))
      installedRulePaths.push(`./${RULES_SUBDIR}/common/${file}`)
    }
  }

  // 2. 拷贝选中的特定类别目录
  for (const category of categories) {
    const catSource = path.join(rulesSourceDir, category)
    const catTarget = path.join(targetRulesDir, category)
    if (existsSync(catSource)) {
      if (!existsSync(catTarget)) mkdirSync(catTarget, { recursive: true })
      const files = readdirSync(catSource).filter((f) => f.endsWith(".md"))
      for (const file of files) {
        cpSync(path.join(catSource, file), path.join(catTarget, file))
        installedRulePaths.push(`./${RULES_SUBDIR}/${category}/${file}`)
      }
    }
  }

  return installedRulePaths
}

function setupPythonEnvironment(rootDir: string, spinner: ReturnType<typeof p.spinner>) {
  spinner.message(`Initializing Python environment in ./.venv ...`)
  try {
    const reqPath = path.join(rootDir, "requirements.txt")
    const reqContent = `# 核心依赖\nrequests>=2.28.0\nurllib3>=1.26.0\npython-dotenv>=0.19.0\n`

    if (!existsSync(reqPath)) {
      writeFileSync(reqPath, reqContent, "utf-8")
    } else {
      const existingReq = readFileSync(reqPath, "utf-8")
      if (!existingReq.includes("requests>=")) writeFileSync(reqPath, existingReq + "\n" + reqContent, "utf-8")
    }

    const venvPath = path.join(rootDir, ".venv")
    if (!existsSync(venvPath)) {
      try {
        execSync(`python3 -m venv "${venvPath}"`, { stdio: "ignore" })
      } catch {
        execSync(`python -m venv "${venvPath}"`, { stdio: "ignore" })
      }
    }

    const pipCmd =
      process.platform === "win32" ? path.join(venvPath, "Scripts", "pip") : path.join(venvPath, "bin", "pip")
    spinner.message(`Installing Python dependencies...`)
    execSync(`"${pipCmd}" install -r "${reqPath}"`, { stdio: "ignore" })
  } catch (pyError) {
    p.log.warn(`⚠️ Failed to initialize Python environment. Manual setup required.`)
  }
}

// ==========================================
// Add 命令入口
// ==========================================
export async function runAdd(args: string[]) {
  const repository = args[0]
  if (!repository) {
    console.error(`${CYAN}Error:${RESET} Repository name required.`)
    process.exit(1)
  }

  const repoUrl = `https://github.com/${repository}.git`

  p.intro(`${BG_CYAN} vibe cli ${RESET}`)
  p.note(`Repository: ${CYAN}${repoUrl}${RESET}\nTarget: ${CYAN}${OPENCODE_DIR}${RESET}`, "Initializing")

  p.log.step("Executing standard skills installer (pnpx skills add)...")
  try {
    execSync(`pnpx skills add ${repository} --agent opencode`, { stdio: "inherit" })
  } catch {
    p.log.warn("Skills installer finished with warnings.")
  }

  const s = p.spinner()
  s.start("Fetching remote repository...")
  let tempDir: string | null = null

  try {
    tempDir = await cloneRepo(repoUrl)
    s.stop("Remote repository parsed.")

    const toolDirPath = path.join(tempDir, "tool")
    const rulesDirPath = path.join(tempDir, "rules")

    const hasTools = existsSync(toolDirPath)
    const hasRules = existsSync(rulesDirPath)

    if (!hasTools && !hasRules) {
      return p.log.warn('Neither "tool" nor "rules" directory found in repository.')
    }

    let selectedTools: string[] = []
    let selectedRules: string[] = []

    // --- 交互 1: 选 Tools ---
    if (hasTools) {
      const availableTools = readdirSync(toolDirPath)
        .filter((f) => f.endsWith(".ts"))
        .map((f) => f.replace(/\.ts$/, ""))

      if (availableTools.length > 0) {
        const result = await p.multiselect({
          message: "Select tools to install (space to toggle)",
          options: availableTools.map((t) => ({ value: t, label: t })),
          required: false,
        })
        if (p.isCancel(result)) return p.cancel("Installation cancelled.")
        if (Array.isArray(result)) selectedTools = result as string[]
      }
    }

    // --- 交互 2: 选 Rules ---
    if (hasRules) {
      const availableRules = readdirSync(rulesDirPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && dirent.name !== "common")
        .map((dirent) => dirent.name)

      if (availableRules.length > 0) {
        const result = await p.multiselect({
          message: "Select rule categories to install (space to toggle)",
          options: availableRules.map((r) => ({ value: r, label: r })),
          required: false,
        })
        if (p.isCancel(result)) return p.cancel("Installation cancelled.")
        if (Array.isArray(result)) selectedRules = result as string[]
      }
    }

    if (selectedTools.length === 0 && selectedRules.length === 0) {
      p.cancel("No tools or rules selected.")
      return
    }

    const installSpinner = p.spinner()
    installSpinner.start(`Installing to ${OPENCODE_DIR}/ ...`)

    const lockData = readLockFile()
    const now = new Date().toISOString()
    let requiresPython = false

    // 👈 核心修复：在这里提前确保 opencode.jsonc 和基础节点被创建
    ensureOpencodeConfig()

    // --- 执行: Tools ---
    if (selectedTools.length > 0) {
      const targetToolDir = path.join(process.cwd(), OPENCODE_DIR, TOOL_SUBDIR)
      if (!existsSync(targetToolDir)) mkdirSync(targetToolDir, { recursive: true })

      for (const tool of selectedTools) {
        const hasPy = copyToolFiles(tool, toolDirPath, targetToolDir)
        if (hasPy) requiresPython = true
        if (lockData.tools) lockData.tools[tool] = { source: repoUrl, installedAt: now }
      }

      // 现在写入时，文件已经存在，可以正常注入了
      updateOpencodeConfigTools(selectedTools)
    }

    // --- 执行: Rules ---
    if (selectedRules.length > 0) {
      const targetRulesDir = path.join(process.cwd(), OPENCODE_DIR, RULES_SUBDIR)
      const installedRulePaths = installRules(selectedRules, rulesDirPath, targetRulesDir)

      for (const rule of selectedRules) {
        if (!lockData.rules) lockData.rules = {}
        lockData.rules[rule] = { source: repoUrl, installedAt: now }
      }

      // 现在写入时，文件已经存在，可以正常注入了
      updateOpencodeConfigInstructions(installedRulePaths)
    }

    writeLockFile(lockData)

    if (requiresPython) {
      setupPythonEnvironment(process.cwd(), installSpinner)
    }

    const totalInstalled = selectedTools.length + selectedRules.length
    installSpinner.stop(`${GREEN}Successfully installed ${totalInstalled} items.${RESET}`)
  } catch (error) {
    s.stop("Failed to fetch repository.")
    if (error instanceof GitCloneError) p.log.error(`${YELLOW}Git Error:${RESET}\n${error.message}`)
    else p.log.error(`Error: ${(error as Error).message}`)
  } finally {
    if (tempDir) await cleanupTempDir(tempDir).catch(() => {})
  }

  p.outro(`✨ Workspace updated for ${CYAN}${OPENCODE_DIR}${RESET}`)
}
