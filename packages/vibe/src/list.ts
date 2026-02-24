import { execSync } from "child_process"
import { readLockFile } from "./add"
import { BOLD, CYAN, DIM, OPENCODE_DIR, RESET, TOOL_SUBDIR, YELLOW } from "./constants"

export async function runList(args: string[]) {
  // 1. 打印本地 Tools (使用常量动态拼接提示)
  console.log(`\n${BOLD}🛠️  Installed Tools (${OPENCODE_DIR}/${TOOL_SUBDIR}):${RESET}\n`)

  const lockData = readLockFile()
  const tools = Object.keys(lockData.tools)

  if (tools.length === 0) {
    console.log(`  ${DIM}No tools installed yet.${RESET}`)
  } else {
    tools.forEach((t) => {
      const source = lockData.tools[t]?.source || "unknown"
      console.log(`  ${CYAN}◆${RESET} ${t} ${DIM}(${source})${RESET}`)
    })
  }

  // 2. 打印标准 Skills
  console.log(`\n${BOLD}🪄  Installed Skills (Standard):${RESET}\n`)
  try {
    execSync("pnpx skills ls", { stdio: "inherit" })
  } catch (error) {
    console.log(`  ${YELLOW}No standard skills found or failed to fetch.${RESET}`)
  }
  console.log()
}
