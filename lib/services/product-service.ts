import { LocalStorageProductRepository, LocalStorageCategoryRepository } from '@/lib/repositories/product-repository'
import { LocalStorageStockMovementRepository } from '@/lib/repositories/inventory-repository'
import { AuditLogRepository } from '@/lib/repositories/audit-repository'
import type { Product, Category, CreateProductInput, UpdateProductInput } from '@/lib/types/product'
import { isSimilarProduct } from '@/lib/utils/helpers'

const productRepo = new LocalStorageProductRepository()
const categoryRepo = new LocalStorageCategoryRepository()
const movementRepo = new LocalStorageStockMovementRepository()
const auditRepo = new AuditLogRepository()

export const ProductService = {
  // Products
  async getAllProducts(): Promise<Product[]> {
    return productRepo.getAll()
  },

  async getActiveProducts(): Promise<Product[]> {
    return productRepo.getActive()
  },

  async getProductById(id: string): Promise<Product | null> {
    return productRepo.getById(id)
  },

  async searchProducts(query: string): Promise<Product[]> {
    return productRepo.search(query)
  },

  async findByBarcode(barcode: string): Promise<Product | null> {
    return productRepo.findByBarcode(barcode)
  },

  async checkDuplicates(name: string, barcode?: string, sku?: string): Promise<Product[]> {
    const all = await productRepo.getAll()
    return all.filter(p => {
      if (barcode && p.barcode === barcode) return true
      if (sku && p.sku === sku) return true
      if (isSimilarProduct(p.name, name)) return true
      return false
    })
  },

  async createProduct(data: CreateProductInput, createdBy?: string): Promise<Product> {
    const product = await productRepo.create(data)

    // If initial stock > 0, create a stock movement
    if (product.stock > 0) {
      await movementRepo.create({
        productId: product.id,
        productName: product.name,
        movementType: 'INITIAL_STOCK',
        quantity: product.stock,
        previousStock: 0,
        newStock: product.stock,
        referenceType: 'PRODUCT',
        referenceId: product.id,
        note: 'Stok awal produk',
        createdBy,
      })
    }

    await auditRepo.create({
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      description: `Produk "${product.name}" berhasil ditambahkan`,
      metadata: { productId: product.id, name: product.name },
      createdBy,
    })

    return product
  },

  async updateProduct(id: string, data: UpdateProductInput, updatedBy?: string): Promise<Product | null> {
    const existing = await productRepo.getById(id)
    if (!existing) return null

    const updated = await productRepo.update(id, data)
    if (!updated) return null

    await auditRepo.create({
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: id,
      description: `Produk "${updated.name}" diperbarui`,
      createdBy: updatedBy,
    })

    return updated
  },

  async deactivateProduct(id: string, updatedBy?: string): Promise<Product | null> {
    const updated = await productRepo.update(id, { isActive: false })
    if (updated) {
      await auditRepo.create({
        action: 'PRODUCT_UPDATED',
        entityType: 'Product',
        entityId: id,
        description: `Produk "${updated.name}" dinonaktifkan`,
        createdBy: updatedBy,
      })
    }
    return updated
  },

  async adjustStock(
    productId: string,
    newStock: number,
    reason: string,
    adjustedBy?: string
  ): Promise<Product | null> {
    const product = await productRepo.getById(productId)
    if (!product) return null

    const previousStock = product.stock
    const updated = await productRepo.update(productId, { stock: newStock })
    if (!updated) return null

    await movementRepo.create({
      productId,
      productName: product.name,
      movementType: 'ADJUSTMENT',
      quantity: newStock - previousStock,
      previousStock,
      newStock,
      note: reason,
      createdBy: adjustedBy,
    })

    await auditRepo.create({
      action: 'STOCK_ADJUSTED',
      entityType: 'Product',
      entityId: productId,
      description: `Stok "${product.name}" disesuaikan dari ${previousStock} ke ${newStock}: ${reason}`,
      metadata: { previousStock, newStock, reason },
      createdBy: adjustedBy,
    })

    return updated
  },

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return categoryRepo.getAll()
  },

  async createCategory(data: { name: string; description?: string }, createdBy?: string): Promise<Category> {
    const category = await categoryRepo.create(data)
    await auditRepo.create({
      action: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityId: category.id,
      description: `Kategori "${category.name}" berhasil ditambahkan`,
      createdBy,
    })
    return category
  },

  async updateCategory(id: string, data: { name?: string; description?: string }, updatedBy?: string): Promise<Category | null> {
    const updated = await categoryRepo.update(id, data)
    if (updated) {
      await auditRepo.create({
        action: 'CATEGORY_UPDATED',
        entityType: 'Category',
        entityId: id,
        description: `Kategori "${updated.name}" diperbarui`,
        createdBy: updatedBy,
      })
    }
    return updated
  },

  async deleteCategory(id: string, deletedBy?: string): Promise<boolean> {
    const category = await categoryRepo.getById(id)
    // Check if any active products use this category
    const products = await productRepo.getAll()
    const used = products.some(p => p.categoryId === id && p.isActive)
    if (used) return false

    const result = await categoryRepo.delete(id)
    if (result && category) {
      await auditRepo.create({
        action: 'CATEGORY_DELETED',
        entityType: 'Category',
        entityId: id,
        description: `Kategori "${category.name}" dihapus`,
        createdBy: deletedBy,
      })
    }
    return result
  },
}
