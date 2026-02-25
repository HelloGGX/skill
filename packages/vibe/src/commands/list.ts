import { execSync } from "child_process"
import { readLockFile } from "../utils/config"
import { OPENCODE_DIR, TOOL_SUBDIR, RULES_SUBDIR, RESET, BOLD, CYAN, DIM, YELLOW } from "../constants"
import { ErrorSeverity, handleExecError } from "@/utils/error"

export async function runList(args: string[]) {
  const lockData = readLockFile()

  console.log(`\n${BOLD}🛠️  Installed Tools (${OPENCODE_DIR}/${TOOL_SUBDIR}):${RESET}\n`)
  const tools = Object.keys(lockData.tools || {})
  if (tools.length === 0) console.log(`  ${DIM}No tools installed yet.${RESET}`)
  else
    tools.forEach((t) =>
      console.log(`  ${CYAN}◆${RESET} ${t} ${DIM}(${lockData.tools[t]?.source || "unknown"})${RESET}`),
    )

  console.log(`\n${BOLD}📜  Installed Rules (${OPENCODE_DIR}/${RULES_SUBDIR}):${RESET}\n`)
  const rules = Object.keys(lockData.rules || {})
  if (rules.length === 0) console.log(`  ${DIM}No rules installed yet.${RESET}`)
  else
    rules.forEach((r) =>
      console.log(`  ${CYAN}◆${RESET} ${r} ${DIM}(${lockData.rules![r]?.source || "unknown"})${RESET}`),
    )
  
  console.log(`\n${BOLD}🪄  Installed Skills (Standard):${RESET}\n`)
  try {
    execSync("pnpx skills ls", { stdio: "inherit" })
  } catch (error) {
    handleExecError(error, "No standard skills found or failed to fetch", ErrorSeverity.WARN)
  }
}
