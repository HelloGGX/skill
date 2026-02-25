import { execSync } from "child_process"
import { readLockFile } from "./add"
import { OPENCODE_DIR, TOOL_SUBDIR, RULES_SUBDIR, RESET, BOLD, CYAN, DIM, YELLOW } from "./constants"

export async function runList(args: string[]) {
  const lockData = readLockFile()

  // 1. 打印 Tools
  console.log(`\n${BOLD}🛠️  Installed Tools (${OPENCODE_DIR}/${TOOL_SUBDIR}):${RESET}\n`)
  const tools = Object.keys(lockData.tools || {})
  if (tools.length === 0) {
    console.log(`  ${DIM}No tools installed yet.${RESET}`)
  } else {
    tools.forEach((t) => {
      const source = lockData.tools[t]?.source || "unknown"
      console.log(`  ${CYAN}◆${RESET} ${t} ${DIM}(${source})${RESET}`)
    })
  }

  // 2. 打印 Rules
  console.log(`\n${BOLD}📜  Installed Rules (${OPENCODE_DIR}/${RULES_SUBDIR}):${RESET}\n`)
  const rules = Object.keys(lockData.rules || {})
  if (rules.length === 0) {
    console.log(`  ${DIM}No rules installed yet.${RESET}`)
  } else {
    rules.forEach((r) => {
      const source = lockData.rules![r]?.source || "unknown"
      console.log(`  ${CYAN}◆${RESET} ${r} ${DIM}(${source})${RESET}`)
    })
  }

  // 3. 打印 Standard Skills
  console.log(`\n${BOLD}🪄  Installed Skills (Standard):${RESET}\n`)
  try {
    execSync("pnpx skills ls", { stdio: "inherit" })
  } catch (error) {
    console.log(`  ${YELLOW}No standard skills found or failed to fetch.${RESET}`)
  }

  console.log()
}
