import { safeGet, safeSet } from '@/lib/storage/safe-storage'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import type { Supplier, Customer, CreateSupplierInput, CreateCustomerInput, UpdateSupplierInput, UpdateCustomerInput } from '@/lib/types/parties'

export interface ISupplierRepository {
  getAll(): Promise<Supplier[]>
  getById(id: string): Promise<Supplier | null>
  create(data: CreateSupplierInput): Promise<Supplier>
  update(id: string, data: UpdateSupplierInput): Promise<Supplier | null>
  delete(id: string): Promise<boolean>
}

export class LocalStorageSupplierRepository implements ISupplierRepository {
  private getAll_raw(): Supplier[] { return safeGet<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []) }
  private saveAll(items: Supplier[]): void { safeSet(STORAGE_KEYS.SUPPLIERS, items) }

  async getAll(): Promise<Supplier[]> { return this.getAll_raw() }
  async getById(id: string): Promise<Supplier | null> {
    return this.getAll_raw().find(s => s.id === id) ?? null
  }
  async create(data: CreateSupplierInput): Promise<Supplier> {
    const items = this.getAll_raw()
    const now = new Date().toISOString()
    const newItem: Supplier = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    this.saveAll([...items, newItem])
    return newItem
  }
  async update(id: string, data: UpdateSupplierInput): Promise<Supplier | null> {
    const items = this.getAll_raw()
    const index = items.findIndex(s => s.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...data, id, updatedAt: new Date().toISOString() }
    this.saveAll(items)
    return items[index]
  }
  async delete(id: string): Promise<boolean> {
    const items = this.getAll_raw()
    const filtered = items.filter(s => s.id !== id)
    if (filtered.length === items.length) return false
    this.saveAll(filtered)
    return true
  }
}

export interface ICustomerRepository {
  getAll(): Promise<Customer[]>
  getById(id: string): Promise<Customer | null>
  create(data: CreateCustomerInput): Promise<Customer>
  update(id: string, data: UpdateCustomerInput): Promise<Customer | null>
  delete(id: string): Promise<boolean>
}

export class LocalStorageCustomerRepository implements ICustomerRepository {
  private getAll_raw(): Customer[] { return safeGet<Customer[]>(STORAGE_KEYS.CUSTOMERS, []) }
  private saveAll(items: Customer[]): void { safeSet(STORAGE_KEYS.CUSTOMERS, items) }

  async getAll(): Promise<Customer[]> { return this.getAll_raw() }
  async getById(id: string): Promise<Customer | null> {
    return this.getAll_raw().find(c => c.id === id) ?? null
  }
  async create(data: CreateCustomerInput): Promise<Customer> {
    const items = this.getAll_raw()
    const now = new Date().toISOString()
    const newItem: Customer = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    this.saveAll([...items, newItem])
    return newItem
  }
  async update(id: string, data: UpdateCustomerInput): Promise<Customer | null> {
    const items = this.getAll_raw()
    const index = items.findIndex(c => c.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...data, id, updatedAt: new Date().toISOString() }
    this.saveAll(items)
    return items[index]
  }
  async delete(id: string): Promise<boolean> {
    const items = this.getAll_raw()
    const filtered = items.filter(c => c.id !== id)
    if (filtered.length === items.length) return false
    this.saveAll(filtered)
    return true
  }
}
