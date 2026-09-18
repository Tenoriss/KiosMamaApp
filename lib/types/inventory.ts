// Inventory / Stock Movement types
export type StockMovementType =
  | 'INITIAL_STOCK'
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'DAMAGE'
  | 'ADJUSTMENT'

export type StockMovement = {
  id: string
  productId: string
  productName: string
  movementType: StockMovementType
  quantity: number
  previousStock: number
  newStock: number
  referenceType?: string
  referenceId?: string
  note?: string
  createdAt: string
  createdBy?: string
}

export type CreateStockMovementInput = Omit<StockMovement, 'id' | 'createdAt'>
