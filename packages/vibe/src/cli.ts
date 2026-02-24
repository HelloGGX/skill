import { runAdd } from "./add"
import { runList } from "./list"

// ==========================================
// 本地 UI & 颜色定义
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
  console.log(`${DIM}The Design-Driven Agent Skills Ecosystem for OpenCode${RESET}`)
  console.log()
  console.log(`  ${DIM}$${RESET} ${TEXT}vibe add <repository>${RESET}    ${DIM}Add skills & tools${RESET}`)
  console.log(`  ${DIM}$${RESET} ${TEXT}vibe list${RESET}                ${DIM}List installed tools${RESET}`)
  console.log()
  console.log(`${DIM}Example:${RESET} vibe add helloggx/skill`)
  console.log()
}

function showHelp(): void {
  console.log(`
${BOLD}Usage:${RESET} vibe <command> [options]

${BOLD}Manage Tools & Skills:${RESET}
  add <package>        Add a tool package (alias: a)
                       e.g. helloggx/skill
                            https://github.com/helloggx/skill
  list, ls             List installed tools & skills for .opencode

${BOLD}Options:${RESET}
  --help, -h        Show this help message

${BOLD}Examples:${RESET}
  ${DIM}$${RESET} vibe add helloggx/skill
  ${DIM}$${RESET} vibe list                          ${DIM}# list installed tools and skills${RESET}

The Design-Driven Agent Skills Ecosystem
`)
}

// ==========================================
// Command Router (路由分发)
// ==========================================
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    showBanner()
    return
  }

  const command = args[0]

  switch (command) {
    case "a":
    case "add":
      console.clear()
      showLogo()
      await runAdd(args.slice(1))
      break
    case "ls":
    case "list":
      await runList(args.slice(1))
      break
    case "--help":
    case "-h":
    case "help":
      showHelp()
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
