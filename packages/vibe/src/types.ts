export interface VibeLock {
  version: number
  tools: Record<string, { source: string; installedAt: string }>
  rules?: Record<string, { source: string; installedAt: string }>
  skills?: Record<string, SkillLockEntry>
}

export interface SkillLockEntry {
  source: string
  sourceType: string
  sourceUrl: string
  skillPath?: string
  installedAt: string
  updatedAt: string
}

export interface Skill {
  name: string
  description: string
  path: string
  rawContent: string
  metadata?: any
}

export interface OpencodeConfig {
  $schema?: string
  theme?: string
  instructions?: string[]
  mcp?: Record<string, any>
  tools?: Record<string, boolean>
  permission?: Record<string, any>
}