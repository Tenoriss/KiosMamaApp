'use client'

import { useCallback, useEffect, useState } from 'react'
import { Edit, Mail, Phone, Plus, Trash2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { LocalStorageCustomerRepository, LocalStorageSupplierRepository } from '@/lib/repositories/parties-repository'
import type { Customer, Supplier } from '@/lib/types/parties'

type Mode = 'supplier' | 'customer'
type Party = Supplier | Customer

const repositories = {
  supplier: new LocalStorageSupplierRepository(),
  customer: new LocalStorageCustomerRepository(),
}

export function PartiesContent({ mode }: { mode: Mode }) {
  const [items, setItems] = useState<Party[]>([])
  const [editing, setEditing] = useState<Party | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' })
  const [search, setSearch] = useState('')
  const isSupplier = mode === 'supplier'
  const repository = repositories[mode]

  const reload = useCallback(async () => setItems(await repository.getAll()), [repository])
  useEffect(() => { reload() }, [reload])

  const openForm = (item?: Party) => {
    setEditing(item ?? null)
    setForm({ name: item?.name ?? '', phone: item?.phone ?? '', email: isSupplier ? (item as Supplier | undefined)?.email ?? '' : '', address: item?.address ?? '', notes: item?.notes ?? '' })
  }

  const save = async () => {
    if (!form.name.trim()) return toast.error('Nama wajib diisi.')
    const data = { name: form.name.trim(), phone: form.phone || undefined, address: form.address || undefined, notes: form.notes || undefined, ...(isSupplier ? { email: form.email || undefined } : {}) }
    if (editing) await repository.update(editing.id, data)
    else await repository.create(data)
    toast.success(`${isSupplier ? 'Supplier' : 'Pelanggan'} berhasil disimpan.`)
    setEditing(null); setForm({ name: '', phone: '', email: '', address: '', notes: '' }); await reload()
  }

  const remove = async (item: Party) => {
    if (!window.confirm(`Hapus ${item.name}?`)) return
    await repository.delete(item.id); toast.success('Data berhasil dihapus.'); await reload()
  }

  const filtered = items.filter(item => `${item.name} ${item.phone ?? ''} ${item.address ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  const title = isSupplier ? 'Supplier' : 'Pelanggan'

  return <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
    <Card className="h-fit"><CardHeader><CardTitle>{editing ? `Edit ${title}` : `Tambah ${title}`}</CardTitle></CardHeader><CardContent className="space-y-4">
      <Input label="Nama" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={isSupplier ? 'Nama supplier' : 'Nama pelanggan'} />
      <Input label="Nomor Telepon" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
      {isSupplier && <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" />}
      <Input label="Alamat" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap" />
      <Textarea label="Catatan" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan" rows={3} />
      <div className="flex gap-2"><Button className="flex-1" onClick={save}><Plus className="h-4 w-4" />{editing ? 'Simpan Perubahan' : `Tambah ${title}`}</Button>{editing && <Button variant="outline" onClick={() => { setEditing(null); setForm({ name: '', phone: '', email: '', address: '', notes: '' }) }}>Batal</Button>}</div>
    </CardContent></Card>
    <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Daftar {title}</CardTitle><Input className="max-w-[220px]" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} /></div></CardHeader><CardContent><div className="space-y-2">{filtered.map(item => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border p-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-700"><UserRound className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-semibold">{item.name}</p><div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground"><span><Phone className="mr-1 inline h-3 w-3" />{item.phone ?? 'Tanpa telepon'}</span>{isSupplier && <span><Mail className="mr-1 inline h-3 w-3" />{(item as Supplier).email ?? 'Tanpa email'}</span>}</div></div><Button size="icon" variant="ghost" title="Edit" onClick={() => openForm(item)}><Edit className="h-4 w-4" /></Button><Button size="icon" variant="ghost" title="Hapus" onClick={() => remove(item)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>)}{!filtered.length && <p className="py-10 text-center text-sm text-muted-foreground">Belum ada data {title.toLowerCase()}.</p>}</div></CardContent></Card>
  </div>
}
