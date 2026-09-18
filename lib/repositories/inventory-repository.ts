import { safeGet, safeSet } from '@/lib/storage/safe-storage'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import type { Purchase, CreatePurchaseInput } from '@/lib/types/purchase'
import type { StockMovement, CreateStockMovementInput } from '@/lib/types/inventory'

// Purchase Repository
export interface IPurchaseRepository {
  getAll(): Promise<Purchase[]>
  getById(id: string): Promise<Purchase | null>
  create(data: CreatePurchaseInput): Promise<Purchase>
  update(id: string, data: Partial<Purchase>): Promise<Purchase | null>
  getAll_sync(): Purchase[]
}

export class LocalStoragePurchaseRepository implements IPurchaseRepository {
  private getAll_raw(): Purchase[] { return safeGet<Purchase[]>(STORAGE_KEYS.PURCHASES, []) }
  private saveAll(items: Purchase[]): void { safeSet(STORAGE_KEYS.PURCHASES, items) }

  getAll_sync(): Purchase[] { return this.getAll_raw() }
  async getAll(): Promise<Purchase[]> { return this.getAll_raw() }
  async getById(id: string): Promise<Purchase | null> {
    return this.getAll_raw().find(p => p.id === id) ?? null
  }
  async create(data: CreatePurchaseInput): Promise<Purchase> {
    const items = this.getAll_raw()
    const newItem: Purchase = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    this.saveAll([...items, newItem])
    return newItem
  }
  async update(id: string, data: Partial<Purchase>): Promise<Purchase | null> {
    const items = this.getAll_raw()
    const index = items.findIndex(p => p.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...data, id }
    this.saveAll(items)
    return items[index]
  }
}

// Stock Movement Repository
export interface IStockMovementRepository {
  getAll(): Promise<StockMovement[]>
  getByProductId(productId: string): Promise<StockMovement[]>
  create(data: CreateStockMovementInput): Promise<StockMovement>
  getAll_sync(): StockMovement[]
}

export class LocalStorageStockMovementRepository implements IStockMovementRepository {
  private getAll_raw(): StockMovement[] { return safeGet<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []) }
  private saveAll(items: StockMovement[]): void { safeSet(STORAGE_KEYS.STOCK_MOVEMENTS, items) }

  getAll_sync(): StockMovement[] { return this.getAll_raw() }
  async getAll(): Promise<StockMovement[]> { return this.getAll_raw() }
  async getByProductId(productId: string): Promise<StockMovement[]> {
    return this.getAll_raw().filter(m => m.productId === productId)
  }
  async create(data: CreateStockMovementInput): Promise<StockMovement> {
    const items = this.getAll_raw()
    const newItem: StockMovement = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    this.saveAll([...items, newItem])
    return newItem
  }
}
