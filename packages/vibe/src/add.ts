import * as p from "@clack/prompts"
import { execSync } from "child_process"
import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync } from "fs"
import path from "path"
import { cloneRepo, cleanupTempDir, GitCloneError } from "./git"

// ==========================================
// 1. UI & 颜色定义
// ==========================================
export const RESET = "\x1b[0m"
export const CYAN = "\x1b[36m"
export const BG_CYAN = "\x1b[46m\x1b[30m"
export const GREEN = "\x1b[32m"
export const YELLOW = "\x1b[33m"

// ==========================================
// 2. 状态管理 (Lockfile & Config)
// ==========================================
export interface VibeLock {
  version: number
  tools: Record<string, { source: string; installedAt: string }>
}

function getLockFilePath(agentName: string) {
  return path.join(process.cwd(), `.${agentName}`, "vibe-lock.json")
}

export function readLockFile(agentName: string): VibeLock {
  const lockPath = getLockFilePath(agentName)
  try {
    if (existsSync(lockPath)) return JSON.parse(readFileSync(lockPath, "utf-8"))
  } catch (e) {}
  return { version: 1, tools: {} }
}

export function writeLockFile(agentName: string, lockData: VibeLock) {
  const lockPath = getLockFilePath(agentName)
  const dir = path.dirname(lockPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(lockPath, JSON.stringify(lockData, null, 2), "utf-8")
}

export function ensureOpencodeConfig(agentName: string) {
  if (agentName !== "opencode") return
  const configPath = path.join(process.cwd(), `.${agentName}`, "opencode.jsonc")
  const configDir = path.dirname(configPath)

  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })
  if (!existsSync(configPath)) {
    const jsoncContent = `{
  "$schema": "https://opencode.ai/config.json",
  "theme": "one-dark",
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

export function updateOpencodeConfigTools(agentName: string, newTools: string[]) {
  if (agentName !== "opencode" || newTools.length === 0) return
  const configPath = path.join(process.cwd(), `.${agentName}`, "opencode.jsonc")
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

// ==========================================
// 3. 核心业务逻辑 (拆分出的独立执行单元)
// ==========================================

/**
 * 负责拷贝特定的 Tool 文件 (.ts 和 .py)
 * 返回是否拷贝了 Python 文件
 */
function copyToolFiles(toolName: string, sourceDir: string, targetDir: string): boolean {
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

/**
 * 负责在项目根目录初始化 Python 虚拟环境并安装依赖
 */
function setupPythonEnvironment(rootDir: string, spinner: ReturnType<typeof p.spinner>) {
  // 👈 修正提示语为根目录
  spinner.message(`Initializing Python environment in ./.venv ...`)
  try {
    // 👈 修正路径：生成在根目录下
    const reqPath = path.join(rootDir, "requirements.txt")
    const reqContent = `# 核心依赖\nrequests>=2.28.0\nurllib3>=1.26.0\npython-dotenv>=0.19.0\n`

    if (!existsSync(reqPath)) {
      writeFileSync(reqPath, reqContent, "utf-8")
    } else {
      const existingReq = readFileSync(reqPath, "utf-8")
      if (!existingReq.includes("requests>=")) writeFileSync(reqPath, existingReq + "\n" + reqContent, "utf-8")
    }

    // 👈 修正路径：生成在根目录下
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
    spinner.message(`Installing Python dependencies (requests, urllib3, dotenv)...`)
    execSync(`"${pipCmd}" install -r "${reqPath}"`, { stdio: "ignore" })
  } catch (pyError) {
    p.log.warn(`⚠️ Failed to initialize Python environment. Manual setup required for requirements.txt`)
  }
}

// ==========================================
// 4. Add 命令入口 (Orchestrator)
// ==========================================
export async function runAdd(args: string[]) {
  const repository = args[0]
  if (!repository) {
    console.error(`${CYAN}Error:${RESET} Repository name required.`)
    process.exit(1)
  }

  const agentName = args.includes("--agent") ? args[args.indexOf("--agent") + 1] || "opencode" : "opencode"
  const repoUrl = `https://github.com/${repository}.git`

  p.intro(`${BG_CYAN} vibe cli ${RESET}`)
  p.note(`Repository: ${CYAN}${repoUrl}${RESET}\nTarget: ${CYAN}.${agentName}${RESET}`, "Initializing")

  // Step 1: Install standard skills
  p.log.step("Executing standard skills installer (pnpx skills add)...")
  try {
    execSync(`pnpx skills add ${repository} --agent ${agentName}`, { stdio: "inherit" })
  } catch {
    p.log.warn("Skills installer finished with warnings.")
  }

  // Step 2: Fetch and Parse Remote Tools
  const s = p.spinner()
  s.start("Fetching remote tools list...")
  let tempDir: string | null = null

  try {
    tempDir = await cloneRepo(repoUrl)
    s.stop("Remote repository parsed.")

    const toolDirPath = path.join(tempDir, "tool")
    if (!existsSync(toolDirPath)) {
      return p.log.warn('No "tool" directory found in repository.')
    }

    const availableTools = readdirSync(toolDirPath)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => f.replace(/\.ts$/, ""))

    if (availableTools.length === 0) {
      return p.log.info('Remote "tool" directory has no TypeScript (.ts) tools.')
    }

    // Step 3: User Selection
    const selectedTools = await p.multiselect({
      message: "Select tools to install (space to toggle)",
      options: availableTools.map((t) => ({ value: t, label: t })),
      required: false,
    })

    if (p.isCancel(selectedTools)) {
      p.cancel("Tool installation cancelled.")
      return
    }

    if (!Array.isArray(selectedTools) || selectedTools.length === 0) {
      p.cancel("No tools selected.")
      return
    }

    // Step 4: Execution (Copy files, update state, setup env)
    const installSpinner = p.spinner()
    installSpinner.start(`Installing tools to .${agentName}/tool/ ...`)

    const targetDir = path.join(process.cwd(), `.${agentName}`, "tool")
    if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true })

    const lockData = readLockFile(agentName)
    const now = new Date().toISOString()
    let requiresPython = false

    for (const tool of selectedTools) {
      const toolName = tool as string

      const hasPy = copyToolFiles(toolName, toolDirPath, targetDir)
      if (hasPy) requiresPython = true

      lockData.tools[toolName] = { source: repoUrl, installedAt: now }
    }

    writeLockFile(agentName, lockData)
    ensureOpencodeConfig(agentName)
    updateOpencodeConfigTools(agentName, selectedTools as string[])

    // 👈 核心改动：传入 process.cwd() 作为 Python 环境的根目录
    if (requiresPython) {
      setupPythonEnvironment(process.cwd(), installSpinner)
    }

    await new Promise((r) => setTimeout(r, 400)) // UI 缓冲
    installSpinner.stop(`${GREEN}Successfully installed and configured ${selectedTools.length} tools.${RESET}`)
  } catch (error) {
    s.stop("Failed to fetch tools.")
    if (error instanceof GitCloneError) {
      p.log.error(`${YELLOW}Git Error:${RESET}\n${error.message}`)
    } else {
      p.log.error(`Error: ${(error as Error).message}`)
    }
  } finally {
    if (tempDir) await cleanupTempDir(tempDir).catch(() => {})
  }

  p.outro(`✨ Workspace updated for ${CYAN}.${agentName}${RESET}`)
}
