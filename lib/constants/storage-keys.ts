// Storage keys constants - all LocalStorage keys used by Kios Mama
export const STORAGE_KEYS = {
  PRODUCTS: 'kios-mama-products',
  CATEGORIES: 'kios-mama-categories',
  SUPPLIERS: 'kios-mama-suppliers',
  CUSTOMERS: 'kios-mama-customers',
  SALES: 'kios-mama-sales',
  PURCHASES: 'kios-mama-purchases',
  EXPENSES: 'kios-mama-expenses',
  STOCK_MOVEMENTS: 'kios-mama-stock-movements',
  RECEIVABLES: 'kios-mama-receivables',
  PAYABLES: 'kios-mama-payables',
  SETTINGS: 'kios-mama-settings',
  USERS: 'kios-mama-users',
  AUDIT_LOGS: 'kios-mama-audit-logs',
  NOTIFICATIONS: 'kios-mama-notifications',
  META: 'kios-mama-storage-meta',
} as const;

export const STORAGE_VERSION = 1;

export const APP_NAME = 'Kios Mama';
export const DEFAULT_CURRENCY = 'MYR';
export const DEFAULT_TIMEZONE = 'Asia/Kuala_Lumpur';
export const DEFAULT_LOCALE = 'ms-MY';
