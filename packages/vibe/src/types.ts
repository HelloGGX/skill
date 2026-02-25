export interface VibeLock {
  version: number
  tools: Record<string, { source: string; installedAt: string }>
  rules?: Record<string, { source: string; installedAt: string }>
}

export interface OpencodeConfig {
  $schema?: string
  theme?: string
  instructions?: string[]
  mcp?: Record<string, any>
  tools?: Record<string, boolean>
  permission?: Record<string, any>
}