import * as p from "@clack/prompts"
import { execSync } from "child_process"
import path from "path"
import { readLockFile, writeLockFile, removeOpencodeConfig } from "../utils/config"
import { removeToolFiles, removeRuleCategory } from "../utils/file"
import { OPENCODE_DIR, TOOL_SUBDIR, RULES_SUBDIR, RESET, CYAN, BG_CYAN, GREEN } from "../constants"
import { ErrorSeverity, handleExecError } from "../utils/error"

export async function runRemove(args: string[]) {
  p.intro(`${BG_CYAN} vibe cli ${RESET}`)

  // ==========================================
  // Step 1: 执行标准 Skills 删除 (与 add.ts 保持一致)
  // ==========================================
  p.log.step("Executing standard skills remover (pnpx skills remove)...")
  try {
    const cmdArgs = args.length > 0 ? args.join(" ") : ""
    // 如果没有参数，pnpx skills remove 会触发它的交互模式
    // 如果有参数（如 vibe rm helloggx/skill），则直接透传删除
    execSync(`pnpx skills remove ${cmdArgs}`.trim(), { stdio: "inherit" })
  } catch (err) {
    p.log.warn("Skills remover finished with warnings or nothing to remove.")
  }

  // ==========================================
  // Step 2: 本地 Tools 和 Rules 清理逻辑
  // ==========================================
  const lockData = readLockFile()
  const installedTools = Object.keys(lockData.tools || {})
  const installedRules = Object.keys(lockData.rules || {})

  if (installedTools.length === 0 && installedRules.length === 0) {
    p.log.info(`No local tools or rules found in ${OPENCODE_DIR}.`)
    return p.outro(`✨ Removal process completed.`)
  }

  let toolsToRemove: string[] = []
  let rulesToRemove: string[] = []

  // --- 交互/静默路由 ---
  if (args.length > 0) {
    // 快捷模式：根据传入的参数匹配本地项
    for (const arg of args) {
      if (installedTools.includes(arg)) toolsToRemove.push(arg)
      else if (installedRules.includes(arg)) rulesToRemove.push(arg)
      else {
        // 如果 arg 是一个标准 skill 仓库名（如 helloggx/skill），在这里它不会匹配到本地 tool/rule
        // 我们只用 INFO 级别提醒，因为它可能已经在 Step 1 被成功删除了
        p.log.info(`Local item '${arg}' not found, skipping local cleanup.`)
      }
    }
  } else {
    // 向导模式：弹出 UI 多选列表
    if (installedTools.length > 0) {
      const res = await p.multiselect({
        message: "Select local tools to remove (space to toggle)",
        options: installedTools.map(t => ({ value: t, label: t })),
        required: false
      })
      if (p.isCancel(res)) return p.cancel("Operation cancelled.")
      if (Array.isArray(res)) toolsToRemove = res as string[]
    }

    if (installedRules.length > 0) {
      const res = await p.multiselect({
        message: "Select rule categories to remove (space to toggle)",
        options: installedRules.map(r => ({ value: r, label: r })),
        required: false
      })
      if (p.isCancel(res)) return p.cancel("Operation cancelled.")
      if (Array.isArray(res)) rulesToRemove = res as string[]
    }
  }

  // 如果经过参数过滤或 UI 选择后，没有选中任何本地项，直接正常退出
  if (toolsToRemove.length === 0 && rulesToRemove.length === 0) {
    if (args.length === 0) p.cancel("No local items selected for removal.")
    else p.outro(`✨ Removal process completed.`)
    return
  }

  // 二次确认
  const confirm = await p.confirm({
    message: `Are you sure you want to completely remove ${toolsToRemove.length} local tool(s) and ${rulesToRemove.length} local rule(s)?`
  })

  if (p.isCancel(confirm) || !confirm) {
    return p.cancel("Operation cancelled.")
  }

  // ==========================================
  // Step 3: 执行物理清理与状态同步
  // ==========================================
  const s = p.spinner()
  s.start(`Cleaning up local workspace...`)

  try {
    const targetToolDir = path.join(process.cwd(), OPENCODE_DIR, TOOL_SUBDIR)
    const targetRulesDir = path.join(process.cwd(), OPENCODE_DIR, RULES_SUBDIR)

    // 清理 Tools
    for (const tool of toolsToRemove) {
      removeToolFiles(tool, targetToolDir)
      delete lockData.tools[tool]
    }

    // 清理 Rules
    for (const rule of rulesToRemove) {
      removeRuleCategory(rule, targetRulesDir)
      delete lockData.rules![rule]
    }

    // 同步配置
    removeOpencodeConfig(toolsToRemove, rulesToRemove)
    writeLockFile(lockData)

    s.stop(`${GREEN}Successfully removed selected local items.${RESET}`)
  } catch (e) {
    s.stop("Failed to complete local removal.")
    handleExecError(e, "Removal Error", ErrorSeverity.ERROR)
  }

  p.outro(`✨ Workspace cleaned for ${CYAN}${OPENCODE_DIR}${RESET}`)
}