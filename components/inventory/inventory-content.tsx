'use client'

import { useEffect, useMemo, useState } from 'react'
import { Boxes, Download, Package, Search } from 'lucide-react'
import { ProductService } from '@/lib/services/product-service'
import type { Product } from '@/lib/types/product'
import { formatCurrency } from '@/lib/formatters/currency'
import { Input, Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StockBadge } from '@/components/ui/badge'

export function InventoryContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  useEffect(() => { ProductService.getAllProducts().then(setProducts) }, [])

  const filtered = useMemo(() => products.filter(product => {
    const matchesQuery = !query || `${product.name} ${product.sku ?? ''}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = !status || status === 'out' && product.stock <= 0 || status === 'low' && product.stock > 0 && product.minimumStock !== undefined && product.stock <= product.minimumStock || status === 'safe' && (product.minimumStock === undefined || product.stock > product.minimumStock)
    return matchesQuery && matchesStatus
  }), [products, query, status])
  const totalValue = products.reduce((sum, product) => sum + product.stock * (product.purchasePrice ?? 0), 0)
  const low = products.filter(product => product.stock > 0 && product.minimumStock !== undefined && product.stock <= product.minimumStock).length
  const out = products.filter(product => product.stock <= 0).length

  const exportCsv = () => {
    const csv = ['Produk,SKU,Stok,Satuan,Harga Beli,Nilai Stok', ...filtered.map(product => [product.name, product.sku ?? '', product.stock, product.unit ?? '', product.purchasePrice ?? 0, product.stock * (product.purchasePrice ?? 0)].map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = 'laporan-stok-kios-mama.csv'; link.click(); URL.revokeObjectURL(url)
  }

  return <div className="space-y-5"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Card className="p-4"><p className="text-xs text-muted-foreground">Total SKU</p><p className="mt-2 text-2xl font-bold">{products.length}</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Nilai Persediaan</p><p className="mt-2 text-lg font-bold">{formatCurrency(totalValue)}</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Stok Menipis</p><p className="mt-2 text-2xl font-bold text-amber-500">{low}</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Stok Habis</p><p className="mt-2 text-2xl font-bold text-red-500">{out}</p></Card></div><Card><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Laporan Stok</CardTitle><Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</Button></div></CardHeader><CardContent><div className="mb-4 flex flex-col gap-3 sm:flex-row"><Input className="flex-1" placeholder="Cari produk atau SKU..." value={query} onChange={e => setQuery(e.target.value)} leftIcon={<Search className="h-4 w-4" />} /><Select className="sm:w-48" value={status} onChange={e => setStatus(e.target.value)} options={[{ value: '', label: 'Semua status' }, { value: 'safe', label: 'Stok aman' }, { value: 'low', label: 'Stok menipis' }, { value: 'out', label: 'Stok habis' }]} /></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="px-3 py-3">Produk</th><th className="px-3 py-3">SKU</th><th className="px-3 py-3">Stok</th><th className="px-3 py-3">Harga Beli</th><th className="px-3 py-3">Nilai</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{filtered.map(product => <tr key={product.id} className="border-b border-border"><td className="px-3 py-3 font-medium"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" />{product.name}</div></td><td className="px-3 py-3 text-muted-foreground">{product.sku ?? '-'}</td><td className="px-3 py-3 font-semibold">{product.stock} {product.unit ?? ''}</td><td className="px-3 py-3">{formatCurrency(product.purchasePrice ?? 0)}</td><td className="px-3 py-3">{formatCurrency(product.stock * (product.purchasePrice ?? 0))}</td><td className="px-3 py-3"><StockBadge stock={product.stock} minimumStock={product.minimumStock} /></td></tr>)}{!filtered.length && <tr><td colSpan={6} className="px-3 py-10 text-center text-muted-foreground"><Boxes className="mx-auto mb-2 h-6 w-6" />Belum ada data stok.</td></tr>}</tbody></table></div></CardContent></Card></div>
}
