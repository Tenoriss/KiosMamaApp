import { safeGet, safeSet } from '@/lib/storage/safe-storage'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import type { AuditLog, AuditAction, AppNotification } from '@/lib/types/settings'

export class AuditLogRepository {
  private getAll_raw(): AuditLog[] { return safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []) }
  private saveAll(items: AuditLog[]): void { safeSet(STORAGE_KEYS.AUDIT_LOGS, items) }

  async getAll(): Promise<AuditLog[]> { return this.getAll_raw() }

  async create(data: {
    action: AuditAction
    entityType: string
    entityId?: string
    description: string
    metadata?: Record<string, unknown>
    createdBy?: string
  }): Promise<AuditLog> {
    const items = this.getAll_raw()
    const newItem: AuditLog = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    // Keep last 1000 audit logs to prevent unbounded growth
    const trimmed = [...items, newItem].slice(-1000)
    this.saveAll(trimmed)
    return newItem
  }
}

export class NotificationRepository {
  private getAll_raw(): AppNotification[] { return safeGet<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []) }
  private saveAll(items: AppNotification[]): void { safeSet(STORAGE_KEYS.NOTIFICATIONS, items) }

  async getAll(): Promise<AppNotification[]> { return this.getAll_raw() }
  async getUnread(): Promise<AppNotification[]> { return this.getAll_raw().filter(n => !n.isRead) }

  async create(data: Omit<AppNotification, 'id' | 'createdAt'>): Promise<AppNotification> {
    const items = this.getAll_raw()
    const newItem: AppNotification = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    const trimmed = [...items, newItem].slice(-200)
    this.saveAll(trimmed)
    return newItem
  }

  async markAsRead(id: string): Promise<void> {
    const items = this.getAll_raw()
    const index = items.findIndex(n => n.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], isRead: true }
      this.saveAll(items)
    }
  }

  async markAllAsRead(): Promise<void> {
    const items = this.getAll_raw().map(n => ({ ...n, isRead: true }))
    this.saveAll(items)
  }
}
