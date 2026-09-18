import { LocalStorageSaleRepository } from '@/lib/repositories/finance-repository'
import { LocalStorageProductRepository } from '@/lib/repositories/product-repository'
import { LocalStorageStockMovementRepository } from '@/lib/repositories/inventory-repository'
import { LocalStorageReceivableRepository } from '@/lib/repositories/finance-repository'
import { AuditLogRepository } from '@/lib/repositories/audit-repository'
import type { Sale, SaleItem, PaymentMethod } from '@/lib/types/sale'
import { generateInvoiceNumber } from '@/lib/utils/helpers'

const saleRepo = new LocalStorageSaleRepository()
const productRepo = new LocalStorageProductRepository()
const movementRepo = new LocalStorageStockMovementRepository()
const receivableRepo = new LocalStorageReceivableRepository()
const auditRepo = new AuditLogRepository()

export type CartItem = {
  productId: string
  productName: string
  quantity: number
  sellingPrice: number
  costPrice: number
}

export type CreateSaleData = {
  customerId?: string
  customerName?: string
  items: CartItem[]
  discount: number
  paymentMethod: PaymentMethod
  paymentAmount: number
  notes?: string
  createdBy?: string
}

export const SalesService = {
  async getAllSales(): Promise<Sale[]> {
    return saleRepo.getAll()
  },

  async getSaleById(id: string): Promise<Sale | null> {
    return saleRepo.getById(id)
  },

  async validateCartStock(items: CartItem[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []
    for (const item of items) {
      const product = await productRepo.getById(item.productId)
      if (!product) {
        errors.push(`Produk tidak ditemukan: ${item.productName}`)
        continue
      }
      if (product.stock < item.quantity) {
        errors.push(`Stok tidak mencukupi untuk "${product.name}". Stok tersedia: ${product.stock}, diminta: ${item.quantity}`)
      }
    }
    return { valid: errors.length === 0, errors }
  },

  async createSale(data: CreateSaleData): Promise<{ success: boolean; sale?: Sale; error?: string }> {
    try {
      // 1. Validate stock first
      const validation = await this.validateCartStock(data.items)
      if (!validation.valid) {
        return { success: false, error: validation.errors.join('\n') }
      }

      // 2. Build sale items with price snapshots
      const saleItems: SaleItem[] = data.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        costPrice: item.costPrice,
        subtotal: item.sellingPrice * item.quantity,
      }))

      const subtotal = saleItems.reduce((sum, i) => sum + i.subtotal, 0)
      const total = Math.max(0, subtotal - data.discount)
      const change = data.paymentAmount - total

      // 3. Generate invoice number
      const existingSales = saleRepo.getAll_sync()
      const invoiceNumber = generateInvoiceNumber('INV', existingSales.length)

      // 4. Save sale
      const sale = await saleRepo.create({
        invoiceNumber,
        customerId: data.customerId,
        customerName: data.customerName,
        items: saleItems,
        subtotal,
        discount: data.discount,
        total,
        paymentAmount: data.paymentAmount,
        change,
        paymentMethod: data.paymentMethod,
        status: 'COMPLETED',
        notes: data.notes,
        createdBy: data.createdBy,
      })

      // 5. Deduct stock for each item + create movements
      for (const item of data.items) {
        const product = await productRepo.getById(item.productId)
        if (!product) continue
        const previousStock = product.stock
        const newStock = previousStock - item.quantity
        await productRepo.update(item.productId, { stock: newStock })
        await movementRepo.create({
          productId: item.productId,
          productName: item.productName,
          movementType: 'SALE',
          quantity: -item.quantity,
          previousStock,
          newStock,
          referenceType: 'Sale',
          referenceId: sale.id,
          note: `Penjualan ${invoiceNumber}`,
          createdBy: data.createdBy,
        })
      }

      // 6. Handle credit (receivable)
      if (data.paymentMethod === 'CREDIT' && data.customerId && data.customerName) {
        const paidAmount = data.paymentAmount < total ? data.paymentAmount : total
        const remaining = total - paidAmount
        if (remaining > 0) {
          const now = new Date().toISOString()
          await receivableRepo.create({
            customerId: data.customerId,
            customerName: data.customerName,
            saleId: sale.id,
            invoiceNumber,
            originalAmount: total,
            paidAmount,
            remainingAmount: remaining,
            status: paidAmount === 0 ? 'UNPAID' : 'PARTIAL',
            createdAt: now,
            updatedAt: now,
          })
        }
      }

      // 7. Audit log
      await auditRepo.create({
        action: 'SALE_CREATED',
        entityType: 'Sale',
        entityId: sale.id,
        description: `Penjualan ${invoiceNumber} - Total: MYR ${total.toLocaleString('ms-MY')}`,
        metadata: { invoiceNumber, total, itemCount: saleItems.length },
        createdBy: data.createdBy,
      })

      return { success: true, sale }
    } catch (error) {
      console.error('[SalesService] createSale error:', error)
      return { success: false, error: 'Terjadi kesalahan saat memproses transaksi.' }
    }
  },

  async voidSale(saleId: string, reason: string, voidedBy?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sale = await saleRepo.getById(saleId)
      if (!sale) return { success: false, error: 'Transaksi tidak ditemukan.' }
      if (sale.status === 'VOIDED') return { success: false, error: 'Transaksi sudah dibatalkan.' }

      // Restore stock for each item
      for (const item of sale.items) {
        const product = await productRepo.getById(item.productId)
        if (!product) continue
        const previousStock = product.stock
        const newStock = previousStock + item.quantity
        await productRepo.update(item.productId, { stock: newStock })
        await movementRepo.create({
          productId: item.productId,
          productName: item.productName,
          movementType: 'RETURN',
          quantity: item.quantity,
          previousStock,
          newStock,
          referenceType: 'Sale',
          referenceId: saleId,
          note: `Pembatalan penjualan ${sale.invoiceNumber}: ${reason}`,
          createdBy: voidedBy,
        })
      }

      // Update sale status
      await saleRepo.update(saleId, { status: 'VOIDED' })

      await auditRepo.create({
        action: 'SALE_VOIDED',
        entityType: 'Sale',
        entityId: saleId,
        description: `Penjualan ${sale.invoiceNumber} dibatalkan: ${reason}`,
        metadata: { invoiceNumber: sale.invoiceNumber, reason },
        createdBy: voidedBy,
      })

      return { success: true }
    } catch (error) {
      console.error('[SalesService] voidSale error:', error)
      return { success: false, error: 'Terjadi kesalahan saat membatalkan transaksi.' }
    }
  },
}
