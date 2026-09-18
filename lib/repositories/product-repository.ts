import { safeGet, safeSet } from '@/lib/storage/safe-storage'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import type { Product, Category, CreateProductInput, UpdateProductInput } from '@/lib/types/product'

// Repository interface - can be replaced by Prisma implementation later
export interface IProductRepository {
  getAll(): Promise<Product[]>
  getActive(): Promise<Product[]>
  getById(id: string): Promise<Product | null>
  search(query: string): Promise<Product[]>
  findByBarcode(barcode: string): Promise<Product | null>
  findBySku(sku: string): Promise<Product | null>
  create(data: CreateProductInput): Promise<Product>
  update(id: string, data: UpdateProductInput): Promise<Product | null>
  delete(id: string): Promise<boolean>
  getAll_sync(): Product[]
}

export interface ICategoryRepository {
  getAll(): Promise<Category[]>
  getById(id: string): Promise<Category | null>
  create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>
  update(id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category | null>
  delete(id: string): Promise<boolean>
}

// LocalStorage implementation
export class LocalStorageProductRepository implements IProductRepository {
  private getAll_raw(): Product[] {
    return safeGet<Product[]>(STORAGE_KEYS.PRODUCTS, [])
  }

  private saveAll(products: Product[]): void {
    safeSet(STORAGE_KEYS.PRODUCTS, products)
  }

  getAll_sync(): Product[] {
    return this.getAll_raw()
  }

  async getAll(): Promise<Product[]> {
    return this.getAll_raw()
  }

  async getActive(): Promise<Product[]> {
    return this.getAll_raw().filter(p => p.isActive)
  }

  async getById(id: string): Promise<Product | null> {
    return this.getAll_raw().find(p => p.id === id) ?? null
  }

  async search(query: string): Promise<Product[]> {
    const q = query.toLowerCase().trim()
    if (!q) return this.getAll_raw()
    return this.getAll_raw().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q) ||
      p.variant?.toLowerCase().includes(q)
    )
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.getAll_raw().find(p => p.barcode === barcode) ?? null
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.getAll_raw().find(p => p.sku === sku) ?? null
  }

  async create(data: CreateProductInput): Promise<Product> {
    const products = this.getAll_raw()
    const now = new Date().toISOString()
    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    this.saveAll([...products, newProduct])
    return newProduct
  }

  async update(id: string, data: UpdateProductInput): Promise<Product | null> {
    const products = this.getAll_raw()
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return null
    const updated: Product = {
      ...products[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }
    products[index] = updated
    this.saveAll(products)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const products = this.getAll_raw()
    const filtered = products.filter(p => p.id !== id)
    if (filtered.length === products.length) return false
    this.saveAll(filtered)
    return true
  }
}

export class LocalStorageCategoryRepository implements ICategoryRepository {
  private getAll_raw(): Category[] {
    return safeGet<Category[]>(STORAGE_KEYS.CATEGORIES, [])
  }

  private saveAll(categories: Category[]): void {
    safeSet(STORAGE_KEYS.CATEGORIES, categories)
  }

  async getAll(): Promise<Category[]> {
    return this.getAll_raw()
  }

  async getById(id: string): Promise<Category | null> {
    return this.getAll_raw().find(c => c.id === id) ?? null
  }

  async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const categories = this.getAll_raw()
    const now = new Date().toISOString()
    const newCategory: Category = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    this.saveAll([...categories, newCategory])
    return newCategory
  }

  async update(id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category | null> {
    const categories = this.getAll_raw()
    const index = categories.findIndex(c => c.id === id)
    if (index === -1) return null
    const updated: Category = {
      ...categories[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    }
    categories[index] = updated
    this.saveAll(categories)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const categories = this.getAll_raw()
    const filtered = categories.filter(c => c.id !== id)
    if (filtered.length === categories.length) return false
    this.saveAll(filtered)
    return true
  }
}
