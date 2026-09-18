import { safeGet, safeSet, safeClear } from '@/lib/storage/safe-storage'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { AuditLogRepository } from '@/lib/repositories/audit-repository'

const auditRepo = new AuditLogRepository()

type BackupData = {
  version: number
  exportedAt: string
  storeName: string
  data: {
    products: unknown[]
    categories: unknown[]
    suppliers: unknown[]
    customers: unknown[]
    sales: unknown[]
    purchases: unknown[]
    expenses: unknown[]
    stockMovements: unknown[]
    receivables: unknown[]
    payables: unknown[]
    settings: unknown
    auditLogs: unknown[]
  }
}

export const BackupService = {
  exportData(storeName = 'Kios Mama'): BackupData {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      storeName,
      data: {
        products: safeGet(STORAGE_KEYS.PRODUCTS, []),
        categories: safeGet(STORAGE_KEYS.CATEGORIES, []),
        suppliers: safeGet(STORAGE_KEYS.SUPPLIERS, []),
        customers: safeGet(STORAGE_KEYS.CUSTOMERS, []),
        sales: safeGet(STORAGE_KEYS.SALES, []),
        purchases: safeGet(STORAGE_KEYS.PURCHASES, []),
        expenses: safeGet(STORAGE_KEYS.EXPENSES, []),
        stockMovements: safeGet(STORAGE_KEYS.STOCK_MOVEMENTS, []),
        receivables: safeGet(STORAGE_KEYS.RECEIVABLES, []),
        payables: safeGet(STORAGE_KEYS.PAYABLES, []),
        settings: safeGet(STORAGE_KEYS.SETTINGS, {}),
        auditLogs: safeGet(STORAGE_KEYS.AUDIT_LOGS, []),
      },
    }
  },

  downloadBackup(storeName?: string): void {
    const backup = this.exportData(storeName)
    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]
    a.href = url
    a.download = `kios-mama-backup-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
    auditRepo.create({
      action: 'DATA_EXPORTED',
      entityType: 'Backup',
      description: 'Data berhasil diekspor ke file JSON',
    })
  },

  validateBackup(data: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (typeof data !== 'object' || data === null) {
      errors.push('File backup tidak valid')
      return { valid: false, errors }
    }
    const backup = data as Record<string, unknown>
    if (!backup.version) errors.push('Versi backup tidak ditemukan')
    if (!backup.data || typeof backup.data !== 'object') errors.push('Data backup tidak valid')
    const d = backup.data as Record<string, unknown>
    const required = ['products', 'categories', 'suppliers', 'customers', 'sales', 'purchases', 'expenses']
    for (const key of required) {
      if (!Array.isArray(d[key])) errors.push(`Data "${key}" tidak valid`)
    }
    return { valid: errors.length === 0, errors }
  },

  importData(backup: BackupData, createdBy?: string): { success: boolean; error?: string } {
    try {
      const { data } = backup
      safeSet(STORAGE_KEYS.PRODUCTS, data.products)
      safeSet(STORAGE_KEYS.CATEGORIES, data.categories)
      safeSet(STORAGE_KEYS.SUPPLIERS, data.suppliers)
      safeSet(STORAGE_KEYS.CUSTOMERS, data.customers)
      safeSet(STORAGE_KEYS.SALES, data.sales)
      safeSet(STORAGE_KEYS.PURCHASES, data.purchases)
      safeSet(STORAGE_KEYS.EXPENSES, data.expenses)
      safeSet(STORAGE_KEYS.STOCK_MOVEMENTS, data.stockMovements ?? [])
      safeSet(STORAGE_KEYS.RECEIVABLES, data.receivables ?? [])
      safeSet(STORAGE_KEYS.PAYABLES, data.payables ?? [])
      if (data.settings) safeSet(STORAGE_KEYS.SETTINGS, data.settings)
      auditRepo.create({
        action: 'DATA_IMPORTED',
        entityType: 'Backup',
        description: `Data berhasil diimpor dari backup ${backup.exportedAt}`,
        createdBy,
      })
      return { success: true }
    } catch (error) {
      console.error('[BackupService] importData error:', error)
      return { success: false, error: 'Gagal mengimpor data. Pastikan file backup valid.' }
    }
  },

  resetAllData(confirmedBy?: string): void {
    safeClear()
    auditRepo.create({
      action: 'DATA_RESET',
      entityType: 'Storage',
      description: 'Semua data toko dihapus',
      createdBy: confirmedBy,
    })
  },
}
