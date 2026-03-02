import { readLockFile } from "../utils/config"
import type { VibeLockEntry } from "../types"

/**
 * Get all skills from the lock file
 */
export async function getAllLockedSkills(cwd?: string): Promise<Record<string, VibeLockEntry & { skillPath?: string }>> {
  const lock = readLockFile()
  return lock.skills ?? {}
}

/**
 * Get skills grouped by source for batch update operations
 */
export async function getSkillsBySource(
  cwd?: string,
): Promise<Map<string, { skills: string[]; entry: VibeLockEntry & { skillPath?: string } }>> {
  const lock = readLockFile()
  const bySource = new Map<string, { skills: string[]; entry: VibeLockEntry & { skillPath?: string } }>()

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
