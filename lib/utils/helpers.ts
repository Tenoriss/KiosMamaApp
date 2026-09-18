// Utility functions

export function generateInvoiceNumber(prefix: string, existingCount: number): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const sequence = String(existingCount + 1).padStart(4, '0')
  return `${prefix}-${year}${month}${day}-${sequence}`
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function normalizeProductName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function isSimilarProduct(a: string, b: string): boolean {
  const na = normalizeProductName(a)
  const nb = normalizeProductName(b)
  if (na === nb) return true
  // Simple Jaccard similarity on words
  const wordsA = new Set(na.split(' '))
  const wordsB = new Set(nb.split(' '))
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length
  const union = new Set([...wordsA, ...wordsB]).size
  return union > 0 && intersection / union >= 0.6
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function safeParseInt(value: string | number | undefined, fallback = 0): number {
  if (value === undefined || value === '') return fallback
  const parsed = parseInt(String(value), 10)
  return isNaN(parsed) ? fallback : parsed
}

export function safeParseFloat(value: string | number | undefined, fallback = 0): number {
  if (value === undefined || value === '') return fallback
  const parsed = parseFloat(String(value))
  return isNaN(parsed) ? fallback : parsed
}
