// Purchase types
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID'

export type PurchaseItem = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type Purchase = {
  id: string
  invoiceNumber?: string
  supplierId?: string
  supplierName?: string
  items: PurchaseItem[]
  subtotal: number
  discount: number
  total: number
  paymentStatus: PaymentStatus
  paidAmount: number
  notes?: string
  createdAt: string
  createdBy?: string
}

export type CreatePurchaseInput = Omit<Purchase, 'id' | 'createdAt'>
