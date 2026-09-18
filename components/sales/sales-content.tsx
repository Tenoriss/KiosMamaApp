'use client'

import { useEffect, useState } from 'react'
import { Ban, Receipt, Search } from 'lucide-react'
import { SalesService } from '@/lib/services/sales-service'
import type { Sale } from '@/lib/types/sale'
import { formatCurrency } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

export function SalesContent() {
  const [sales, setSales] = useState<Sale[]>([])
  const [search, setSearch] = useState('')
  const reload = async () => setSales(await SalesService.getAllSales())
  useEffect(() => { reload() }, [])
  const filtered = sales.filter(sale => `${sale.invoiceNumber} ${sale.customerName ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  const voidSale = async (sale: Sale) => {
    if (!window.confirm(`Batalkan transaksi ${sale.invoiceNumber}? Stok akan dikembalikan.`)) return
    const result = await SalesService.voidSale(sale.id, 'Dibatalkan dari riwayat penjualan', 'DewcyBahy')
    if (!result.success) return toast.error(result.error ?? 'Gagal membatalkan transaksi.')
    toast.success('Transaksi dibatalkan dan stok dikembalikan.'); await reload()
  }
  return <Card><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Riwayat Penjualan</CardTitle><Input className="sm:max-w-xs" placeholder="Cari invoice atau pelanggan..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} /></div></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-3 py-3">Invoice</th><th className="px-3 py-3">Waktu</th><th className="px-3 py-3">Pelanggan</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Metode</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Aksi</th></tr></thead><tbody>{filtered.map(sale => <tr key={sale.id} className="border-b border-border"><td className="px-3 py-3 font-semibold"><Receipt className="mr-2 inline h-4 w-4 text-teal-600" />{sale.invoiceNumber}</td><td className="px-3 py-3 text-muted-foreground">{formatDateTime(sale.createdAt)}</td><td className="px-3 py-3">{sale.customerName ?? 'Umum'}</td><td className="px-3 py-3 font-semibold">{formatCurrency(sale.total)}</td><td className="px-3 py-3">{sale.paymentMethod}</td><td className="px-3 py-3"><Badge variant={sale.status === 'COMPLETED' ? 'success' : 'secondary'}>{sale.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}</Badge></td><td className="px-3 py-3">{sale.status === 'COMPLETED' && <Button size="sm" variant="ghost" onClick={() => voidSale(sale)}><Ban className="h-3.5 w-3.5 text-red-500" />Batalkan</Button>}</td></tr>)}{!filtered.length && <tr><td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">Belum ada transaksi penjualan.</td></tr>}</tbody></table></div></CardContent></Card>
}
