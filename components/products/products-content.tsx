'use client'

import { useEffect, useState, useCallback } from 'react'
import { ProductService } from '@/lib/services/product-service'
import type { Product, Category } from '@/lib/types/product'
import { formatCurrency } from '@/lib/formatters/currency'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Badge, StockBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'
import { TableRowSkeleton } from '@/components/ui/skeleton'
import { ProductFormDialog } from './product-form-dialog'
import {
  Plus, Search, Package, Edit, PowerOff, Boxes,
  AlertTriangle, XCircle, DollarSign,
} from 'lucide-react'

export function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Product | null>(null)

  const reload = useCallback(async () => {
    const [prods, cats] = await Promise.all([
      ProductService.getAllProducts(),
      ProductService.getAllCategories(),
    ])
    setProducts(prods)
    setCategories(cats)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
    if (new URLSearchParams(window.location.search).get('action') === 'add') {
      setShowFormDialog(true)
    }
  }, [reload])

  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || (
      p.name.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q)
    )
    const matchCat = !filterCategory || p.categoryId === filterCategory
    const matchStatus = !filterStatus || (
      filterStatus === 'active' ? p.isActive :
      filterStatus === 'inactive' ? !p.isActive :
      filterStatus === 'low' ? (p.minimumStock !== undefined && p.stock > 0 && p.stock <= p.minimumStock) :
      filterStatus === 'out' ? p.stock <= 0 : true
    )
    return matchSearch && matchCat && matchStatus
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    low: products.filter(p => p.isActive && p.minimumStock !== undefined && p.stock > 0 && p.stock <= p.minimumStock).length,
    out: products.filter(p => p.isActive && p.stock <= 0).length,
    value: products.filter(p => p.isActive).reduce((s, p) => s + ((p.purchasePrice ?? 0) * p.stock), 0),
  }

  const getCategoryName = (id?: string) =>
    id ? categories.find(c => c.id === id)?.name ?? '-' : '-'

  const handleSave = async () => {
    await reload()
    setShowFormDialog(false)
    setEditingProduct(null)
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    await ProductService.deactivateProduct(deactivateTarget.id)
    toast.success(`"${deactivateTarget.name}" berhasil dinonaktifkan`)
    setDeactivateTarget(null)
    await reload()
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Produk', value: stats.total, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Produk Aktif', value: stats.active, icon: Boxes, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Hampir Habis', value: stats.low, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Stok Habis', value: stats.out, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Nilai Persediaan', value: formatCurrency(stats.value), icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-500/10' },
        ].map(s => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg} shrink-0`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-semibold text-foreground text-sm truncate">{s.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Cari nama, brand, SKU, barcode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          options={[
            { value: '', label: 'Semua Kategori' },
            ...categories.map(c => ({ value: c.id, label: c.name })),
          ]}
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="sm:w-44"
        />
        <Select
          options={[
            { value: '', label: 'Semua Status' },
            { value: 'active', label: 'Aktif' },
            { value: 'inactive', label: 'Nonaktif' },
            { value: 'low', label: 'Hampir Habis' },
            { value: 'out', label: 'Stok Habis' },
          ]}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="sm:w-40"
        />
        <Button onClick={() => setShowFormDialog(true)}>
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Belum ada produk"
            description="Tambahkan produk pertama untuk mulai mengelola inventori toko."
            actionLabel="+ Tambah Produk"
            onAction={() => setShowFormDialog(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Produk', 'Kategori', 'SKU', 'Harga Beli', 'Harga Jual', 'Stok', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[160px]">{p.name}</p>
                          {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                          {p.variant && <p className="text-xs text-muted-foreground">{p.variant}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {getCategoryName(p.categoryId)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {p.sku || '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {p.purchasePrice !== undefined ? formatCurrency(p.purchasePrice) : '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {p.sellingPrice !== undefined ? formatCurrency(p.sellingPrice) : '-'}
                    </td>
                    <td className="px-4 py-3 text-foreground font-semibold">
                      {p.stock} {p.unit || ''}
                    </td>
                    <td className="px-4 py-3">
                      {!p.isActive ? (
                        <Badge variant="secondary">Nonaktif</Badge>
                      ) : (
                        <StockBadge stock={p.stock} minimumStock={p.minimumStock} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit produk"
                          onClick={() => { setEditingProduct(p); setShowFormDialog(true) }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        {p.isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Nonaktifkan produk"
                            onClick={() => setDeactivateTarget(p)}
                          >
                            <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <ProductFormDialog
        open={showFormDialog}
        product={editingProduct}
        categories={categories}
        onClose={() => { setShowFormDialog(false); setEditingProduct(null) }}
        onSave={handleSave}
        onCategoryCreated={reload}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Nonaktifkan Produk"
        description={`Produk "${deactivateTarget?.name}" akan dinonaktifkan. Produk tidak akan muncul di POS dan tidak bisa dipilih untuk transaksi baru.\n\nRiwayat transaksi akan tetap tersimpan.`}
        confirmLabel="Nonaktifkan"
        variant="destructive"
      />
    </div>
  )
}
