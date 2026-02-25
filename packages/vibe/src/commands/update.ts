import * as p from "@clack/prompts"
import { execSync } from "child_process"
import { existsSync } from "fs"
import path from "path"
import { cloneRepo, cleanupTempDir } from "../git"
import { readLockFile, writeLockFile } from "../utils/config"
import { copyToolFiles, installRules } from "../utils/file"
import { handleExecError, ErrorSeverity } from "../utils/error"
import { OPENCODE_DIR, TOOL_SUBDIR, RULES_SUBDIR, RESET, CYAN, DIM, TEXT, BOLD, GREEN, YELLOW } from "../constants"

export async function runUpdate(args: string[]) {
  // 1. 更新标准 Skills
  console.log(`\n${BOLD}🪄  Updating Standard Skills...${RESET}\n`)
  try { 
    execSync("pnpx skills update", { stdio: "inherit" }) 
  } catch (error) { 
    handleExecError(error, "Failed to update standard skills", ErrorSeverity.WARN) 
  }

  // 2. 准备更新本地 Tools & Rules
  console.log(`\n${BOLD}📦  Updating Local Tools & Rules...${RESET}\n`)

  const lockData = readLockFile()
  const toolNames = Object.keys(lockData.tools || {})
  const ruleNames = Object.keys(lockData.rules || {})

  if (toolNames.length === 0 && ruleNames.length === 0) {
    return console.log(`  ${DIM}No local items to update.${RESET}\n`)
  }

  // 将依赖按源仓库分组
  const itemsBySource: Record<string, { tools: string[], rules: string[] }> = {}
  toolNames.forEach(t => { 
    const s = lockData.tools[t]?.source; 
    if (s) { itemsBySource[s] = itemsBySource[s] || { tools: [], rules: [] }; itemsBySource[s].tools.push(t) } 
  })
  ruleNames.forEach(r => { 
    const s = lockData.rules![r]?.source; 
    if (s) { itemsBySource[s] = itemsBySource[s] || { tools: [], rules: [] }; itemsBySource[s].rules.push(r) } 
  })

  const targetToolDir = path.join(process.cwd(), OPENCODE_DIR, TOOL_SUBDIR)
  const targetRulesDir = path.join(process.cwd(), OPENCODE_DIR, RULES_SUBDIR)
  const now = new Date().toISOString()
  
  const sourcesCount = Object.keys(itemsBySource).length
  
  // 启动一个总的 Spinner，避免终端并发闪烁
  const s = p.spinner()
  s.start(`Fetching from ${CYAN}${sourcesCount}${RESET} source(s) concurrently...`)

  // 3. 构建并行处理任务
  const updatePromises = Object.entries(itemsBySource).map(
    async ([source, items]) => {
      let tempDir: string | null = null
      let successCount = 0
      const logs: string[] = [] // 收集当前源的更新日志
      
      try {
        tempDir = await cloneRepo(source)
        
        // 更新 Tools
        if (items.tools.length > 0 && existsSync(path.join(tempDir, "tool"))) {
          for (const tool of items.tools) {
            copyToolFiles(tool, path.join(tempDir, "tool"), targetToolDir)
            if (lockData.tools[tool]) lockData.tools[tool].installedAt = now
            successCount++
            logs.push(`  ${GREEN}✓${RESET} Updated tool: ${tool}`)
          }
        }

        // 更新 Rules
        if (items.rules.length > 0 && existsSync(path.join(tempDir, "rules"))) {
          installRules(items.rules, path.join(tempDir, "rules"), targetRulesDir)
          for (const rule of items.rules) {
            if (lockData.rules![rule]) lockData.rules![rule].installedAt = now
            successCount++
            logs.push(`  ${GREEN}✓${RESET} Updated rule: ${rule}`)
          }
        }
        
        return { source, success: true, count: successCount, logs }
      } catch (err) {
        return { source, success: false, count: 0, error: err, logs: [] }
      } finally {
        if (tempDir) await cleanupTempDir(tempDir).catch(() => {})
      }
    }
  )

  // 4. 等待所有源并行处理完毕
  const results = await Promise.allSettled(updatePromises)
  s.stop(`Finished fetching from ${sourcesCount} source(s).`)

  // 5. 统一结算并打印日志
  let totalSuccessCount = 0
  
  for (const result of results) {
    if (result.status === "fulfilled") {
      const { source, success, count, logs, error } = result.value
      if (success) {
        totalSuccessCount += count
        logs.forEach(log => console.log(log))
      } else {
        handleExecError(error, `Failed to fetch from ${source}`, ErrorSeverity.WARN)
      }
    } else {
      // 捕获未预料到的 Promise 崩溃
      handleExecError(result.reason, "Unexpected error during concurrent update", ErrorSeverity.ERROR)
    }
  }

  // 统一回写锁文件
  writeLockFile(lockData)
  
  if (totalSuccessCount > 0) {
    console.log(`${TEXT}✓ Successfully updated ${totalSuccessCount} local item(s)${RESET}\n`)
  }
}