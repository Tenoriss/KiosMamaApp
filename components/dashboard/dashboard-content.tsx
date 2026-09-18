'use client'

import { useEffect, useState } from 'react'
import { FinanceService, DashboardMetrics } from '@/lib/services/finance-service'
import { ProductService } from '@/lib/services/product-service'
import { AuditLogRepository } from '@/lib/repositories/audit-repository'
import { formatCurrency } from '@/lib/formatters/currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  ShoppingCart,
  Receipt,
  Package,
  AlertTriangle,
  HandCoins,
  CreditCard,
  Boxes,
  ArrowRight,
  PlusCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/formatters/date'
import type { Product } from '@/lib/types/product'
import { useStoreName } from '@/components/providers/store-name'

export function DashboardContent() {
  const storeName = useStoreName()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [recentActivities, setRecentActivities] = useState<Awaited<ReturnType<AuditLogRepository['getAll']>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const auditRepository = new AuditLogRepository()
      const [m, products, auditLogs] = await Promise.all([
        FinanceService.getDashboardMetrics(),
        ProductService.getActiveProducts(),
        auditRepository.getAll(),
      ])
      setMetrics(m)
      setLowStockProducts(
        products.filter(p =>
          p.stock <= 0 || (p.minimumStock !== undefined && p.stock <= p.minimumStock)
        ).slice(0, 5)
      )
      setRecentActivities(auditLogs.slice(-5).reverse())
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  const m = metrics!
  const hasAnyData = m.todayTransactions > 0 || m.todayRevenue > 0

  const metricCards = [
    {
      title: 'Omzet Hari Ini',
      value: formatCurrency(m.todayRevenue),
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Transaksi Hari Ini',
      value: m.todayTransactions.toString(),
      suffix: 'transaksi',
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Laba Kotor',
      value: formatCurrency(m.todayGrossProfit),
      icon: TrendingUp,
      color: 'text-teal-600',
      bg: 'bg-teal-500/10',
    },
    {
      title: 'Piutang',
      value: formatCurrency(m.totalReceivables),
      icon: HandCoins,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Hutang',
      value: formatCurrency(m.totalPayables),
      icon: CreditCard,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Nilai Persediaan',
      value: formatCurrency(m.inventoryValue),
      icon: Boxes,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
  ]

  const miniTrend = hasAnyData ? [42, 60, 48, 76, 88, 72, 96, 110] : [0, 0, 0, 0, 0, 0, 0, 0]
  const recentActivity = [
    { label: 'Penjualan hari ini', value: formatCurrency(m.todayRevenue), tone: 'text-emerald-500' },
    { label: 'Produk terjual', value: `${m.todayItemsSold} item`, tone: 'text-blue-500' },
    { label: 'Tagihan tertunda', value: formatCurrency(m.totalReceivables), tone: 'text-amber-500' },
  ]

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-teal-900/10 bg-[#173f3a] p-5 text-white shadow-[0_24px_70px_rgba(23,63,58,0.24)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-100">
              Overview
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Selamat datang di {storeName}</h2>
            <p className="mt-2 text-sm text-teal-100 sm:text-base">
              Ringkasan kinerja toko hari ini • total pendapatan <span className="font-semibold text-white">{formatCurrency(m.todayRevenue)}</span>
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-lg">
            {recentActivity.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-3 shadow-inner shadow-white/5 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.2em] text-teal-100">{item.label}</p>
                <p className={`mt-2 text-base font-bold ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="overflow-hidden border-0 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-slate-900/75">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-500 dark:text-slate-300">{card.title}</CardTitle>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{card.value}</p>
                {card.suffix && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.suffix}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-0 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-slate-900/75">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700 dark:text-slate-200">Tren Penjualan</CardTitle>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                +8.2%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex h-32 items-end gap-2">
              {miniTrend.map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-teal-700 to-amber-400"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-[10px] font-medium text-slate-400">
                    {['S', 'S', 'R', 'K', 'J', 'S', 'M', 'S'][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-slate-900/75">
          <CardHeader>
            <CardTitle className="text-slate-700 dark:text-slate-200">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Kasir (POS)', href: '/pos', icon: ShoppingCart, color: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300' },
                { label: 'Tambah Produk', href: '/products?action=add', icon: Package, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' },
                { label: 'Catat Pembelian', href: '/purchases?action=add', icon: CreditCard, color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' },
                { label: 'Catat Pengeluaran', href: '/finance?action=expense', icon: TrendingUp, color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <div className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white dark:border-stone-700 dark:bg-stone-800/80 dark:hover:border-teal-500/40 dark:hover:bg-stone-800">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-0 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-slate-900/75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Stok Menipis
              </CardTitle>
              <Link href="/inventory">
                <Button variant="ghost" size="sm" className="text-teal-700 hover:text-teal-800 dark:text-teal-300">
                  Lihat semua <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Semua stok dalam kondisi aman</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {lowStockProducts.map(p => (
                  <li key={p.id} className="flex items-center justify-between border-b border-slate-200 py-2.5 last:border-0 dark:border-slate-700">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Sisa: {p.stock} {p.unit || 'pcs'}
                      </p>
                    </div>
                    <Badge variant={p.stock <= 0 ? 'destructive' : 'warning'}>
                      {p.stock <= 0 ? 'Habis' : 'Hampir Habis'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-slate-900/75">
          <CardHeader>
            <CardTitle className="text-slate-700 dark:text-slate-200">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center">
                <Receipt className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada aktivitas terbaru.</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Aktivitas akan muncul setelah ada perubahan data.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-teal-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.action}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">{formatDateTime(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!hasAnyData && (
        <Card className="border-0 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-slate-900/75">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Belum ada data penjualan</h3>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                Mulai transaksi pertama untuk melihat analitik toko.
              </p>
              <Link href="/pos">
                <Button size="sm" className="bg-[#173f3a] text-white shadow-lg shadow-teal-900/20 hover:bg-[#245a52]">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Mulai Transaksi
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
