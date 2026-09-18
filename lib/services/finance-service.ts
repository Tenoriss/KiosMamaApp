import { LocalStorageSaleRepository } from '@/lib/repositories/finance-repository'
import { LocalStorageExpenseRepository } from '@/lib/repositories/finance-repository'
import { LocalStorageReceivableRepository, LocalStoragePayableRepository } from '@/lib/repositories/finance-repository'
import { LocalStorageProductRepository } from '@/lib/repositories/product-repository'
import { AuditLogRepository } from '@/lib/repositories/audit-repository'
import type { Expense, CreateExpenseInput, Payable } from '@/lib/types/finance'
import { getTodayRange, isInDateRange } from '@/lib/formatters/date'

const saleRepo = new LocalStorageSaleRepository()
const expenseRepo = new LocalStorageExpenseRepository()
const receivableRepo = new LocalStorageReceivableRepository()
const payableRepo = new LocalStoragePayableRepository()
const productRepo = new LocalStorageProductRepository()
const auditRepo = new AuditLogRepository()

export type DashboardMetrics = {
  todayRevenue: number
  todayTransactions: number
  todayItemsSold: number
  todayGrossProfit: number
  todayExpenses: number
  totalReceivables: number
  totalPayables: number
  lowStockCount: number
  outOfStockCount: number
  inventoryValue: number
}

export const FinanceService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const { from, to } = getTodayRange()
    const allSales = saleRepo.getAll_sync()
    const allExpenses = expenseRepo.getAll_sync()
    const allReceivables = receivableRepo.getAll_sync()
    const allPayables = payableRepo.getAll_sync()
    const allProducts = productRepo.getAll_sync()

    const todaySales = allSales.filter(s =>
      s.status === 'COMPLETED' &&
      isInDateRange(s.createdAt, from, to)
    )

    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)
    const todayTransactions = todaySales.length
    const todayItemsSold = todaySales.reduce((sum, sale) =>
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    const todayGrossProfit = todaySales.reduce((sum, s) =>
      sum + s.items.reduce((iSum, i) => iSum + ((i.sellingPrice - i.costPrice) * i.quantity), 0), 0
    )
    const todayExpenses = allExpenses
      .filter(e => isInDateRange(e.createdAt, from, to))
      .reduce((sum, e) => sum + e.amount, 0)

    const totalReceivables = allReceivables
      .filter(r => r.status !== 'PAID')
      .reduce((sum, r) => sum + r.remainingAmount, 0)

    const totalPayables = allPayables
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + p.remainingAmount, 0)

    const lowStockCount = allProducts.filter(p =>
      p.isActive && p.minimumStock !== undefined && p.stock > 0 && p.stock <= p.minimumStock
    ).length
    const outOfStockCount = allProducts.filter(p => p.isActive && p.stock <= 0).length
    const inventoryValue = allProducts
      .filter(p => p.isActive)
      .reduce((sum, p) => sum + ((p.purchasePrice ?? 0) * p.stock), 0)

    return {
      todayRevenue,
      todayTransactions,
      todayItemsSold,
      todayGrossProfit,
      todayExpenses,
      totalReceivables,
      totalPayables,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
    }
  },

  async createExpense(data: CreateExpenseInput, createdBy?: string): Promise<Expense> {
    const expense = await expenseRepo.create({ ...data, createdBy })
    await auditRepo.create({
      action: 'EXPENSE_CREATED',
      entityType: 'Expense',
      entityId: expense.id,
      description: `Pengeluaran "${data.description}" - MYR ${data.amount.toLocaleString('ms-MY')}`,
      createdBy,
    })
    return expense
  },

  async getAllExpenses(): Promise<Expense[]> {
    return expenseRepo.getAll()
  },

  async getAllReceivables() {
    return receivableRepo.getAll()
  },

  async getAllPayables() {
    return payableRepo.getAll()
  },

  async createPayable(data: Omit<Payable, 'id'>, createdBy?: string): Promise<Payable> {
    const payable = await payableRepo.create({ ...data, updatedAt: data.updatedAt, createdAt: data.createdAt })
    await auditRepo.create({
      action: 'PAYABLE_CREATED',
      entityType: 'Payable',
      entityId: payable.id,
      description: `Hutang kepada ${payable.supplierName} - MYR ${payable.originalAmount.toLocaleString('ms-MY')}`,
      createdBy,
    })
    return payable
  },

  async updatePayable(id: string, data: Partial<Payable>, updatedBy?: string): Promise<Payable | null> {
    const payable = await payableRepo.update(id, data)
    if (payable) {
      await auditRepo.create({ action: 'PAYABLE_UPDATED', entityType: 'Payable', entityId: id, description: `Hutang kepada ${payable.supplierName} diperbarui`, createdBy: updatedBy })
    }
    return payable
  },

  async deletePayable(id: string, deletedBy?: string): Promise<boolean> {
    const result = await payableRepo.delete(id)
    if (result) await auditRepo.create({ action: 'PAYABLE_DELETED', entityType: 'Payable', entityId: id, description: 'Data hutang dihapus', createdBy: deletedBy })
    return result
  },

  async recordReceivablePayment(receivableId: string, amount: number, paidBy?: string): Promise<{ success: boolean; error?: string }> {
    const receivable = await receivableRepo.getById(receivableId)
    if (!receivable) return { success: false, error: 'Piutang tidak ditemukan.' }

    const newPaid = receivable.paidAmount + amount
    const newRemaining = Math.max(0, receivable.originalAmount - newPaid)
    await receivableRepo.update(receivableId, {
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      status: newRemaining === 0 ? 'PAID' : 'PARTIAL',
      updatedAt: new Date().toISOString(),
    })

    await auditRepo.create({
      action: 'PAYMENT_RECEIVED',
      entityType: 'Receivable',
      entityId: receivableId,
      description: `Pembayaran piutang MYR ${amount.toLocaleString('ms-MY')} dari ${receivable.customerName}`,
      createdBy: paidBy,
    })

    return { success: true }
  },

  async recordPayablePayment(payableId: string, amount: number, paidBy?: string): Promise<{ success: boolean; error?: string }> {
    const payable = await payableRepo.getById(payableId)
    if (!payable) return { success: false, error: 'Hutang tidak ditemukan.' }
    const newPaid = payable.paidAmount + amount
    const newRemaining = Math.max(0, payable.originalAmount - newPaid)
    await payableRepo.update(payableId, {
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      status: newRemaining === 0 ? 'PAID' : 'PARTIAL',
      updatedAt: new Date().toISOString(),
    })
    await auditRepo.create({
      action: 'PAYMENT_MADE',
      entityType: 'Payable',
      entityId: payableId,
      description: `Pembayaran hutang MYR ${amount.toLocaleString('ms-MY')} kepada ${payable.supplierName}`,
      createdBy: paidBy,
    })
    return { success: true }
  },

  async getSalesReport(from?: Date, to?: Date) {
    const sales = saleRepo.getAll_sync().filter(s =>
      s.status === 'COMPLETED' && (!from || !to || isInDateRange(s.createdAt, from, to))
    )
    const revenue = sales.reduce((sum, s) => sum + s.total, 0)
    const discounts = sales.reduce((sum, s) => sum + s.discount, 0)
    const grossProfit = sales.reduce((sum, s) =>
      sum + s.items.reduce((iSum, i) => iSum + ((i.sellingPrice - i.costPrice) * i.quantity), 0), 0
    )
    return { sales, revenue, discounts, grossProfit, count: sales.length }
  },
}
