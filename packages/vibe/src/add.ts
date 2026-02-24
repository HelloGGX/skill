import * as p from "@clack/prompts"
import { execSync } from "child_process"
import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync } from "fs"
import path from "path"
import { cloneRepo, cleanupTempDir, GitCloneError } from "./git"

// ==========================================
// 1. 局部 UI & 颜色定义
// ==========================================
export const RESET = "\x1b[0m"
export const CYAN = "\x1b[36m"
export const BG_CYAN = "\x1b[46m\x1b[30m"
export const GREEN = "\x1b[32m"
export const YELLOW = "\x1b[33m"

// ==========================================
// 2. Lockfile & 配置状态管理 (供 cli.ts 读)
// ==========================================
export interface VibeLock {
  version: number
  tools: Record<string, { source: string; installedAt: string }>
}

export function getLockFilePath(agentName: string) {
  return path.join(process.cwd(), `.${agentName}`, "vibe-lock.json")
}

export function readLockFile(agentName: string): VibeLock {
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

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  if (!existsSync(configPath)) {
    const jsoncContent = `{
  "$schema": "https://opencode.ai/config.json",
  "theme": "one-dark",
  "mcp": {
    "shadcnVue": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "shadcn-vue@latest", "mcp"]
    },
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  },
  "tools": {
  },
  "permission": {
    "edit": "ask",
    "skill": {
      "*": "allow"
    }
  }
}`
    writeFileSync(configPath, jsoncContent, "utf-8")
  }
}

// 👈 核心修复：智能识别字符串与注释
export function updateOpencodeConfigTools(agentName: string, newTools: string[]) {
  if (agentName !== "opencode" || newTools.length === 0) return

  const configPath = path.join(process.cwd(), `.${agentName}`, "opencode.jsonc")
  if (!existsSync(configPath)) return

  try {
    const content = readFileSync(configPath, "utf-8")

    // 智能解析：避开字符串内部的 //（比如 https://），只清除真正的注释
    let safeJsonStr = content.replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (match) =>
      match.startsWith('"') ? match : "",
    )

    // 移除 JSON 中不合法的尾随逗号 (Trailing commas)
    safeJsonStr = safeJsonStr.replace(/,\s*([\]}])/g, "$1")

    const config = JSON.parse(safeJsonStr)

    // 确保 tools 节点存在
    if (!config.tools) {
      config.tools = {}
    }

    // 遍历新工具，设置为 true
    let updated = false
    for (const tool of newTools) {
      if (config.tools[tool] !== true) {
        config.tools[tool] = true
        updated = true
      }
    }

    // 回写覆盖文件
    if (updated) {
      writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8")
    }
  } catch (e) {
    // 将具体的报错原因打印出来，方便定位
    console.error(`\n${YELLOW}Warning: Failed to inject tools into opencode.jsonc. ${(e as Error).message}${RESET}`)
  }
}

// ==========================================
// 3. Add 命令实现
// ==========================================
export async function runAdd(args: string[]) {
  const repository = args[0]
  if (!repository) {
    console.error(`${CYAN}Error:${RESET} Repository name required.`)
    process.exit(1)
  }

  let agentName = "opencode"
  const agentIdx = args.indexOf("--agent")
  if (agentIdx !== -1 && args.length > agentIdx + 1) {
    agentName = args[agentIdx + 1]!
  }

  const repoUrl = `https://github.com/${repository}.git`

  p.intro(`${BG_CYAN} vibe cli ${RESET}`)
  p.note(`Repository: ${CYAN}${repoUrl}${RESET}\nTarget: ${CYAN}.${agentName}${RESET}`, "Initializing")

  p.log.step("Executing standard skills installer (pnpx skills add)...")
  try {
    execSync(`pnpx skills add ${repository} --agent ${agentName}`, { stdio: "inherit" })
  } catch (error) {
    p.log.warn("Skills installer finished with warnings.")
  }

  const s = p.spinner()
  s.start("Fetching remote tools list...")

  let tempDir: string | null = null

  try {
    tempDir = await cloneRepo(repoUrl)
    s.stop("Remote repository parsed.")

    const toolDirPath = path.join(tempDir, "tool")
    if (existsSync(toolDirPath)) {
      const availableTools = readdirSync(toolDirPath)
        .filter((file) => file.endsWith(".ts"))
        .map((file) => file.replace(/\.ts$/, ""))

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
          let hasPythonScript = false

          for (const tool of selectedTools) {
            const toolName = tool as string
            const tsFile = `${toolName}.ts`
            const pyFile = `${toolName}.py`

            const srcTs = path.join(toolDirPath, tsFile)
            if (existsSync(srcTs)) {
              const destTs = path.join(targetDir, tsFile)
              cpSync(srcTs, destTs, { recursive: true })
            }

            const srcPy = path.join(toolDirPath, pyFile)
            if (existsSync(srcPy)) {
              const destPy = path.join(targetDir, pyFile)
              cpSync(srcPy, destPy, { recursive: true })
              hasPythonScript = true
            }

            lockData.tools[toolName] = { source: repoUrl, installedAt: now }
          }

          writeLockFile(agentName, lockData)
          ensureOpencodeConfig(agentName)

          // 自动激活工具配置
          updateOpencodeConfigTools(agentName, selectedTools as string[])

          if (hasPythonScript) {
            installSpinner.message(`Initializing Python environment in .${agentName}/tool/.venv ...`)
            try {
              const reqPath = path.join(targetDir, "requirements.txt")
              const reqContent = `# 核心依赖\nrequests>=2.28.0\nurllib3>=1.26.0\npython-dotenv>=0.19.0\n`

              if (!existsSync(reqPath)) {
                writeFileSync(reqPath, reqContent, "utf-8")
              } else {
                const existingReq = readFileSync(reqPath, "utf-8")
                if (!existingReq.includes("requests>=")) {
                  writeFileSync(reqPath, existingReq + "\n" + reqContent, "utf-8")
                }
              }

              const venvPath = path.join(targetDir, ".venv")
              if (!existsSync(venvPath)) {
                try {
                  execSync(`python3 -m venv "${venvPath}"`, { stdio: "ignore" })
                } catch {
                  execSync(`python -m venv "${venvPath}"`, { stdio: "ignore" })
                }
              }

              const isWin = process.platform === "win32"
              const pipCmd = isWin ? path.join(venvPath, "Scripts", "pip") : path.join(venvPath, "bin", "pip")

              installSpinner.message(`Installing Python dependencies (requests, urllib3, dotenv)...`)
              execSync(`"${pipCmd}" install -r "${reqPath}"`, { stdio: "ignore" })
            } catch (pyError) {
              p.log.warn(
                `⚠️ Failed to initialize Python environment. You may need to manually install requirements in .${agentName}/tool/`,
              )
            }
          }

          await new Promise((r) => setTimeout(r, 400)) // 动画缓冲
          installSpinner.stop(`${GREEN}Successfully installed and configured ${selectedTools.length} tools.${RESET}`)
        } else {
          p.log.info("No tools selected.")
        }
      } else {
        p.log.info('Remote "tool" directory has no TypeScript (.ts) tools.')
      }
    } else {
      p.log.warn('No "tool" directory found in repository.')
    }
  } catch (error) {
    s.stop("Failed to fetch tools.")

    if (error instanceof GitCloneError) {
      p.log.error(`${YELLOW}Git Error:${RESET}\n${error.message}`)
    } else {
      p.log.error(`Error: ${(error as Error).message}`)
    }
  } finally {
    if (tempDir) {
      await cleanupTempDir(tempDir).catch(() => {})
    }
  }

  p.outro(`✨ Workspace updated for ${CYAN}.${agentName}${RESET}`)
}
