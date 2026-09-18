import { format, parseISO, isToday, isYesterday, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ms } from 'date-fns/locale'

export const KUALA_LUMPUR_TZ = 'Asia/Kuala_Lumpur'

export function formatDate(dateString: string, fmt = 'd MMMM yyyy'): string {
  try {
    return format(parseISO(dateString), fmt, { locale: ms })
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'd MMMM yyyy, HH:mm', { locale: ms })
  } catch {
    return dateString
  }
}

export function formatTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'HH:mm', { locale: ms })
  } catch {
    return dateString
  }
}

export function formatRelative(dateString: string): string {
  try {
    const date = parseISO(dateString)
    if (isToday(date)) return `Hari ini, ${format(date, 'HH:mm')}`
    if (isYesterday(date)) return `Kemarin, ${format(date, 'HH:mm')}`
    return format(date, 'd MMM yyyy', { locale: ms })
  } catch {
    return dateString
  }
}

export function isInDateRange(dateString: string, from?: Date, to?: Date): boolean {
  try {
    const date = parseISO(dateString)
    if (from && date < from) return false
    if (to && date > to) return false
    return true
  } catch {
    return false
  }
}

export function getTodayRange(): { from: Date; to: Date } {
  const now = new Date()
  return { from: startOfDay(now), to: endOfDay(now) }
}

export function getThisWeekRange(): { from: Date; to: Date } {
  const now = new Date()
  return { from: startOfWeek(now, { locale: ms }), to: endOfWeek(now, { locale: ms }) }
}

export function getThisMonthRange(): { from: Date; to: Date } {
  const now = new Date()
  return { from: startOfMonth(now), to: endOfMonth(now) }
}
