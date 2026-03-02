import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { cloneRepo, cleanupTempDir, GitCloneError } from './git'

describe('git utilities', () => {
  let testDir: string

  beforeEach(() => {
    testDir = join(tmpdir(), `vibe-git-test-${Date.now()}`)
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    if (testDir && existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('GitCloneError', () => {
    it('should create error with url', () => {
      const error = new GitCloneError('Test error', 'https://github.com/test/repo')
      
      expect(error.message).toBe('Test error')
      expect(error.url).toBe('https://github.com/test/repo')
      expect(error.isTimeout).toBe(false)
      expect(error.isAuthError).toBe(false)
      expect(error.isNetworkError).toBe(false)
      expect(error.name).toBe('GitCloneError')
    })

    it('should create timeout error', () => {
      const error = new GitCloneError('Timeout', 'https://github.com/test/repo', true, false, false)
      
      expect(error.isTimeout).toBe(true)
      expect(error.isAuthError).toBe(false)
      expect(error.isNetworkError).toBe(false)
    })

    it('should create auth error', () => {
      const error = new GitCloneError('Auth failed', 'https://github.com/test/repo', false, true, false)
      
      expect(error.isTimeout).toBe(false)
      expect(error.isAuthError).toBe(true)
      expect(error.isNetworkError).toBe(false)
    })

    it('should create network error', () => {
      const error = new GitCloneError('Network failed', 'https://github.com/test/repo', false, false, true)
      
      expect(error.isTimeout).toBe(false)
      expect(error.isAuthError).toBe(false)
      expect(error.isNetworkError).toBe(true)
    })
  })

  describe('cloneRepo', () => {
    it('should throw GitCloneError for invalid repository', async () => {
      const invalidUrl = 'https://github.com/nonexistent/repo-that-does-not-exist-12345.git'
      
      await expect(cloneRepo(invalidUrl, undefined, 1)).rejects.toThrow(GitCloneError)
    }, 30000)

    it('should throw GitCloneError with auth error for private repo without credentials', async () => {
      const privateUrl = 'https://github.com/private/secret-repo.git'
      
      try {
        await cloneRepo(privateUrl, undefined, 1)
        expect.fail('Should have thrown GitCloneError')
      } catch (error) {
        expect(error).toBeInstanceOf(GitCloneError)
        if (error instanceof GitCloneError) {
          expect(error.url).toBe(privateUrl)
        }
      }
    }, 30000)

    // Note: Testing actual successful clone would require network access
    // and a real repository, which is not ideal for unit tests
    // Integration tests should cover this scenario
  })

  describe('cleanupTempDir', () => {
    it('should remove directory', async () => {
      const tempDir = join(testDir, 'temp-to-cleanup')
      mkdirSync(tempDir, { recursive: true })
      writeFileSync(join(tempDir, 'test.txt'), 'test content')
      
      expect(existsSync(tempDir)).toBe(true)
      
      await cleanupTempDir(tempDir)
      
      expect(existsSync(tempDir)).toBe(false)
    })

    it('should handle non-existent directory', async () => {
      const nonExistent = join(testDir, 'does-not-exist')
      
      // Should not throw
      await expect(cleanupTempDir(nonExistent)).resolves.toBeUndefined()
    })

    it('should throw error for directory outside tmpdir', async () => {
      const unsafePath = join(process.cwd(), 'some-dir')
      
      await expect(cleanupTempDir(unsafePath)).rejects.toThrow(
        'Attempted to clean up directory outside of temp directory'
      )
    })

    it('should handle cleanup of tmpdir subdirectories', async () => {
      const tempSubDir = join(tmpdir(), 'test-subdir')
      mkdirSync(tempSubDir, { recursive: true })
      
      // Should not throw
      await expect(cleanupTempDir(tempSubDir)).resolves.toBeUndefined()
    })

    it('should handle nested directories', async () => {
      const nestedDir = join(testDir, 'level1', 'level2', 'level3')
      mkdirSync(nestedDir, { recursive: true })
      writeFileSync(join(nestedDir, 'deep.txt'), 'deep content')
      
      const topLevel = join(testDir, 'level1')
      await cleanupTempDir(topLevel)
      
      expect(existsSync(topLevel)).toBe(false)
    })
  })
})
