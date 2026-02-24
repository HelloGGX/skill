import * as p from "@clack/prompts"
import { execSync } from "child_process"
import { existsSync, cpSync } from "fs"
import path from "path"
import { cloneRepo, cleanupTempDir } from "./git"
import { readLockFile, writeLockFile } from "./add"
import { OPENCODE_DIR, TOOL_SUBDIR, RESET, CYAN, DIM, TEXT, BOLD, GREEN, YELLOW } from "./constants"

// ==========================================
// 辅助函数：执行文件覆盖
// ==========================================
function copyToolFiles(toolName: string, sourceDir: string, targetDir: string) {
  const tsFile = `${toolName}.ts`
  const pyFile = `${toolName}.py`

  const srcTs = path.join(sourceDir, tsFile)
  if (existsSync(srcTs)) {
    cpSync(srcTs, path.join(targetDir, tsFile), { recursive: true })
  }

  const srcPy = path.join(sourceDir, pyFile)
  if (existsSync(srcPy)) {
    cpSync(srcPy, path.join(targetDir, pyFile), { recursive: true })
  }
}

// ==========================================
// Update 命令入口
// ==========================================
export async function runUpdate(args: string[]) {
  // 1. 集成标准 Skills 的更新
  console.log(`\n${BOLD}🪄  Updating Standard Skills...${RESET}\n`)
  try {
    // 保持标准输出以便看到 Vercel CLI 的原生更新提示
    execSync("pnpx skills update", { stdio: "inherit" })
  } catch (error) {
    console.log(`  ${YELLOW}Failed to update standard skills or none installed.${RESET}`)
  }

  // 2. 检查并更新本地 Tools
  console.log(`\n${BOLD}🛠️  Updating Local Tools...${RESET}\n`)

  const lockData = readLockFile()
  const toolNames = Object.keys(lockData.tools)

  if (toolNames.length === 0) {
    console.log(`  ${DIM}No local tools tracked in lock file.${RESET}\n`)
    return
  }

  // 将 tools 按照源仓库进行分组，避免重复拉取同一个仓库
  const toolsBySource: Record<string, string[]> = {}
  for (const tool of toolNames) {
    const source = lockData.tools[tool]?.source
    if (source) {
      if (!toolsBySource[source]) {
        toolsBySource[source] = []
      }
      toolsBySource[source].push(tool)
    }
  }

  const targetDir = path.join(process.cwd(), OPENCODE_DIR, TOOL_SUBDIR)
  const now = new Date().toISOString()
  let successCount = 0
  let failCount = 0

  // 遍历所有依赖的远程仓库
  for (const [source, tools] of Object.entries(toolsBySource)) {
    const s = p.spinner()
    s.start(`Fetching latest tools from ${CYAN}${source}${RESET}...`)

    let tempDir: string | null = null
    try {
      tempDir = await cloneRepo(source)
      const toolDirPath = path.join(tempDir, "tool")

      if (!existsSync(toolDirPath)) {
        s.stop(`  ${YELLOW}✗ Directory 'tool' not found in ${source}${RESET}`)
        failCount += tools.length
        continue
      }

      s.message(`Updating ${tools.length} tool(s) from ${source}...`)

      for (const tool of tools) {
        copyToolFiles(tool, toolDirPath, targetDir)

        // 👈 安全更新时间戳：告诉 TS 这个对象确实存在
        if (lockData.tools[tool]) {
          lockData.tools[tool].installedAt = now
        }

        successCount++
        console.log(`  ${GREEN}✓${RESET} Updated ${tool}`)
      }

      s.stop(`Done with ${source}`)
    } catch (err) {
      s.stop(`  ${YELLOW}✗ Failed to fetch tools from ${source}${RESET}`)
      failCount += tools.length
    } finally {
      if (tempDir) {
        await cleanupTempDir(tempDir).catch(() => {})
      }
    }
  }

  // 回写 lockfile
  writeLockFile(lockData)

  console.log()
  if (successCount > 0) {
    console.log(`${TEXT}✓ Updated ${successCount} local tool(s)${RESET}`)
  }
  if (failCount > 0) {
    console.log(`${DIM}Failed to update ${failCount} tool(s)${RESET}`)
  }
  console.log()
}
