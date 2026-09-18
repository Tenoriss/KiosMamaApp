import { safeGet, safeSet } from './safe-storage'
import { STORAGE_KEYS, STORAGE_VERSION } from '@/lib/constants/storage-keys'

type StorageMeta = {
  version: number
  initializedAt: string
  lastUpdatedAt: string
}

export function getStorageMeta(): StorageMeta | null {
  return safeGet<StorageMeta | null>(STORAGE_KEYS.META, null)
}

export function initializeStorage(): void {
  const existing = getStorageMeta()
  if (existing) return

  // First time initialization - set up empty collections and metadata
  const meta: StorageMeta = {
    version: STORAGE_VERSION,
    initializedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  }
  safeSet(STORAGE_KEYS.META, meta)

  // Initialize all collections as empty arrays
  safeSet(STORAGE_KEYS.PRODUCTS, [])
  safeSet(STORAGE_KEYS.CATEGORIES, [])
  safeSet(STORAGE_KEYS.SUPPLIERS, [])
  safeSet(STORAGE_KEYS.CUSTOMERS, [])
  safeSet(STORAGE_KEYS.SALES, [])
  safeSet(STORAGE_KEYS.PURCHASES, [])
  safeSet(STORAGE_KEYS.EXPENSES, [])
  safeSet(STORAGE_KEYS.STOCK_MOVEMENTS, [])
  safeSet(STORAGE_KEYS.RECEIVABLES, [])
  safeSet(STORAGE_KEYS.PAYABLES, [])
  safeSet(STORAGE_KEYS.AUDIT_LOGS, [])
  safeSet(STORAGE_KEYS.NOTIFICATIONS, [])
}

export function isStorageInitialized(): boolean {
  return getStorageMeta() !== null
}

export function updateStorageMeta(): void {
  const meta = getStorageMeta()
  if (meta) {
    safeSet(STORAGE_KEYS.META, { ...meta, lastUpdatedAt: new Date().toISOString() })
  }
}
