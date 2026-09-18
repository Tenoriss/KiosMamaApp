'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calculator, Minus, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { ProductService } from '@/lib/services/product-service'
import { SalesService, type CartItem } from '@/lib/services/sales-service'
import type { Product } from '@/lib/types/product'
import type { PaymentMethod, Sale } from '@/lib/types/sale'
import { formatCurrency } from '@/lib/formatters/currency'
import { Input, Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { CameraScanner } from './camera-scanner'
import { ReceiptPreview } from './receipt-preview'
import { useStoreName } from '@/components/providers/store-name'
import { safeGet } from '@/lib/storage/safe-storage'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/types/settings'

export function PosContent() {
  const storeName = useStoreName()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState('0')
  const [payment, setPayment] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [customerName, setCustomerName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  const loadProducts = async () => setProducts(await ProductService.getActiveProducts())
  useEffect(() => {
    loadProducts()
    setSettings(safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS))
  }, [])

  const visibleProducts = products.filter(product => {
    const text = `${product.name} ${product.brand ?? ''} ${product.sku ?? ''} ${product.barcode ?? ''}`.toLowerCase()
    return !query || text.includes(query.toLowerCase())
  })

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0), [cart])
  const total = Math.max(0, subtotal - Number(discount || 0))
  const change = Number(payment || 0) - total

  const addProduct = (product: Product) => {
    if (product.stock <= 0) return toast.error('Stok produk sedang habis.')
    setCart(current => {
      const existing = current.find(item => item.productId === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return current
        return current.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...current, { productId: product.id, productName: product.name, quantity: 1, sellingPrice: product.sellingPrice ?? 0, costPrice: product.purchasePrice ?? 0 }]
    })
  }

  const handleCameraCode = async (code: string) => {
    const product = await ProductService.findByBarcode(code)
    if (!product) return toast.error(`Barcode ${code} belum terdaftar di Produk.`)
    addProduct(product)
    toast.success(`${product.name} ditambahkan ke keranjang.`)
  }

  const updateQuantity = (productId: string, amount: number) => {
    setCart(current => current.flatMap(item => item.productId === productId
      ? (item.quantity + amount <= 0 ? [] : [{ ...item, quantity: item.quantity + amount }])
      : [item]))
  }

  const checkout = async () => {
    if (!cart.length) return toast.error('Tambahkan produk ke keranjang terlebih dahulu.')
    if (Number(payment) < total && paymentMethod !== 'CREDIT') return toast.error('Nominal pembayaran masih kurang.')
    setProcessing(true)
    const result = await SalesService.createSale({ items: cart, discount: Number(discount || 0), paymentAmount: Number(payment || 0), paymentMethod, customerName: customerName || undefined, createdBy: 'DewcyBahy' })
    setProcessing(false)
    if (!result.success) return toast.error(result.error ?? 'Transaksi gagal diproses.')
    toast.success(`Transaksi ${result.sale?.invoiceNumber} berhasil disimpan.`)
    if (result.sale) setCompletedSale(result.sale)
    setCart([]); setPayment('0'); setDiscount('0'); setCustomerName(''); await loadProducts()
  }

  return (
    <>
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <Card>
        <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Pilih Produk</CardTitle><span className="text-xs text-muted-foreground">{products.length} produk aktif</span></div></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input className="flex-1" placeholder="Cari nama, SKU, atau barcode..." value={query} onChange={e => setQuery(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
            <CameraScanner onDetected={handleCameraCode} />
          </div>
          <div className="mt-4 grid max-h-[540px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {visibleProducts.map(product => <button key={product.id} type="button" onClick={() => addProduct(product)} className="rounded-2xl border border-border bg-background p-3 text-left transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50" disabled={product.stock <= 0}>
              <div className="flex h-20 items-center justify-center rounded-xl bg-muted text-muted-foreground"><ShoppingCart className="h-6 w-6" /></div>
              <p className="mt-3 truncate text-sm font-semibold text-foreground">{product.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">Stok {product.stock} {product.unit ?? ''}</p>
              <p className="mt-2 text-sm font-bold text-teal-700 dark:text-teal-300">{formatCurrency(product.sellingPrice ?? 0)}</p>
            </button>)}
            {!visibleProducts.length && <p className="col-span-full py-10 text-center text-sm text-muted-foreground">Produk belum tersedia. Tambahkan dari menu Produk.</p>}
          </div>
        </CardContent>
      </Card>
      <Card className="h-fit xl:sticky xl:top-24">
        <CardHeader><div className="flex items-center justify-between"><CardTitle>Keranjang</CardTitle><ShoppingCart className="h-4 w-4 text-teal-600" /></div></CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-64 space-y-3 overflow-y-auto">{cart.map(item => <div key={item.productId} className="flex items-center gap-2 border-b border-border pb-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.productName}</p><p className="text-xs text-muted-foreground">{formatCurrency(item.sellingPrice)}</p></div><div className="flex items-center gap-1"><Button size="icon" variant="ghost" onClick={() => updateQuantity(item.productId, -1)}><Minus className="h-3 w-3" /></Button><span className="w-5 text-center text-sm">{item.quantity}</span><Button size="icon" variant="ghost" onClick={() => updateQuantity(item.productId, 1)}><Plus className="h-3 w-3" /></Button><Button size="icon" variant="ghost" onClick={() => setCart(current => current.filter(row => row.productId !== item.productId))}><Trash2 className="h-3 w-3 text-red-500" /></Button></div></div>)}{!cart.length && <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground"><ShoppingCart className="mx-auto mb-2 h-6 w-6" />Keranjang masih kosong</div>}</div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><Input label="Pelanggan (opsional)" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nama pelanggan" /><Select label="Metode pembayaran" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} options={[{ value: 'CASH', label: 'Tunai' }, { value: 'QRIS', label: 'QRIS' }, { value: 'BANK_TRANSFER', label: 'Transfer Bank' }, { value: 'CREDIT', label: 'Hutang / Kredit' }]} /><NumberInput label="Diskon (MYR)" min="0" value={discount} onValueChange={setDiscount} /><NumberInput label="Bayar (MYR)" min="0" value={payment} onValueChange={setPayment} /></div>
          <div className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>Diskon</span><span>- {formatCurrency(Number(discount || 0))}</span></div><div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div><div className={`flex justify-between font-semibold ${change < 0 ? 'text-red-500' : 'text-emerald-600'}`}><span>{change < 0 ? 'Kurang' : 'Kembalian'}</span><span>{formatCurrency(Math.abs(change))}</span></div></div>
          <Button className="w-full" size="lg" onClick={checkout} loading={processing}><Calculator className="h-4 w-4" />Selesaikan Transaksi</Button>
        </CardContent>
      </Card>
    </div>
    {completedSale && <ReceiptPreview sale={completedSale} storeName={storeName} storeAddress={settings.storeAddress} storePhone={settings.storePhone} receiptHeader={settings.receiptHeader} receiptFooter={settings.receiptFooter} onClose={() => setCompletedSale(null)} />}
    </>
  )
}
