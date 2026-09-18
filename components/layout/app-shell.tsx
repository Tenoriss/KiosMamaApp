'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils/cn'
import { ProtectedRoute } from '@/components/providers/auth-provider'
import Link from 'next/link'
import { BarChart3, LayoutDashboard, Package, ShoppingCart } from 'lucide-react'
import { usePathname } from 'next/navigation'

type AppShellProps = {
  children: React.ReactNode
  title?: string
}

export function AppShell({ children, title }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const mobileNavItems = [
    { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Produk', href: '/products', icon: Package },
    { label: 'Kasir', href: '/pos', icon: ShoppingCart },
    { label: 'Laporan', href: '/reports', icon: BarChart3 },
  ]

  return (
    <ProtectedRoute>
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.09),_transparent_30%),linear-gradient(180deg,#fafaf9_0%,#f4f3ef_100%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.12),_transparent_30%),linear-gradient(180deg,#111827_0%,#17221f_100%)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="hidden md:flex md:fixed md:inset-y-0 md:w-64 z-30">
        <Sidebar />
      </div>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-3 pb-24 pt-3 sm:px-4 md:overflow-auto md:p-6">
          <div className="mx-auto max-w-7xl min-w-0 space-y-4 md:space-y-6">{children}</div>
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-[#fbfaf7]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(23,63,58,0.08)] backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/95 md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
            {mobileNavItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors',
                    active
                      ? 'bg-[#173f3a] text-white shadow-md shadow-teal-900/15'
                      : 'text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
    </ProtectedRoute>
  )
}
