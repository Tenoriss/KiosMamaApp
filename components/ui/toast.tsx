'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

type ToastItemProps = {
  toast: Toast
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
}

const variants = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = icons[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm max-w-sm w-full pointer-events-auto',
        variants[toast.type]
      )}
      role="alert"
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && <p className="text-xs opacity-80 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Tutup"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// Global toast state
let toastListeners: ((toasts: Toast[]) => void)[] = []
let currentToasts: Toast[] = []

export function addToast(toast: Omit<Toast, 'id'>) {
  const newToast: Toast = { ...toast, id: crypto.randomUUID() }
  currentToasts = [...currentToasts, newToast]
  toastListeners.forEach(fn => fn(currentToasts))
}

export function toast(title: string, type: ToastType = 'info', message?: string) {
  addToast({ title, type, message })
}
toast.success = (title: string, message?: string) => addToast({ title, type: 'success', message })
toast.error = (title: string, message?: string) => addToast({ title, type: 'error', message })
toast.warning = (title: string, message?: string) => addToast({ title, type: 'warning', message })
toast.info = (title: string, message?: string) => addToast({ title, type: 'info', message })

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (t: Toast[]) => setToasts([...t])
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener)
    }
  }, [])

  const remove = (id: string) => {
    currentToasts = currentToasts.filter(t => t.id !== id)
    setToasts([...currentToasts])
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>
  )
}
