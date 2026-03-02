import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs"
import path from "path"
import { OPENCODE_DIR, LOCK_FILE, CONFIG_FILE, YELLOW, RESET, RULES_SUBDIR } from "../constants"
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
      
      // Ensure all required fields exist
      if (typeof parsed.version !== 'number') {
        return createEmptyLockFile()
      }
      
      if (!parsed.skills) parsed.skills = {}
      if (!parsed.tools) parsed.tools = {}
      if (!parsed.rules) parsed.rules = {}
      
      return parsed
    }
  } catch (e) {}
  return createEmptyLockFile()
}

export function writeLockFile(lockData: VibeLock) {
  const lockPath = getLockFilePath()
  const dir = path.dirname(lockPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  
  // Sort all entries alphabetically for deterministic output / clean diffs
  const sorted: VibeLock = {
    version: lockData.version,
    skills: sortObject(lockData.skills),
    tools: sortObject(lockData.tools),
    rules: sortObject(lockData.rules)
  }
  
  // Add trailing newline for better git diffs
  const content = JSON.stringify(sorted, null, 2) + '\n'
  writeFileSync(lockPath, content, "utf-8")
}

function sortObject<T>(obj: Record<string, T>): Record<string, T> {
  const sorted: Record<string, T> = {}
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key]!
  }
  return sorted
}

function createEmptyLockFile(): VibeLock {
  return {
    version: 1,
    skills: {},
    tools: {},
    rules: {}
  }
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

// 🌟 新增：从 opencode.jsonc 中移除 tools 和 instructions
export function removeOpencodeConfig(toolsToRemove: string[], rulesToRemove: string[]) {
  if (toolsToRemove.length === 0 && rulesToRemove.length === 0) return;

  const configPath = path.join(process.cwd(), OPENCODE_DIR, CONFIG_FILE)
  if (!existsSync(configPath)) return;

  try {
    const content = readFileSync(configPath, "utf-8")
    const config = parseJsonc<OpencodeConfig>(content)
    let updated = false

    // 1. 从 tools 字典中删除对应的 key
    if (toolsToRemove.length > 0 && config.tools) {
      for (const tool of toolsToRemove) {
        if (tool in config.tools) {
          delete config.tools[tool]
          updated = true
        }
      }
    }

    // 2. 从 instructions 数组中过滤掉包含被删规则类别的路径
    if (rulesToRemove.length > 0 && config.instructions) {
      const originalLength = config.instructions.length
      config.instructions = config.instructions.filter(inst => {
        // 匹配规则路径，例如: "./rules/typescript/coding-style.md"
        // 只要包含了 "/rules/被删类别/" 就将其过滤掉
        return !rulesToRemove.some(rule => inst.includes(`/${RULES_SUBDIR}/${rule}/`))
      })
      if (config.instructions.length !== originalLength) {
        updated = true
      }
    }

    if (updated) writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8")
  } catch (e) {
    handleExecError(e, "Failed to remove items from opencode.jsonc", ErrorSeverity.WARN)
  }
}