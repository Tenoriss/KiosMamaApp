'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStoreName } from '@/components/providers/store-name'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Receipt,
  Truck,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Store,
  CreditCard,
  HandCoins,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useState } from 'react'

const navItems = [
  {
    label: 'Beranda',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Kasir (POS)',
    href: '/pos',
    icon: ShoppingCart,
    highlight: true,
  },
  {
    label: 'Produk',
    href: '/products',
    icon: Package,
  },
  {
    label: 'Inventori',
    href: '/inventory',
    icon: Boxes,
  },
  {
    label: 'Penjualan',
    href: '/sales',
    icon: Receipt,
  },
  {
    label: 'Pembelian',
    href: '/purchases',
    icon: Truck,
  },
  {
    label: 'Supplier',
    href: '/suppliers',
    icon: Truck,
  },
  {
    label: 'Pelanggan',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Piutang',
    href: '/receivables',
    icon: HandCoins,
  },
  {
    label: 'Hutang',
    href: '/payables',
    icon: CreditCard,
  },
  {
    label: 'Keuangan',
    href: '/finance',
    icon: DollarSign,
  },
  {
    label: 'Laporan',
    href: '/reports',
    icon: BarChart3,
  },
  {
    label: 'Pengaturan',
    href: '/settings',
    icon: Settings,
  },
]

type SidebarProps = {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const storeName = useStoreName()
  const [showAiComingSoon, setShowAiComingSoon] = useState(false)

  return (
    <aside className="flex h-full w-64 flex-col border-r border-stone-200 bg-[#fbfaf7]/95 dark:border-stone-800 dark:bg-stone-950/95">
      <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173f3a] text-[#d9a441] shadow-lg shadow-teal-900/20">
            <Store className="h-4 w-4" />
          </div>
          <span className="max-w-[150px] truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">{storeName}</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[#173f3a] text-white shadow-lg shadow-teal-900/15'
                      : item.highlight
                      ? 'text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-500/10'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          onClick={() => setShowAiComingSoon(true)}
          className="mt-4 flex w-full items-center gap-3 rounded-xl border border-dashed border-teal-300 bg-teal-50/70 px-3 py-2.5 text-left text-sm font-semibold text-teal-800 transition hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-950/30 dark:text-teal-200 dark:hover:bg-teal-950/60"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          Ringkas menggunakan AI
        </button>
      </nav>

      <div className="border-t border-stone-200 p-4 dark:border-stone-800">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">v0.1.0 — LocalStorage</p>
          <button type="button" onClick={logout} title="Keluar" className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      {showAiComingSoon && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onClick={() => setShowAiComingSoon(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-coming-soon-title"
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 id="ai-coming-soon-title" className="mt-4 text-lg font-bold text-foreground">COMING SOON</h2>
            <p className="mt-2 text-sm text-muted-foreground">Fitur ringkasan otomatis menggunakan AI sedang disiapkan.</p>
            <button
              type="button"
              onClick={() => setShowAiComingSoon(false)}
              className="mt-5 rounded-xl bg-[#173f3a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245a52]"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
