import { LocalStoragePurchaseRepository, LocalStorageStockMovementRepository } from '@/lib/repositories/inventory-repository'
import { LocalStorageProductRepository } from '@/lib/repositories/product-repository'
import { LocalStoragePayableRepository } from '@/lib/repositories/finance-repository'
import { AuditLogRepository } from '@/lib/repositories/audit-repository'
import type { Purchase, CreatePurchaseInput } from '@/lib/types/purchase'
import { generateInvoiceNumber } from '@/lib/utils/helpers'

const purchaseRepo = new LocalStoragePurchaseRepository()
const productRepo = new LocalStorageProductRepository()
const movementRepo = new LocalStorageStockMovementRepository()
const payableRepo = new LocalStoragePayableRepository()
const auditRepo = new AuditLogRepository()

export const PurchaseService = {
  async getAllPurchases(): Promise<Purchase[]> {
    return purchaseRepo.getAll()
  },

  async getPurchaseById(id: string): Promise<Purchase | null> {
    return purchaseRepo.getById(id)
  },

  async createPurchase(data: CreatePurchaseInput & { supplierName?: string }, createdBy?: string): Promise<{ success: boolean; purchase?: Purchase; error?: string }> {
    try {
      const existingPurchases = purchaseRepo.getAll_sync()
      const invoiceNumber = data.invoiceNumber || generateInvoiceNumber('PO', existingPurchases.length)

      const purchase = await purchaseRepo.create({
        ...data,
        invoiceNumber,
        createdBy,
      })

      // Increase stock for each item + create movements
      for (const item of data.items) {
        const product = await productRepo.getById(item.productId)
        if (!product) continue
        const previousStock = product.stock
        const newStock = previousStock + item.quantity
        await productRepo.update(item.productId, {
          stock: newStock,
          purchasePrice: item.unitPrice, // Update latest purchase price
        })
        await movementRepo.create({
          productId: item.productId,
          productName: item.productName,
          movementType: 'PURCHASE',
          quantity: item.quantity,
          previousStock,
          newStock,
          referenceType: 'Purchase',
          referenceId: purchase.id,
          note: `Pembelian ${invoiceNumber}`,
          createdBy,
        })
      }

      // Create payable if not fully paid
      if (data.paymentStatus !== 'PAID' && data.supplierId && data.supplierName) {
        const remaining = data.total - data.paidAmount
        if (remaining > 0) {
          const now = new Date().toISOString()
          await payableRepo.create({
            supplierId: data.supplierId,
            supplierName: data.supplierName,
            purchaseId: purchase.id,
            invoiceNumber,
            originalAmount: data.total,
            paidAmount: data.paidAmount,
            remainingAmount: remaining,
            status: data.paidAmount === 0 ? 'UNPAID' : 'PARTIAL',
            createdAt: now,
            updatedAt: now,
          })
        }
      }

      await auditRepo.create({
        action: 'PURCHASE_CREATED',
        entityType: 'Purchase',
        entityId: purchase.id,
        description: `Pembelian ${invoiceNumber} - Total: MYR ${data.total.toLocaleString('ms-MY')}`,
        createdBy,
      })

      return { success: true, purchase }
    } catch (error) {
      console.error('[PurchaseService] createPurchase error:', error)
      return { success: false, error: 'Terjadi kesalahan saat menyimpan pembelian.' }
    }
  },

  async recordPayment(purchaseId: string, amount: number, paidBy?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const purchase = await purchaseRepo.getById(purchaseId)
      if (!purchase) return { success: false, error: 'Pembelian tidak ditemukan.' }

      const newPaidAmount = purchase.paidAmount + amount
      const newStatus = newPaidAmount >= purchase.total ? 'PAID' : 'PARTIAL'

      await purchaseRepo.update(purchaseId, {
        paidAmount: newPaidAmount,
        paymentStatus: newStatus,
      })

      // Update corresponding payable
      const payables = payableRepo.getAll_sync()
      const payable = payables.find(p => p.purchaseId === purchaseId)
      if (payable) {
        const newPayablePaid = payable.paidAmount + amount
        const newRemaining = Math.max(0, payable.originalAmount - newPayablePaid)
        await payableRepo.update(payable.id, {
          paidAmount: newPayablePaid,
          remainingAmount: newRemaining,
          status: newRemaining === 0 ? 'PAID' : 'PARTIAL',
          updatedAt: new Date().toISOString(),
        })
      }

      await auditRepo.create({
        action: 'PAYMENT_RECEIVED',
        entityType: 'Purchase',
        entityId: purchaseId,
        description: `Pembayaran MYR ${amount.toLocaleString('ms-MY')} untuk pembelian ${purchase.invoiceNumber}`,
        createdBy: paidBy,
      })

      return { success: true }
    } catch (error) {
      console.error('[PurchaseService] recordPayment error:', error)
      return { success: false, error: 'Terjadi kesalahan saat mencatat pembayaran.' }
    }
  },
}
