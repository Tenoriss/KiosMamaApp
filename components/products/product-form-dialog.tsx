'use client'

import { useState, useEffect, useRef } from 'react'
import { ProductService } from '@/lib/services/product-service'
import type { Product, Category, CreateProductInput } from '@/lib/types/product'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { toast } from '@/components/ui/toast'
import { safeParseInt, safeParseFloat } from '@/lib/utils/helpers'
import { Package, Plus } from 'lucide-react'

type ProductFormDialogProps = {
  open: boolean
  product?: Product | null
  categories: Category[]
  onClose: () => void
  onSave: () => void
  onCategoryCreated: () => void
}

export function ProductFormDialog({
  open,
  product,
  categories,
  onClose,
  onSave,
  onCategoryCreated,
}: ProductFormDialogProps) {
  const isEditing = !!product
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [duplicates, setDuplicates] = useState<Product[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | undefined>(product?.imageUrl)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    brand: '',
    categoryId: '',
    sku: '',
    barcode: '',
    variant: '',
    size: '',
    unit: '',
    purchasePrice: '',
    sellingPrice: '',
    stock: '',
    minimumStock: '',
    maximumStock: '',
    description: '',
    imageUrl: '',
    isActive: true,
  })

  useEffect(() => {
    if (open) {
      if (product) {
        setForm({
          name: product.name,
          brand: product.brand ?? '',
          categoryId: product.categoryId ?? '',
          sku: product.sku ?? '',
          barcode: product.barcode ?? '',
          variant: product.variant ?? '',
          size: product.size ?? '',
          unit: product.unit ?? '',
          purchasePrice: product.purchasePrice?.toString() ?? '',
          sellingPrice: product.sellingPrice?.toString() ?? '',
          stock: product.stock.toString(),
          minimumStock: product.minimumStock?.toString() ?? '',
          maximumStock: product.maximumStock?.toString() ?? '',
          description: product.description ?? '',
          imageUrl: product.imageUrl ?? '',
          isActive: product.isActive,
        })
        setImagePreview(product.imageUrl)
      } else {
        setForm({
          name: '', brand: '', categoryId: '', sku: '', barcode: '',
          variant: '', size: '', unit: '', purchasePrice: '', sellingPrice: '',
          stock: '0', minimumStock: '', maximumStock: '', description: '',
          imageUrl: '', isActive: true,
        })
        setImagePreview(undefined)
      }
      setErrors({})
      setDuplicates([])
    }
  }, [open, product])

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const canvas = document.createElement('canvas')
      const img = new Image()
      img.onload = () => {
        const max = 400
        const ratio = Math.min(max / img.width, max / img.height, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/webp', 0.8)
        setImagePreview(dataUrl)
        set('imageUrl', dataUrl)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nama produk wajib diisi'
    const stock = safeParseInt(form.stock)
    if (isNaN(stock) || stock < 0) errs.stock = 'Stok tidak valid'
    const purchasePrice = form.purchasePrice ? safeParseFloat(form.purchasePrice) : undefined
    const sellingPrice = form.sellingPrice ? safeParseFloat(form.sellingPrice) : undefined
    if (purchasePrice !== undefined && purchasePrice < 0) errs.purchasePrice = 'Harga tidak boleh negatif'
    if (sellingPrice !== undefined && sellingPrice < 0) errs.sellingPrice = 'Harga tidak boleh negatif'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const data: CreateProductInput = {
        name: form.name.trim(),
        brand: form.brand || undefined,
        categoryId: form.categoryId || undefined,
        sku: form.sku || undefined,
        barcode: form.barcode || undefined,
        variant: form.variant || undefined,
        size: form.size || undefined,
        unit: form.unit || undefined,
        purchasePrice: form.purchasePrice ? safeParseFloat(form.purchasePrice) : undefined,
        sellingPrice: form.sellingPrice ? safeParseFloat(form.sellingPrice) : undefined,
        stock: safeParseInt(form.stock, 0),
        minimumStock: form.minimumStock ? safeParseInt(form.minimumStock) : undefined,
        maximumStock: form.maximumStock ? safeParseInt(form.maximumStock) : undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        isActive: form.isActive,
      }

      if (!isEditing) {
        const dups = await ProductService.checkDuplicates(data.name, data.barcode, data.sku)
        if (dups.length > 0) {
          setDuplicates(dups)
          setSaving(false)
          return
        }
        await ProductService.createProduct(data)
        toast.success('Produk berhasil ditambahkan')
      } else {
        await ProductService.updateProduct(product!.id, data)
        toast.success('Produk berhasil diperbarui')
      }

      onSave()
    } catch {
      toast.error('Gagal menyimpan produk. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    setAddingCategory(true)
    try {
      const cat = await ProductService.createCategory({ name: newCategoryName.trim() })
      set('categoryId', cat.id)
      setNewCategoryName('')
      onCategoryCreated()
      toast.success(`Kategori "${cat.name}" berhasil ditambahkan`)
    } catch {
      toast.error('Gagal menambahkan kategori')
    } finally {
      setAddingCategory(false)
    }
  }

  const categoryOptions = [
    { value: '', label: 'Pilih kategori...' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Produk' : 'Tambah Produk'}
      size="lg"
    >
      {/* Duplicate warning */}
      {duplicates.length > 0 && (
        <div className="mx-5 mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
            ⚠️ Produk yang mirip ditemukan
          </p>
          {duplicates.map(d => (
            <div key={d.id} className="text-xs text-amber-600 dark:text-amber-400 mb-1">
              • {d.name} {d.barcode ? `(Barcode: ${d.barcode})` : ''}
            </div>
          ))}
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Apakah Anda yakin ingin menambahkan produk baru?
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => setDuplicates([])}>
              Batal
            </Button>
            <Button size="sm" onClick={async () => {
              setDuplicates([])
              const data: CreateProductInput = {
                name: form.name.trim(),
                brand: form.brand || undefined,
                categoryId: form.categoryId || undefined,
                sku: form.sku || undefined,
                barcode: form.barcode || undefined,
                variant: form.variant || undefined,
                size: form.size || undefined,
                unit: form.unit || undefined,
                purchasePrice: form.purchasePrice ? safeParseFloat(form.purchasePrice) : undefined,
                sellingPrice: form.sellingPrice ? safeParseFloat(form.sellingPrice) : undefined,
                stock: safeParseInt(form.stock, 0),
                minimumStock: form.minimumStock ? safeParseInt(form.minimumStock) : undefined,
                maximumStock: form.maximumStock ? safeParseInt(form.maximumStock) : undefined,
                description: form.description || undefined,
                imageUrl: form.imageUrl || undefined,
                isActive: true,
              }
              setSaving(true)
              await ProductService.createProduct(data)
              setSaving(false)
              toast.success('Produk berhasil ditambahkan')
              onSave()
            }}>
              Tetap Tambahkan
            </Button>
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Photo */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors overflow-hidden shrink-0"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <Package className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Foto Produk</p>
            <p className="text-xs text-muted-foreground mb-2">Klik untuk unggah gambar (opsional)</p>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              Pilih Foto
            </Button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nama Produk"
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            error={errors.name}
            placeholder="Contoh: Indomie Goreng"
          />
          <Input
            label="Brand / Merek"
            value={form.brand}
            onChange={e => set('brand', e.target.value)}
            placeholder="Contoh: Indomie"
          />
        </div>

        {/* Category */}
        <div>
          <Select
            label="Kategori"
            options={categoryOptions}
            value={form.categoryId}
            onChange={e => set('categoryId', e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Tambah kategori baru..."
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              className="text-xs h-8"
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
            <Button size="sm" variant="outline" onClick={handleAddCategory} loading={addingCategory}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="SKU"
            value={form.sku}
            onChange={e => set('sku', e.target.value)}
            placeholder="Contoh: SKU-001"
          />
          <Input
            label="Barcode"
            value={form.barcode}
            onChange={e => set('barcode', e.target.value)}
            placeholder="Scan atau ketik barcode"
          />
          <Input
            label="Varian"
            value={form.variant}
            onChange={e => set('variant', e.target.value)}
            placeholder="Contoh: 85g, Rasa Goreng"
          />
        </div>

        {/* Size / Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Ukuran"
            value={form.size}
            onChange={e => set('size', e.target.value)}
            placeholder="Contoh: 200ml, L, XL"
          />
          <Input
            label="Satuan"
            value={form.unit}
            onChange={e => set('unit', e.target.value)}
            placeholder="Contoh: pcs, kg, lusin"
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            label="Harga Beli (MYR)"
            min="0"
            allowDecimal
            value={form.purchasePrice}
            onValueChange={value => set('purchasePrice', value)}
            error={errors.purchasePrice}
            placeholder="Contoh: 0.70"
            helperText="Boleh masukkan nominal desimal sesuai kebutuhan"
          />
          <NumberInput
            label="Harga Jual (MYR)"
            min="0"
            allowDecimal
            value={form.sellingPrice}
            onValueChange={value => set('sellingPrice', value)}
            error={errors.sellingPrice}
            placeholder="Contoh: 1.00"
            helperText="Boleh masukkan nominal desimal sesuai kebutuhan"
          />
        </div>

        {/* Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NumberInput
            label={isEditing ? 'Stok Saat Ini' : 'Stok Awal'}
            min="0"
            required
            value={form.stock}
            onValueChange={value => set('stock', value)}
            error={errors.stock}
          />
          <NumberInput
            label="Minimum Stok"
            min="0"
            value={form.minimumStock}
            onValueChange={value => set('minimumStock', value)}
            helperText="Peringatan stok menipis"
          />
          <NumberInput
            label="Maximum Stok"
            min="0"
            value={form.maximumStock}
            onValueChange={value => set('maximumStock', value)}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Deskripsi"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Keterangan tambahan produk..."
          rows={2}
        />
      </div>

      <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-border bg-card/95 p-5 pt-4 backdrop-blur-sm">
        <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
        <Button onClick={handleSubmit} loading={saving}>
          {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
        </Button>
      </div>
    </Dialog>
  )
}
