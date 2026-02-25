import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs"
import path from "path"
import { OPENCODE_DIR, LOCK_FILE, CONFIG_FILE, YELLOW, RESET } from "../constants"
import type { VibeLock, OpencodeConfig } from "../types"
import { ErrorSeverity, handleExecError } from "./error"

// 内部工具：安全解析 JSONC（去除注释和尾随逗号）
function parseJsonc<T>(content: string): T {
  let safeJsonStr = content.replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (m) => m.startsWith('"') ? m : '')
  safeJsonStr = safeJsonStr.replace(/,\s*([\]}])/g, '$1')
  return JSON.parse(safeJsonStr)
}

export function getLockFilePath() {
  return path.join(process.cwd(), OPENCODE_DIR, LOCK_FILE)
}

export function readLockFile(): VibeLock {
  const lockPath = getLockFilePath()
  try {
    if (existsSync(lockPath)) {
      const parsed = JSON.parse(readFileSync(lockPath, "utf-8"))
      if (!parsed.rules) parsed.rules = {}
      if (!parsed.tools) parsed.tools = {}
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

// 统一更新 opencode.jsonc 中的 tools 和 instructions
export function updateOpencodeConfig(newTools: string[], newRulePaths: string[]) {
  if (newTools.length === 0 && newRulePaths.length === 0) return;
  
  const configPath = path.join(process.cwd(), OPENCODE_DIR, CONFIG_FILE)
  if (!existsSync(configPath)) return;

  try {
    const content = readFileSync(configPath, "utf-8")
    const config = parseJsonc<OpencodeConfig>(content)
    let updated = false

    if (newTools.length > 0) {
      config.tools = config.tools || {}
      for (const tool of newTools) {
        if (!config.tools[tool]) {
          config.tools[tool] = true
          updated = true
        }
      }
    }

    if (newRulePaths.length > 0) {
      config.instructions = config.instructions || []
      for (const rulePath of newRulePaths) {
        if (!config.instructions.includes(rulePath)) {
          config.instructions.push(rulePath)
          updated = true
        }
      }
    }

    if (updated) writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8")
  } catch (e) {
    handleExecError(e, "Failed to update opencode.jsonc", ErrorSeverity.WARN)
  }
}