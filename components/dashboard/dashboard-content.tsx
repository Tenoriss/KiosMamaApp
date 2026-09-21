'use client'

import { useEffect, useState } from 'react'
import { FinanceService, DashboardMetrics } from '@/lib/services/finance-service'
import { ProductService } from '@/lib/services/product-service'
import { SalesService } from '@/lib/services/sales-service'
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
import type { Receivable } from '@/lib/types/finance'
import type { Sale } from '@/lib/types/sale'
import { useStoreName } from '@/components/providers/store-name'
import { Dialog } from '@/components/ui/dialog'

export function DashboardContent() {
  const storeName = useStoreName()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [activeProducts, setActiveProducts] = useState<Product[]>([])
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [showAiSummary, setShowAiSummary] = useState(false)
  const [recentActivities, setRecentActivities] = useState<Awaited<ReturnType<AuditLogRepository['getAll']>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const openAiSummary = () => {
      setShowAiSummary(true)
      window.localStorage.removeItem('kios-mama-open-ai-summary')
    }

    if (window.localStorage.getItem('kios-mama-open-ai-summary') === 'true') openAiSummary()
    window.addEventListener('open-ai-summary', openAiSummary)

    async function load() {
      const auditRepository = new AuditLogRepository()
      const [m, products, auditLogs, openReceivables, allSales] = await Promise.all([
        FinanceService.getDashboardMetrics(),
        ProductService.getActiveProducts(),
        auditRepository.getAll(),
        FinanceService.getAllReceivables(),
        SalesService.getAllSales(),
      ])
      setMetrics(m)
      setActiveProducts(products)
      setLowStockProducts(
        products.filter(p =>
          p.stock <= 0 || (p.minimumStock !== undefined && p.stock <= p.minimumStock)
        ).slice(0, 5)
      )
      setRecentActivities(auditLogs.slice(-5).reverse())
      setReceivables(openReceivables.filter(item => item.status !== 'PAID' && item.remainingAmount > 0))
      setSales(allSales.filter(item => item.status === 'COMPLETED'))
      setLoading(false)
    }
    load()
    return () => window.removeEventListener('open-ai-summary', openAiSummary)
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
  const dashboardTickerItems = [
    ...receivables.slice(0, 5).map(item => ({
      label: item.customerName,
      detail: `Sisa hutang ${formatCurrency(item.remainingAmount)}`,
      tone: 'text-amber-600',
    })),
    ...lowStockProducts.slice(0, 5).map(product => ({
      label: product.name,
      detail: `Sisa stok ${product.stock} ${product.unit || 'pcs'}`,
      tone: product.stock <= 0 ? 'text-red-600' : 'text-teal-700',
    })),
  ]
  const aiSummary = receivables.length > 0
    ? `${receivables.length} pelanggan masih memiliki hutang dengan total ${formatCurrency(m.totalReceivables)}.`
    : 'Belum ada piutang terbuka yang perlu ditagih.'
  const aiStockSummary = lowStockProducts.length > 0
    ? `${lowStockProducts.length} produk perlu dicek untuk restock, termasuk ${lowStockProducts[0].name}.`
    : 'Stok produk aktif masih berada di atas batas minimum.'
  const totalStock = activeProducts.reduce((sum, product) => sum + product.stock, 0)
  const bestSellingProducts = Object.values(sales.reduce<Record<string, { name: string; quantity: number }>>((summary, sale) => {
    sale.items.forEach(item => {
      const current = summary[item.productId] ?? { name: item.productName, quantity: 0 }
      summary[item.productId] = { name: current.name, quantity: current.quantity + item.quantity }
    })
    return summary
  }, {})).sort((first, second) => second.quantity - first.quantity).slice(0, 5)

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

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden border-0 bg-[#fffaf0] shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:bg-stone-900/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
              <HandCoins className="h-4 w-4 text-amber-500" />
              Perlu Perhatian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-24 overflow-hidden rounded-xl border border-amber-200/70 bg-white/70 px-4 dark:border-amber-500/20 dark:bg-stone-950/30">
              {dashboardTickerItems.length > 0 ? (
                <div className="dashboard-ticker animate-[dashboardTicker_18s_linear_infinite]">
                  {[...dashboardTickerItems, ...dashboardTickerItems].map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex h-12 items-center justify-between gap-3 border-b border-amber-100 last:border-0 dark:border-stone-800">
                      <span className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">{item.label}</span>
                      <span className={`whitespace-nowrap text-xs font-bold ${item.tone}`}>{item.detail}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-stone-500">Belum ada hutang atau stok menipis.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-0 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/75"
          onClick={() => setShowAiSummary(true)}
          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setShowAiSummary(true) }}
          role="button"
          tabIndex={0}
          aria-label="Buka ringkasan AI lengkap"
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              Ringkasan AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-teal-200/70 bg-teal-50/70 p-3 dark:border-teal-500/20 dark:bg-teal-500/10">
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{aiSummary}</p>
            </div>
            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{aiStockSummary}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={showAiSummary} onClose={() => setShowAiSummary(false)} title="Ringkasan AI Lengkap" description="Ringkasan otomatis dari data toko yang tersimpan." size="lg">
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/10">
            <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300"><Boxes className="h-4 w-4" /><h3 className="font-semibold">Jumlah Stok</h3></div>
            <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{totalStock}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">unit dari {activeProducts.length} produk aktif</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10 sm:col-span-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300"><HandCoins className="h-4 w-4" /><h3 className="font-semibold">Pembeli yang Utang</h3></div>
            {receivables.length > 0 ? <div className="mt-3 space-y-2">{receivables.map(item => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-amber-200/70 pb-2 text-sm last:border-0 last:pb-0 dark:border-amber-500/20"><span className="truncate font-medium text-slate-800 dark:text-slate-100">{item.customerName}</span><span className="whitespace-nowrap font-bold text-amber-700 dark:text-amber-300">{formatCurrency(item.remainingAmount)}</span></div>)}</div> : <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Belum ada pembeli yang berutang.</p>}
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10 sm:col-span-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><TrendingUp className="h-4 w-4" /><h3 className="font-semibold">Produk Paling Laris</h3></div>
            {bestSellingProducts.length > 0 ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{bestSellingProducts.map((item, index) => <div key={item.name} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-stone-950/30"><span><strong className="mr-2 text-emerald-700 dark:text-emerald-300">#{index + 1}</strong>{item.name}</span><span className="font-bold text-slate-700 dark:text-slate-200">{item.quantity} terjual</span></div>)}</div> : <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Belum ada data penjualan.</p>}
          </div>
        </div>
      </Dialog>

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
                    <div className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-stone-200 bg-stone-50/80 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:bg-white dark:border-stone-700 dark:bg-stone-800/80 dark:hover:border-teal-500/60 dark:hover:bg-stone-800">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.label}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">Buka</span>
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
