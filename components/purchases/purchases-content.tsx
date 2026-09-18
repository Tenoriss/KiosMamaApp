'use client'

import { useEffect, useState } from 'react'
import { ClipboardPlus, Package, Plus } from 'lucide-react'
import { PurchaseService } from '@/lib/services/purchase-service'
import { ProductService } from '@/lib/services/product-service'
import type { Product } from '@/lib/types/product'
import type { Purchase } from '@/lib/types/purchase'
import { formatCurrency } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'
import { Input, Select } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

export function PurchasesContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('0')
  const [supplierName, setSupplierName] = useState('')
  const [paidAmount, setPaidAmount] = useState('0')

  const reload = async () => { setProducts(await ProductService.getActiveProducts()); setPurchases(await PurchaseService.getAllPurchases()) }
  useEffect(() => { reload() }, [])
  const selected = products.find(product => product.id === productId)
  const total = Number(quantity || 0) * Number(unitPrice || 0)

  const save = async () => {
    if (!selected || Number(quantity) <= 0 || Number(unitPrice) < 0) return toast.error('Pilih produk dan isi jumlah pembelian dengan benar.')
    const paid = Math.max(0, Number(paidAmount || 0))
    const result = await PurchaseService.createPurchase({ supplierName: supplierName || undefined, items: [{ productId: selected.id, productName: selected.name, quantity: Number(quantity), unitPrice: Number(unitPrice), subtotal: total }], subtotal: total, discount: 0, total, paymentStatus: paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID', paidAmount: Math.min(paid, total), notes: undefined }, 'DewcyBahy')
    if (!result.success) return toast.error(result.error ?? 'Pembelian gagal disimpan.')
    toast.success('Pembelian disimpan dan stok bertambah.'); setProductId(''); setQuantity('1'); setUnitPrice('0'); setSupplierName(''); setPaidAmount('0'); await reload()
  }

  return <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><Card className="h-fit"><CardHeader><CardTitle>Catat Pembelian</CardTitle></CardHeader><CardContent className="space-y-4"><Input label="Supplier" value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="Nama supplier" /><Select label="Produk" required value={productId} onChange={e => { setProductId(e.target.value); const product = products.find(item => item.id === e.target.value); setUnitPrice(String(product?.purchasePrice ?? 0)) }} options={[{ value: '', label: 'Pilih produk...' }, ...products.map(product => ({ value: product.id, label: product.name }))]} /><div className="grid grid-cols-2 gap-3"><NumberInput label="Jumlah" min="1" value={quantity} onValueChange={setQuantity} /><NumberInput label="Harga Satuan (MYR)" min="0" value={unitPrice} onValueChange={setUnitPrice} /></div><NumberInput label="Bayar Sekarang (MYR)" min="0" value={paidAmount} onValueChange={setPaidAmount} /><div className="rounded-xl bg-muted/60 p-4"><p className="text-sm text-muted-foreground">Total pembelian</p><p className="mt-1 text-xl font-bold">{formatCurrency(total)}</p></div><Button className="w-full" onClick={save}><Plus className="h-4 w-4" />Simpan Pembelian</Button></CardContent></Card><Card><CardHeader><CardTitle>Riwayat Pembelian</CardTitle></CardHeader><CardContent className="space-y-2">{purchases.map(purchase => <div key={purchase.id} className="flex items-center gap-3 rounded-xl border border-border p-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-700"><ClipboardPlus className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-semibold">{purchase.invoiceNumber ?? 'Pembelian'}</p><p className="text-xs text-muted-foreground">{purchase.supplierName ?? 'Tanpa supplier'} · {formatDateTime(purchase.createdAt)}</p></div><p className="font-semibold">{formatCurrency(purchase.total)}</p><Badge variant={purchase.paymentStatus === 'PAID' ? 'success' : 'warning'}>{purchase.paymentStatus}</Badge></div>)}{!purchases.length && <div className="py-10 text-center text-sm text-muted-foreground"><Package className="mx-auto mb-2 h-6 w-6" />Belum ada pembelian.</div>}</CardContent></Card></div>
}
