// Settings and App Config types
export type Theme = 'light' | 'dark' | 'system'

export type AppSettings = {
  storeName: string
  storeAddress?: string
  storePhone?: string
  storeLogo?: string
  theme: Theme
  currency: string
  timezone: string
  locale: string
  lowStockThreshold: number
  receiptHeader?: string
  receiptFooter?: string
  allowNegativeStock: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = 'OWNER' | 'CASHIER'

export type AppUser = {
  id: string
  name: string
  username: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AuditAction =
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED'
  | 'SALE_CREATED'
  | 'SALE_VOIDED'
  | 'PURCHASE_CREATED'
  | 'STOCK_ADJUSTED'
  | 'EXPENSE_CREATED'
  | 'PAYMENT_RECEIVED'
  | 'PAYABLE_CREATED'
  | 'PAYABLE_UPDATED'
  | 'PAYABLE_DELETED'
  | 'PAYMENT_MADE'
  | 'SUPPLIER_CREATED'
  | 'SUPPLIER_UPDATED'
  | 'SUPPLIER_DELETED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_UPDATED'
  | 'CUSTOMER_DELETED'
  | 'DATA_IMPORTED'
  | 'DATA_EXPORTED'
  | 'DATA_RESET'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'

export type AuditLog = {
  id: string
  action: AuditAction
  entityType: string
  entityId?: string
  description: string
  metadata?: Record<string, unknown>
  createdAt: string
  createdBy?: string
}

export type AppNotification = {
  id: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  title: string
  message: string
  isRead: boolean
  relatedEntityType?: string
  relatedEntityId?: string
  createdAt: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'Kios Mama',
  theme: 'system',
  currency: 'MYR',
  timezone: 'Asia/Kuala_Lumpur',
  locale: 'ms-MY',
  lowStockThreshold: 5,
  allowNegativeStock: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
