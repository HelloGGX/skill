import { runAdd, readLockFile } from "./add"

// ==========================================
// 1. 原生 UI & 颜色定义
// ==========================================
const RESET = "\x1b[0m"
const BOLD = "\x1b[1m"
const CYAN = "\x1b[36m"
const DIM = "\x1b[38;5;102m"
const TEXT = "\x1b[38;5;145m"

const VIBE_LOGO = [
  "██╗   ██╗██╗██████╗ ███████╗",
  "██║   ██║██║██╔══██╗██╔════╝",
  "██║   ██║██║██████╔╝█████╗  ",
  "╚██╗ ██╔╝██║██╔══██╗██╔══╝  ",
  " ╚████╔╝ ██║██████╔╝███████╗",
  "  ╚═══╝  ╚═╝╚═════╝ ╚══════╝",
]

function showLogo() {
  console.log()
  VIBE_LOGO.forEach((line) => console.log(`${CYAN}${line}${RESET}`))
  console.log()
}

function showBanner() {
  showLogo()
  console.log(`${DIM}The Design-Driven Agent Skills Ecosystem${RESET}`)
  console.log()
  console.log(`  ${DIM}$${RESET} ${TEXT}vibe add <repository>${RESET}    ${DIM}Add skills & tools${RESET}`)
  console.log(`  ${DIM}$${RESET} ${TEXT}vibe list${RESET}                ${DIM}List installed tools${RESET}`)
  console.log()
  console.log(`${DIM}Example:${RESET} vibe add helloggx/skill --agent opencode`)
  console.log()
}

async function runList(args: string[]) {
  let agentName = "opencode"
  const agentIdx = args.indexOf("--agent")
  if (agentIdx !== -1 && args.length > agentIdx + 1) agentName = args[agentIdx + 1]!

  const lockData = readLockFile(agentName)
  const tools = Object.keys(lockData.tools)

  console.log(`\n${BOLD}Installed tools for .${agentName}:${RESET}\n`)
  if (tools.length === 0) {
    console.log(`${DIM}No tools installed yet.${RESET}`)
  } else {
    tools.forEach((t) => console.log(`  ${CYAN}◆${RESET} ${t} ${DIM}(${lockData.tools[t]?.source})${RESET}`))
  }
  console.log()
}

// ==========================================
// 2. Command Router (路由分发)
// ==========================================
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === "-h" || command === "--help") {
    showBanner()
    return
  }

  switch (command) {
    case "a":
    case "add":
      console.clear()
      showLogo() // 在转交控制权之前打印全局 Logo
      await runAdd(args.slice(1))
      break
    case "ls":
    case "list":
      await runList(args.slice(1))
      break
    default:
      console.log(`${CYAN}vibe:${RESET} Unknown command '${command}'`)
      console.log(`Run ${BOLD}vibe --help${RESET} for usage.`)
      break
  }
}

main().catch((err) => {
  console.error(`${CYAN}Fatal error:${RESET}`, err)
  process.exit(1)
})
