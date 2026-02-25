import * as p from "@clack/prompts"
import { execSync } from "child_process"
import { existsSync } from "fs"
import path from "path"
import { cloneRepo, cleanupTempDir } from "./git"
import { readLockFile, writeLockFile, copyToolFiles, installRules } from "./add"
import { OPENCODE_DIR, TOOL_SUBDIR, RULES_SUBDIR, RESET, CYAN, DIM, TEXT, BOLD, GREEN, YELLOW } from "./constants"

export async function runUpdate(args: string[]) {
  // 1. 集成标准 Skills 的更新
  console.log(`\n${BOLD}🪄  Updating Standard Skills...${RESET}\n`)
  try {
    execSync("pnpx skills update", { stdio: "inherit" })
  } catch (error) {
    console.log(`  ${YELLOW}Failed to update standard skills or none installed.${RESET}`)
  }

  console.log(`\n${BOLD}📦  Updating Local Tools & Rules...${RESET}\n`)

  const lockData = readLockFile()
  const toolNames = Object.keys(lockData.tools || {})
  const ruleNames = Object.keys(lockData.rules || {})

  if (toolNames.length === 0 && ruleNames.length === 0) {
    console.log(`  ${DIM}No local tools or rules tracked in lock file.${RESET}\n`)
    return
  }

  // 按照源仓库分组（合并 Tool 和 Rules 的 source）
  const itemsBySource: Record<string, { tools: string[]; rules: string[] }> = {}

  toolNames.forEach((t) => {
    const src = lockData.tools[t]?.source
    if (src) {
      itemsBySource[src] = itemsBySource[src] || { tools: [], rules: [] }
      itemsBySource[src].tools.push(t)
    }
  })

  ruleNames.forEach((r) => {
    const src = lockData.rules![r]?.source
    if (src) {
      itemsBySource[src] = itemsBySource[src] || { tools: [], rules: [] }
      itemsBySource[src].rules.push(r)
    }
  })

  const targetToolDir = path.join(process.cwd(), OPENCODE_DIR, TOOL_SUBDIR)
  const targetRulesDir = path.join(process.cwd(), OPENCODE_DIR, RULES_SUBDIR)
  const now = new Date().toISOString()
  let successCount = 0

  for (const [source, items] of Object.entries(itemsBySource)) {
    const s = p.spinner()
    s.start(`Fetching from ${CYAN}${source}${RESET}...`)

    let tempDir: string | null = null
    try {
      tempDir = await cloneRepo(source)

      // Update Tools
      if (items.tools.length > 0) {
        const toolDirPath = path.join(tempDir, "tool")
        if (existsSync(toolDirPath)) {
          for (const tool of items.tools) {
            copyToolFiles(tool, toolDirPath, targetToolDir)
            if (lockData.tools[tool]) lockData.tools[tool].installedAt = now
            successCount++
            console.log(`  ${GREEN}✓${RESET} Updated tool: ${tool}`)
          }
        }
      }

      // Update Rules
      if (items.rules.length > 0) {
        const rulesDirPath = path.join(tempDir, "rules")
        if (existsSync(rulesDirPath)) {
          // 复用 installRules 实现智能组合更新
          installRules(items.rules, rulesDirPath, targetRulesDir)
          for (const rule of items.rules) {
            if (lockData.rules![rule]) lockData.rules![rule].installedAt = now
            successCount++
            console.log(`  ${GREEN}✓${RESET} Updated rule: ${rule}`)
          }
        }
      }

      s.stop(`Done with ${source}`)
    } catch (err) {
      s.stop(`  ${YELLOW}✗ Failed to fetch from ${source}${RESET}`)
    } finally {
      if (tempDir) await cleanupTempDir(tempDir).catch(() => {})
    }
  }

  writeLockFile(lockData)

  console.log()
  if (successCount > 0) {
    console.log(`${TEXT}✓ Successfully updated ${successCount} local item(s)${RESET}`)
  }
  console.log()
}
