/**
 * Safe LocalStorage utility.
 * All reads/writes go through here to handle:
 * - SSR (no window)
 * - Invalid JSON
 * - Storage quota exceeded
 * - Missing keys
 * - Corrupted data
 */

export function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    console.warn(`[SafeStorage] Failed to read key "${key}". Using fallback.`)
    return fallback
  }
}

export function safeSet<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`[SafeStorage] Storage quota exceeded for key "${key}".`)
    } else {
      console.error(`[SafeStorage] Failed to write key "${key}":`, error)
    }
    return false
  }
}

export function safeRemove(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error(`[SafeStorage] Failed to remove key "${key}":`, error)
  }
}

export function safeClear(): void {
  if (typeof window === 'undefined') return
  try {
    // Only clear Kios Mama keys, not all localStorage
    const preservedKeys = new Set([
      'kios-mama-authenticated',
      'kios-mama-user',
      'kios-mama-theme',
    ])
    const keys = Object.keys(window.localStorage).filter(k => k.startsWith('kios-mama-') && !preservedKeys.has(k))
    keys.forEach(k => window.localStorage.removeItem(k))
  } catch (error) {
    console.error('[SafeStorage] Failed to clear storage:', error)
  }
}

export function getStorageSize(): { used: number; items: number } {
  if (typeof window === 'undefined') return { used: 0, items: 0 }
  try {
    let totalSize = 0
    let itemCount = 0
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith('kios-mama-')) {
        const val = window.localStorage.getItem(key) || ''
        totalSize += key.length + val.length
        itemCount++
      }
    }
    return { used: totalSize * 2, items: itemCount } // UTF-16: ~2 bytes per char
  } catch {
    return { used: 0, items: 0 }
  }
}
