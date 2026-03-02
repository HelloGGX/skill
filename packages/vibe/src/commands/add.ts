import * as p from "@clack/prompts"
import { existsSync, mkdirSync, readdirSync } from "fs"
import path from "path"
import { cloneRepo, cleanupTempDir, GitCloneError } from "../git"
import { readLockFile, writeLockFile, ensureOpencodeConfig, updateOpencodeConfig } from "../utils/config"
import { copyToolFiles, installRules } from "../utils/file"
import { setupPythonEnvironment, getPythonActivationCmd } from "../utils/python"
import { ErrorSeverity, handleExecError } from "../utils/error"
import { ensureBunInstalled, ensurePythonInstalled } from "../utils/env"
import { OPENCODE_DIR, TOOL_SUBDIR, RULES_SUBDIR, RESET, CYAN, BG_CYAN, GREEN } from "../constants"
import {
  discoverSkills,
  installSkill,
  parseSource,
  getOwnerRepo,
  addSkillToLock,
  getSkillDisplayName
} from "../skills"

export async function runAdd(args: string[]) {
  const repository = args[0]
  if (!repository) {
    handleExecError(new Error("Repository name is missing"), "Argument Error", ErrorSeverity.ERROR)
    return
  }

  p.intro(`${BG_CYAN} vibe cli ${RESET}`)

  // Parse source to get proper URL
  const parsed = parseSource(repository)
  const repoUrl = parsed.url
  const ownerRepo = getOwnerRepo(parsed)

  p.note(`Repository: ${CYAN}${repoUrl}${RESET}\nTarget: ${CYAN}${OPENCODE_DIR}${RESET}`, "Initializing")

  const s = p.spinner()
  s.start("Fetching remote repository...")
  let tempDir: string | null = null

  try {
    // 1. Clone repository
    tempDir = await cloneRepo(repoUrl, parsed.ref)
    s.stop("Remote repository parsed.")

    // 2. Discover skills in the repository
    const skills = await discoverSkills(tempDir, parsed.subpath)

    const toolDirPath = path.join(tempDir, "tool")
    const rulesDirPath = path.join(tempDir, "rules")
    const hasTools = existsSync(toolDirPath)
    const hasRules = existsSync(rulesDirPath)
    const hasSkills = skills.length > 0

    if (!hasTools && !hasRules && !hasSkills) {
      return handleExecError(
        new Error("No skills, tools, or rules found in repository."),
        "Parse Error",
        ErrorSeverity.WARN,
      )
    }

    let selectedSkills: typeof skills = []
    let selectedTools: string[] = []
    let selectedRules: string[] = []

    // 3. UI interaction: Select Skills
    if (hasSkills) {
      const res = await p.multiselect({
        message: "Select skills to install (space to toggle)",
        options: skills.map(sk => ({
          value: sk,
          label: getSkillDisplayName(sk),
          hint: sk.description
        })),
        required: false,
      })
      if (p.isCancel(res)) return p.cancel("Installation cancelled.")
      if (Array.isArray(res)) selectedSkills = res as typeof skills
    }

    // 4. UI interaction: Select Tools
    if (hasTools) {
      const opts = readdirSync(toolDirPath)
        .filter((f) => f.endsWith(".ts"))
        .map((f) => f.replace(/\.ts$/, ""))
      if (opts.length > 0) {
        const res = await p.multiselect({
          message: "Select tools to install (space to toggle)",
          options: opts.map((t) => ({ value: t, label: t })),
          required: false,
        })
        if (p.isCancel(res)) return p.cancel("Installation cancelled.")
        if (Array.isArray(res)) selectedTools = res as string[]
      }
    }

    // 5. UI interaction: Select Rules
    if (hasRules) {
      const opts = readdirSync(rulesDirPath, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== "common")
        .map((d) => d.name)
      if (opts.length > 0) {
        const res = await p.multiselect({
          message: "Select rule categories to install",
          options: opts.map((r) => ({ value: r, label: r })),
          required: false,
        })
        if (p.isCancel(res)) return p.cancel("Installation cancelled.")
        if (Array.isArray(res)) selectedRules = res as string[]
      }
    }

    if (selectedSkills.length === 0 && selectedTools.length === 0 && selectedRules.length === 0) {
      return p.cancel("No skills, tools, or rules selected.")
    }

    // 6. Environment checks
    let requiresPython = false

    if (selectedTools.length > 0) {
      p.log.step("Checking system environments...")

      const bunReady = await ensureBunInstalled()
      if (!bunReady) {
        selectedTools = []
        p.log.warn("Skipping tool installation (Bun not available).")
      } else {
        for (const tool of selectedTools) {
          if (existsSync(path.join(toolDirPath, `${tool}.py`))) {
            requiresPython = true
            break
          }
        }
        if (requiresPython) {
          ensurePythonInstalled()
        }
      }
    }

    // 7. Install skills, tools, and rules
    const installSpinner = p.spinner()
    installSpinner.start(`Installing to ${OPENCODE_DIR}/ ...`)

    ensureOpencodeConfig()
    const lockData = readLockFile()
    const now = new Date().toISOString()
    let installedRulePaths: string[] = []

    // Install Skills
    if (selectedSkills.length > 0) {
      for (const skill of selectedSkills) {
        const result = await installSkill(skill)
        if (result.success) {
          await addSkillToLock(skill.name, {
            source: ownerRepo || repoUrl,
            sourceType: parsed.type,
            sourceUrl: repoUrl,
            skillPath: parsed.subpath
          })
        }
      }
    }

    // Install Tools
    if (selectedTools.length > 0) {
      const targetToolDir = path.join(process.cwd(), OPENCODE_DIR, TOOL_SUBDIR)
      if (!existsSync(targetToolDir)) mkdirSync(targetToolDir, { recursive: true })

      for (const tool of selectedTools) {
        copyToolFiles(tool, toolDirPath, targetToolDir)
        if (lockData.tools) lockData.tools[tool] = { source: repoUrl, installedAt: now }
      }
    }

    // Install Rules
    if (selectedRules.length > 0) {
      const targetRulesDir = path.join(process.cwd(), OPENCODE_DIR, RULES_SUBDIR)
      installedRulePaths = installRules(selectedRules, rulesDirPath, targetRulesDir)

      for (const rule of selectedRules) {
        if (!lockData.rules) lockData.rules = {}
        lockData.rules[rule] = { source: repoUrl, installedAt: now }
      }
    }

    // Update config and lock files
    updateOpencodeConfig(selectedTools, installedRulePaths)
    writeLockFile(lockData)

    if (requiresPython) setupPythonEnvironment(process.cwd(), installSpinner)

    await new Promise((r) => setTimeout(r, 400))
    installSpinner.stop(`${GREEN}Successfully installed ${selectedSkills.length + selectedTools.length + selectedRules.length} items.${RESET}`)

    if (requiresPython) {
      p.note(
        `Your Python tools are ready. Run the following command to activate the environment:\n\n  ${CYAN}${getPythonActivationCmd()}${RESET}`,
        "🐍 Python Environment",
      )
    }
  } catch (error) {
    if (s) s.stop("Failed to fetch repository.")
    if (error instanceof GitCloneError) {
      handleExecError(error, "Git Error", ErrorSeverity.ERROR)
    } else {
      handleExecError(error, "Repository Fetch Error", ErrorSeverity.ERROR)
    }
  } finally {
    if (tempDir) await cleanupTempDir(tempDir).catch(() => {})
  }

  p.outro(`✨ Workspace updated for ${CYAN}${OPENCODE_DIR}${RESET}`)
}
