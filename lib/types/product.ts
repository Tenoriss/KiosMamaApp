// Product types
export type Product = {
  id: string
  name: string
  brand?: string
  categoryId?: string
  sku?: string
  barcode?: string
  variant?: string
  size?: string
  unit?: string
  purchasePrice?: number
  sellingPrice?: number
  stock: number
  minimumStock?: number
  maximumStock?: number
  supplierId?: string
  description?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>

export type ProductStatus = 'ACTIVE' | 'INACTIVE'
export type StockStatus = 'OK' | 'LOW' | 'OUT_OF_STOCK'

export function getStockStatus(product: Product): StockStatus {
  if (product.stock <= 0) return 'OUT_OF_STOCK'
  if (product.minimumStock && product.stock <= product.minimumStock) return 'LOW'
  return 'OK'
}
