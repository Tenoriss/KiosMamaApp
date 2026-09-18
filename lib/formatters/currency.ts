import { DEFAULT_LOCALE, DEFAULT_CURRENCY } from '@/lib/constants/storage-keys'

export function formatCurrency(amount: number, locale = DEFAULT_LOCALE, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value: number, locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function parseCurrencyInput(value: string): number {
  // Remove all non-numeric characters except decimal separator
  const cleaned = value.replace(/[^\d]/g, '')
  return parseInt(cleaned, 10) || 0
}
