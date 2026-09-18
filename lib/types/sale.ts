// Sale types
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'E_WALLET' | 'CREDIT' | 'OTHER'

export type SaleStatus = 'COMPLETED' | 'VOIDED'

export type SaleItem = {
  productId: string
  productName: string
  quantity: number
  sellingPrice: number
  costPrice: number
  subtotal: number
}

export type Sale = {
  id: string
  invoiceNumber: string
  customerId?: string
  customerName?: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentAmount: number
  change: number
  paymentMethod: PaymentMethod
  status: SaleStatus
  notes?: string
  createdAt: string
  createdBy?: string
}

export type CreateSaleInput = Omit<Sale, 'id' | 'createdAt'>
