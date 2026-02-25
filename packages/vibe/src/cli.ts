import { runAdd } from "./commands/add"
import { runList } from "./commands/list"
import { runUpdate } from "./commands/update"
import { RESET, BOLD, CYAN, DIM, TEXT } from "./constants"

const VIBE_LOGO = [
  "██╗   ██╗██╗██████╗ ███████╗",
  "██║   ██║██║██╔══██╗██╔════╝",
  "██║   ██║██║██████╔╝█████╗  ",
  "╚██╗ ██╔╝██║██╔══██╗██╔══╝  ",
  " ╚████╔╝ ██║██████╔╝███████╗",
  "  ╚═══╝  ╚═╝╚═════╝ ╚══════╝",
]

// 256-color middle grays - visible on both light and dark backgrounds
const GRAYS = [
  '\x1b[38;5;250m', // lighter gray
  '\x1b[38;5;248m',
  '\x1b[38;5;245m', // mid gray
  '\x1b[38;5;243m',
  '\x1b[38;5;240m',
  '\x1b[38;5;238m', // darker gray
];

function showLogo(): void {
  console.log();
  VIBE_LOGO.forEach((line, i) => {
    // 确保 i 不会越界，虽然这里刚好都是 6 行
    const color = GRAYS[i] || GRAYS[GRAYS.length - 1]; 
    console.log(`${color}${line}${RESET}`);
  });
  console.log();
}

function showBanner() {
  showLogo()
  console.log(`${DIM}The Design-Driven Agent Skills Ecosystem for OpenCode${RESET}`)
  console.log()
  console.log(`  ${DIM}$${RESET} ${TEXT}vibe add <repository>${RESET}    ${DIM}Add skills & tools${RESET}`)
  console.log(`  ${DIM}$${RESET} ${TEXT}vibe list${RESET}                ${DIM}List installed tools & skills${RESET}`)
  console.log(`  ${DIM}$${RESET} ${TEXT}vibe update${RESET}              ${DIM}Update installed tools & skills${RESET}`)
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
  update, up           Update all local tools and standard skills

${BOLD}Options:${RESET}
  --help, -h        Show this help message

${BOLD}Examples:${RESET}
  ${DIM}$${RESET} vibe add helloggx/skill
  ${DIM}$${RESET} vibe list                          ${DIM}# list installed tools and skills${RESET}
  ${DIM}$${RESET} vibe update                        ${DIM}# check and update all items${RESET}

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
    case "up":
    case "update":
      await runUpdate(args.slice(1))
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