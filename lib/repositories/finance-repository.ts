import { safeGet, safeSet } from '@/lib/storage/safe-storage'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import type { Sale, CreateSaleInput } from '@/lib/types/sale'
import type { Expense, CreateExpenseInput, Receivable, Payable } from '@/lib/types/finance'

// Sale Repository
export interface ISaleRepository {
  getAll(): Promise<Sale[]>
  getById(id: string): Promise<Sale | null>
  getByInvoiceNumber(invoiceNumber: string): Promise<Sale | null>
  create(data: CreateSaleInput): Promise<Sale>
  update(id: string, data: Partial<Sale>): Promise<Sale | null>
  getAll_sync(): Sale[]
}

export class LocalStorageSaleRepository implements ISaleRepository {
  private getAll_raw(): Sale[] {
    return safeGet<Sale[]>(STORAGE_KEYS.SALES, [])
  }
  private saveAll(sales: Sale[]): void {
    safeSet(STORAGE_KEYS.SALES, sales)
  }

  getAll_sync(): Sale[] { return this.getAll_raw() }
  async getAll(): Promise<Sale[]> { return this.getAll_raw() }
  async getById(id: string): Promise<Sale | null> {
    return this.getAll_raw().find(s => s.id === id) ?? null
  }
  async getByInvoiceNumber(invoiceNumber: string): Promise<Sale | null> {
    return this.getAll_raw().find(s => s.invoiceNumber === invoiceNumber) ?? null
  }
  async create(data: CreateSaleInput): Promise<Sale> {
    const sales = this.getAll_raw()
    const newSale: Sale = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    this.saveAll([...sales, newSale])
    return newSale
  }
  async update(id: string, data: Partial<Sale>): Promise<Sale | null> {
    const sales = this.getAll_raw()
    const index = sales.findIndex(s => s.id === id)
    if (index === -1) return null
    sales[index] = { ...sales[index], ...data, id }
    this.saveAll(sales)
    return sales[index]
  }
}

// Expense Repository
export interface IExpenseRepository {
  getAll(): Promise<Expense[]>
  create(data: CreateExpenseInput): Promise<Expense>
  delete(id: string): Promise<boolean>
  getAll_sync(): Expense[]
}

export class LocalStorageExpenseRepository implements IExpenseRepository {
  private getAll_raw(): Expense[] { return safeGet<Expense[]>(STORAGE_KEYS.EXPENSES, []) }
  private saveAll(items: Expense[]): void { safeSet(STORAGE_KEYS.EXPENSES, items) }

  getAll_sync(): Expense[] { return this.getAll_raw() }
  async getAll(): Promise<Expense[]> { return this.getAll_raw() }
  async create(data: CreateExpenseInput): Promise<Expense> {
    const items = this.getAll_raw()
    const newItem: Expense = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    this.saveAll([...items, newItem])
    return newItem
  }
  async delete(id: string): Promise<boolean> {
    const items = this.getAll_raw()
    const filtered = items.filter(i => i.id !== id)
    if (filtered.length === items.length) return false
    this.saveAll(filtered)
    return true
  }
}

// Receivable Repository
export interface IReceivableRepository {
  getAll(): Promise<Receivable[]>
  getById(id: string): Promise<Receivable | null>
  create(data: Omit<Receivable, 'id'>): Promise<Receivable>
  update(id: string, data: Partial<Receivable>): Promise<Receivable | null>
  getAll_sync(): Receivable[]
}

export class LocalStorageReceivableRepository implements IReceivableRepository {
  private getAll_raw(): Receivable[] { return safeGet<Receivable[]>(STORAGE_KEYS.RECEIVABLES, []) }
  private saveAll(items: Receivable[]): void { safeSet(STORAGE_KEYS.RECEIVABLES, items) }

  getAll_sync(): Receivable[] { return this.getAll_raw() }
  async getAll(): Promise<Receivable[]> { return this.getAll_raw() }
  async getById(id: string): Promise<Receivable | null> {
    return this.getAll_raw().find(r => r.id === id) ?? null
  }
  async create(data: Omit<Receivable, 'id'>): Promise<Receivable> {
    const items = this.getAll_raw()
    const newItem: Receivable = { ...data, id: crypto.randomUUID() }
    this.saveAll([...items, newItem])
    return newItem
  }
  async update(id: string, data: Partial<Receivable>): Promise<Receivable | null> {
    const items = this.getAll_raw()
    const index = items.findIndex(r => r.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...data, id }
    this.saveAll(items)
    return items[index]
  }
}

// Payable Repository
export interface IPayableRepository {
  getAll(): Promise<Payable[]>
  getById(id: string): Promise<Payable | null>
  create(data: Omit<Payable, 'id'>): Promise<Payable>
  update(id: string, data: Partial<Payable>): Promise<Payable | null>
  delete(id: string): Promise<boolean>
  getAll_sync(): Payable[]
}

export class LocalStoragePayableRepository implements IPayableRepository {
  private getAll_raw(): Payable[] { return safeGet<Payable[]>(STORAGE_KEYS.PAYABLES, []) }
  private saveAll(items: Payable[]): void { safeSet(STORAGE_KEYS.PAYABLES, items) }

  getAll_sync(): Payable[] { return this.getAll_raw() }
  async getAll(): Promise<Payable[]> { return this.getAll_raw() }
  async getById(id: string): Promise<Payable | null> {
    return this.getAll_raw().find(p => p.id === id) ?? null
  }
  async create(data: Omit<Payable, 'id'>): Promise<Payable> {
    const items = this.getAll_raw()
    const newItem: Payable = { ...data, id: crypto.randomUUID() }
    this.saveAll([...items, newItem])
    return newItem
  }
  async update(id: string, data: Partial<Payable>): Promise<Payable | null> {
    const items = this.getAll_raw()
    const index = items.findIndex(p => p.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...data, id }
    this.saveAll(items)
    return items[index]
  }

  async delete(id: string): Promise<boolean> {
    const items = this.getAll_raw()
    const filtered = items.filter(item => item.id !== id)
    if (filtered.length === items.length) return false
    this.saveAll(filtered)
    return true
  }
}
