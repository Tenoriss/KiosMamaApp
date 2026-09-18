// Supplier and Customer types
export type Supplier = {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type Customer = {
  id: string
  name: string
  phone?: string
  address?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CreateSupplierInput = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateSupplierInput = Partial<CreateSupplierInput>

export type CreateCustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateCustomerInput = Partial<CreateCustomerInput>
