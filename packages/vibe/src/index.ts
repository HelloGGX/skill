import * as p from "@clack/prompts"
import { execSync } from "child_process"
import { existsSync, mkdirSync, cpSync, rmSync, readdirSync, writeFileSync, readFileSync, mkdtempSync } from "fs"
import path from "path"
import os from "os"

// ==========================================
// 1. 原生 UI & 颜色定义 (零依赖)
// ==========================================
const RESET = "\x1b[0m"
const BOLD = "\x1b[1m"
const CYAN = "\x1b[36m"
const BG_CYAN = "\x1b[46m\x1b[30m"
const DIM = "\x1b[38;5;102m"
const TEXT = "\x1b[38;5;145m"
const GREEN = "\x1b[32m"

const VIBE_LOGO = [
  "██╗   ██╗██╗██████╗ ███████╗",
  "██║   ██║██║██╔══██╗██╔════╝",
  "██║   ██║██║██████╔╝█████╗  ",
  "╚██╗ ██╔╝██║██╔══██╗██╔══╝  ",
  " ╚████╔╝ ██║██████╔╝███████╗",
  "  ╚═══╝  ╚═╝╚═════╝ ╚══════╝",
]

function showBanner() {
  console.log()
  VIBE_LOGO.forEach((line) => console.log(`${CYAN}${line}${RESET}`))
  console.log()
  console.log(`${DIM}The Design-Driven Agent Skills Ecosystem${RESET}`)
  console.log()
  console.log(`  ${DIM}$${RESET} ${TEXT}vibe add <repository>${RESET}    ${DIM}Add skills & tools${RESET}`)
  console.log(`  ${DIM}$${RESET} ${TEXT}vibe list${RESET}                ${DIM}List installed tools${RESET}`)
  console.log()
  console.log(`${DIM}Example:${RESET} vibe add helloggx/skill --agent opencode`)
  console.log()
}

// ==========================================
// 2. Lockfile 状态管理
// ==========================================
interface VibeLock {
  version: number
  tools: Record<string, { source: string; installedAt: string }>
}

function getLockFilePath(agentName: string) {
  return path.join(process.cwd(), `.${agentName}`, "vibe-lock.json")
}

function readLockFile(agentName: string): VibeLock {
  const lockPath = getLockFilePath(agentName)
  try {
    if (existsSync(lockPath)) {
      return JSON.parse(readFileSync(lockPath, "utf-8"))
    }
  } catch (e) {
    // ignore
  }
  return { version: 1, tools: {} }
}

function writeLockFile(agentName: string, lockData: VibeLock) {
  const lockPath = getLockFilePath(agentName)
  const dir = path.dirname(lockPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(lockPath, JSON.stringify(lockData, null, 2), "utf-8")
}

// ==========================================
// 3. 核心命令实现
// ==========================================
async function runAdd(args: string[]) {
  const repository = args[0]
  if (!repository) {
    console.error(`${CYAN}Error:${RESET} Repository name required.`)
    process.exit(1)
  }

  // 手动解析 --agent 参数
  let agentName = "opencode"
  const agentIdx = args.indexOf("--agent")
  if (agentIdx !== -1 && args.length > agentIdx + 1) {
    agentName = args[agentIdx + 1]!
  }

  const repoUrl = `https://github.com/${repository}.git`

  console.clear()
  console.log()
  VIBE_LOGO.forEach((line) => console.log(`${CYAN}${line}${RESET}`))
  console.log()

  p.intro(`${BG_CYAN} vibe cli ${RESET}`)
  p.note(`Repository: ${CYAN}${repoUrl}${RESET}\nTarget: ${CYAN}.${agentName}${RESET}`, "Initializing")

  // 1. 集成基础的 Skills
  const runSkills = await p.confirm({
    message: `Run standard skills installation (pnpx skills add)?`,
    initialValue: true,
  })

  if (p.isCancel(runSkills)) {
    p.cancel("Installation cancelled.")
    process.exit(0)
  }

  if (runSkills) {
    p.log.step("Executing skills installer...")
    try {
      execSync(`pnpx skills add ${repository} --agent ${agentName}`, { stdio: "inherit" })
    } catch (error) {
      p.log.warn("Skills installer finished with warnings.")
    }
  }

  // 2. 增强的 Tool 安装逻辑
  const s = p.spinner()
  s.start("Fetching remote tools list...")
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "vibe-repo-"))

  try {
    // 极速浅克隆
    execSync(`git clone --depth 1 ${repoUrl} ${tempDir}`, { stdio: "ignore" })
    s.stop("Remote repository parsed.")

    const toolDirPath = path.join(tempDir, "tool")
    if (existsSync(toolDirPath)) {
      const availableTools = readdirSync(toolDirPath).filter((file) => !file.startsWith("."))

      if (availableTools.length > 0) {
        const selectedTools = await p.multiselect({
          message: "Select tools to install (space to toggle)",
          options: availableTools.map((t) => ({ value: t, label: t })),
          required: false,
        })

        if (p.isCancel(selectedTools)) {
          p.cancel("Tool installation cancelled.")
          return
        }

        if (Array.isArray(selectedTools) && selectedTools.length > 0) {
          const installSpinner = p.spinner()
          installSpinner.start(`Installing tools to .${agentName}/tool/ ...`)

          const targetDir = path.join(process.cwd(), `.${agentName}`, "tool")
          if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true })

          const lockData = readLockFile(agentName)
          const now = new Date().toISOString()

          for (const tool of selectedTools) {
            const src = path.join(toolDirPath, tool as string)
            const dest = path.join(targetDir, tool as string)
            cpSync(src, dest, { recursive: true })

            // 记录到 Lockfile
            lockData.tools[tool as string] = { source: repoUrl, installedAt: now }
          }

          writeLockFile(agentName, lockData)

          await new Promise((r) => setTimeout(r, 400)) // 动画缓冲
          installSpinner.stop(`${GREEN}Successfully installed ${selectedTools.length} tools.${RESET}`)
        } else {
          p.log.info("No tools selected.")
        }
      } else {
        p.log.info('Remote "tool" directory is empty.')
      }
    } else {
      p.log.warn('No "tool" directory found in repository.')
    }
  } catch (error) {
    s.stop("Failed to fetch tools.")
    p.log.error(`Error: ${(error as Error).message}`)
  } finally {
    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true })
  }

  p.outro(`✨ Workspace updated for ${CYAN}${agentName}${RESET}`)
}

async function runList(args: string[]) {
  // 简易的 list 实现，读取 lockfile
  let agentName = "opencode"
  const agentIdx = args.indexOf("--agent")
  if (agentIdx !== -1 && args.length > agentIdx + 1) agentName = args[agentIdx + 1]!

  const lockData = readLockFile(agentName)
  const tools = Object.keys(lockData.tools)

  console.log(`\n${BOLD}Installed tools for .${agentName}:${RESET}\n`)
  if (tools.length === 0) {
    console.log(`${DIM}No tools installed yet.${RESET}`)
  } else {
    tools.forEach((t) => console.log(`  ${CYAN}◆${RESET} ${t} ${DIM}(${lockData.tools[t]?.source})${RESET}`))
  }
  console.log()
}

// ==========================================
// 4. Command Router (路由分发)
// ==========================================
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === "-h" || command === "--help") {
    showBanner()
    return
  }

  switch (command) {
    case "a":
    case "add":
      await runAdd(args.slice(1))
      break
    case "ls":
    case "list":
      await runList(args.slice(1))
      break
    default:
      console.log(`${CYAN}vibe:${RESET} Unknown command '${command}'`)
      console.log(`Run ${BOLD}vibe --help${RESET} for usage.`)
      break
  }
}

main().catch((err) => {
  console.error(`${CYAN}Fatal error:${RESET}`, err)
  process.exit(1)
})
