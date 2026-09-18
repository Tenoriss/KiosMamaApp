// Finance types
import type { PaymentMethod } from './sale'

export type Expense = {
  id: string
  category: string
  description: string
  amount: number
  paymentMethod: PaymentMethod
  notes?: string
  createdAt: string
  createdBy?: string
}

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt'>

export type ReceivableStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE'

export type Receivable = {
  id: string
  customerId: string
  customerName: string
  saleId: string
  invoiceNumber: string
  originalAmount: number
  paidAmount: number
  remainingAmount: number
  status: ReceivableStatus
  dueDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type PayableStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE'

export type Payable = {
  id: string
  supplierId: string
  supplierName: string
  purchaseId: string
  invoiceNumber?: string
  originalAmount: number
  paidAmount: number
  remainingAmount: number
  status: PayableStatus
  dueDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
