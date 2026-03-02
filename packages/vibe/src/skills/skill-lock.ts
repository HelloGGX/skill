import { readFile, writeFile, mkdir } from "fs/promises"
import { join, dirname } from "path"
import type { SkillLockEntry } from "../types"
import { LOCK_FILE, OPENCODE_DIR } from "../constants"

export interface SkillLockFile {
  version: number
  tools: Record<string, { source: string; installedAt: string }>
  rules?: Record<string, { source: string; installedAt: string }>
  skills?: Record<string, SkillLockEntry>
}

/**
 * Get the path to the skill lock file
 */
export function getSkillLockPath(cwd?: string): string {
  const baseDir = cwd || process.cwd()
  return join(baseDir, OPENCODE_DIR, LOCK_FILE)
}

/**
 * Read the skill lock file
 */
export async function readSkillLock(cwd?: string): Promise<SkillLockFile> {
  const lockPath = getSkillLockPath(cwd)

  try {
    const content = await readFile(lockPath, "utf-8")
    const parsed = JSON.parse(content) as SkillLockFile

    if (!parsed.skills) {
      parsed.skills = {}
    }
    if (!parsed.tools) {
      parsed.tools = {}
    }
    if (!parsed.rules) {
      parsed.rules = {}
    }

    return parsed
  } catch {
    return createEmptyLockFile()
  }
}

/**
 * Write the skill lock file
 */
export async function writeSkillLock(lock: SkillLockFile, cwd?: string): Promise<void> {
  const lockPath = getSkillLockPath(cwd)

  await mkdir(dirname(lockPath), { recursive: true })

  const content = JSON.stringify(lock, null, 2)
  await writeFile(lockPath, content, "utf-8")
}

/**
 * Add or update a skill entry in the lock file
 */
export async function addSkillToLock(
  skillName: string,
  entry: Omit<SkillLockEntry, "installedAt" | "updatedAt">,
  cwd?: string,
): Promise<void> {
  const lock = await readSkillLock(cwd)
  const now = new Date().toISOString()

  const existingEntry = lock.skills?.[skillName]

  if (!lock.skills) {
    lock.skills = {}
  }

  lock.skills[skillName] = {
    ...entry,
    installedAt: existingEntry?.installedAt ?? now,
    updatedAt: now,
  }

  await writeSkillLock(lock, cwd)
}

/**
 * Remove a skill from the lock file
 */
export async function removeSkillFromLock(skillName: string, cwd?: string): Promise<boolean> {
  const lock = await readSkillLock(cwd)

  if (!lock.skills || !(skillName in lock.skills)) {
    return false
  }

  delete lock.skills[skillName]
  await writeSkillLock(lock, cwd)
  return true
}

/**
 * Get a skill entry from the lock file
 */
export async function getSkillFromLock(skillName: string, cwd?: string): Promise<SkillLockEntry | null> {
  const lock = await readSkillLock(cwd)
  return lock.skills?.[skillName] ?? null
}

/**
 * Get all skills from the lock file
 */
export async function getAllLockedSkills(cwd?: string): Promise<Record<string, SkillLockEntry>> {
  const lock = await readSkillLock(cwd)
  return lock.skills ?? {}
}

/**
 * Get skills grouped by source for batch update operations
 */
export async function getSkillsBySource(
  cwd?: string,
): Promise<Map<string, { skills: string[]; entry: SkillLockEntry }>> {
  const lock = await readSkillLock(cwd)
  const bySource = new Map<string, { skills: string[]; entry: SkillLockEntry }>()

  if (!lock.skills) {
    return bySource
  }

  for (const [skillName, entry] of Object.entries(lock.skills)) {
    const existing = bySource.get(entry.source)
    if (existing) {
      existing.skills.push(skillName)
    } else {
      bySource.set(entry.source, { skills: [skillName], entry })
    }
  }

  return bySource
}

/**
 * Create an empty lock file structure
 */
function createEmptyLockFile(): SkillLockFile {
  return {
    version: 1,
    tools: {},
    rules: {},
    skills: {},
  }
}
