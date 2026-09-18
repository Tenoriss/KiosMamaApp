'use client'

import { useCallback, useEffect, useState } from 'react'
import { CreditCard, Edit, HandCoins, Plus, Receipt, Trash2 } from 'lucide-react'
import { FinanceService } from '@/lib/services/finance-service'
import type { Expense, Payable, Receivable } from '@/lib/types/finance'
import { formatCurrency } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'
import { Input, Textarea } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { LocalStorageExpenseRepository } from '@/lib/repositories/finance-repository'

type Mode = 'finance' | 'receivables' | 'payables'
const expenseRepo = new LocalStorageExpenseRepository()

export function FinanceContent({ mode }: { mode: Mode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [payables, setPayables] = useState<Payable[]>([])
  const [form, setForm] = useState({ category: 'Operasional', description: '', amount: '', notes: '' })
  const [payableForm, setPayableForm] = useState({ supplierName: '', invoiceNumber: '', originalAmount: '', paidAmount: '0', dueDate: '', notes: '' })
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null)
  const [payment, setPayment] = useState<Record<string, string>>({})

  const reload = useCallback(async () => {
    if (mode === 'finance') setExpenses(await FinanceService.getAllExpenses())
    if (mode === 'receivables') setReceivables(await FinanceService.getAllReceivables())
    if (mode === 'payables') setPayables(await FinanceService.getAllPayables())
  }, [mode])
  useEffect(() => { reload() }, [reload])

  const addExpense = async () => {
    if (!form.description.trim() || Number(form.amount) <= 0) return toast.error('Deskripsi dan jumlah wajib diisi.')
    await FinanceService.createExpense({ category: form.category, description: form.description.trim(), amount: Number(form.amount), paymentMethod: 'CASH', notes: form.notes || undefined, createdBy: 'DewcyBahy' })
    setForm({ category: 'Operasional', description: '', amount: '', notes: '' }); toast.success('Pengeluaran berhasil dicatat.'); await reload()
  }
  const pay = async (item: Receivable | Payable) => {
    const amount = Number(payment[item.id] || 0)
    if (amount <= 0) return toast.error('Masukkan jumlah pembayaran.')
    const result = mode === 'receivables' ? await FinanceService.recordReceivablePayment(item.id, amount, 'DewcyBahy') : await FinanceService.recordPayablePayment(item.id, amount, 'DewcyBahy')
    if (!result.success) return toast.error(result.error ?? 'Pembayaran gagal.')
    toast.success('Pembayaran berhasil dicatat.'); setPayment({ ...payment, [item.id]: '' }); await reload()
  }
  const deleteExpense = async (expense: Expense) => { await expenseRepo.delete(expense.id); toast.success('Pengeluaran dihapus.'); await reload() }
  const savePayable = async () => {
    const originalAmount = Number(payableForm.originalAmount)
    const paidAmount = Math.min(originalAmount, Math.max(0, Number(payableForm.paidAmount)))
    if (!payableForm.supplierName.trim() || originalAmount <= 0) return toast.error('Supplier dan jumlah hutang wajib diisi.')
    const data = { supplierId: `manual-${payableForm.supplierName.trim().toLowerCase().replace(/\s+/g, '-')}`, supplierName: payableForm.supplierName.trim(), purchaseId: editingPayable?.purchaseId ?? `manual-${Date.now()}`, invoiceNumber: payableForm.invoiceNumber || undefined, originalAmount, paidAmount, remainingAmount: originalAmount - paidAmount, status: paidAmount >= originalAmount ? 'PAID' as const : paidAmount > 0 ? 'PARTIAL' as const : 'UNPAID' as const, dueDate: payableForm.dueDate || undefined, notes: payableForm.notes || undefined, createdAt: editingPayable?.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() }
    if (editingPayable) await FinanceService.updatePayable(editingPayable.id, data, 'DewcyBahy')
    else await FinanceService.createPayable(data, 'DewcyBahy')
    toast.success('Data hutang berhasil disimpan.'); setEditingPayable(null); setPayableForm({ supplierName: '', invoiceNumber: '', originalAmount: '', paidAmount: '0', dueDate: '', notes: '' }); await reload()
  }
  const editPayable = (item: Payable) => { setEditingPayable(item); setPayableForm({ supplierName: item.supplierName, invoiceNumber: item.invoiceNumber ?? '', originalAmount: String(item.originalAmount), paidAmount: String(item.paidAmount), dueDate: item.dueDate ?? '', notes: item.notes ?? '' }) }
  const deletePayable = async (item: Payable) => { if (!window.confirm(`Hapus hutang ${item.supplierName}?`)) return; await FinanceService.deletePayable(item.id, 'DewcyBahy'); toast.success('Data hutang dihapus.'); await reload() }

  if (mode === 'finance') return <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]"><Card className="h-fit"><CardHeader><CardTitle>Catat Pengeluaran</CardTitle></CardHeader><CardContent className="space-y-4"><Input label="Kategori" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /><Input label="Deskripsi" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Contoh: Listrik toko" /><NumberInput label="Jumlah (MYR)" required min="0" value={form.amount} onValueChange={value => setForm({ ...form, amount: value })} /><Textarea label="Catatan" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /><Button className="w-full" onClick={addExpense}><Plus className="h-4 w-4" />Simpan Pengeluaran</Button></CardContent></Card><Card><CardHeader><CardTitle>Riwayat Pengeluaran</CardTitle></CardHeader><CardContent className="space-y-2">{expenses.map(expense => <div key={expense.id} className="flex items-center gap-3 rounded-xl border border-border p-3"><Receipt className="h-5 w-5 text-amber-600" /><div className="min-w-0 flex-1"><p className="font-semibold">{expense.description}</p><p className="text-xs text-muted-foreground">{expense.category} · {formatDateTime(expense.createdAt)}</p></div><p className="font-semibold text-red-600">-{formatCurrency(expense.amount)}</p><Button size="icon" variant="ghost" onClick={() => deleteExpense(expense)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>)}{!expenses.length && <p className="py-10 text-center text-sm text-muted-foreground">Belum ada pengeluaran.</p>}</CardContent></Card></div>

  const items = receivables
  if (mode === 'payables') return <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><Card className="h-fit"><CardHeader><CardTitle>{editingPayable ? 'Edit Hutang' : 'Tambah Hutang'}</CardTitle></CardHeader><CardContent className="space-y-4"><Input label="Nama Supplier" required value={payableForm.supplierName} onChange={e => setPayableForm({ ...payableForm, supplierName: e.target.value })} /><Input label="Nomor Invoice" value={payableForm.invoiceNumber} onChange={e => setPayableForm({ ...payableForm, invoiceNumber: e.target.value })} /><div className="grid grid-cols-2 gap-3"><Input label="Jumlah Hutang (MYR)" required type="number" min="0" value={payableForm.originalAmount} onChange={e => setPayableForm({ ...payableForm, originalAmount: e.target.value })} /><Input label="Sudah Dibayar (MYR)" type="number" min="0" value={payableForm.paidAmount} onChange={e => setPayableForm({ ...payableForm, paidAmount: e.target.value })} /></div><Input label="Jatuh Tempo" type="date" value={payableForm.dueDate} onChange={e => setPayableForm({ ...payableForm, dueDate: e.target.value })} /><Textarea label="Catatan" value={payableForm.notes} onChange={e => setPayableForm({ ...payableForm, notes: e.target.value })} /><div className="flex gap-2"><Button className="flex-1" onClick={savePayable}><Plus className="h-4 w-4" />{editingPayable ? 'Simpan Perubahan' : 'Tambah Hutang'}</Button>{editingPayable && <Button variant="outline" onClick={() => { setEditingPayable(null); setPayableForm({ supplierName: '', invoiceNumber: '', originalAmount: '', paidAmount: '0', dueDate: '', notes: '' }) }}>Batal</Button>}</div></CardContent></Card><Card><CardHeader><CardTitle>Daftar Hutang</CardTitle></CardHeader><CardContent><div className="space-y-3">{payables.map(item => <div key={item.id} className="rounded-xl border border-border p-4"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700"><CreditCard className="h-5 w-5" /></div><div className="flex-1"><p className="font-semibold">{item.supplierName}</p><p className="text-xs text-muted-foreground">{item.invoiceNumber ?? 'Tanpa invoice'} · Sisa {formatCurrency(item.remainingAmount)}</p></div><Badge variant={item.status === 'PAID' ? 'success' : 'warning'}>{item.status}</Badge></div><div className="mt-3 flex flex-wrap justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => editPayable(item)}><Edit className="h-3.5 w-3.5" />Edit</Button><Button size="sm" variant="ghost" onClick={() => deletePayable(item)}><Trash2 className="h-3.5 w-3.5 text-red-500" />Hapus</Button>{item.status !== 'PAID' && <div className="flex gap-2"><Input className="w-36" type="number" placeholder="Jumlah bayar" value={payment[item.id] ?? ''} onChange={e => setPayment({ ...payment, [item.id]: e.target.value })} /><Button size="sm" onClick={() => pay(item)}>Bayar</Button></div>}</div></div>)}{!payables.length && <p className="py-10 text-center text-sm text-muted-foreground">Belum ada hutang.</p>}</div></CardContent></Card></div>
  return <Card><CardHeader><CardTitle>Daftar Piutang</CardTitle></CardHeader><CardContent><div className="space-y-3">{items.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700"><HandCoins className="h-5 w-5" /></div><div className="flex-1"><p className="font-semibold">{item.customerName}</p><p className="text-xs text-muted-foreground">{item.invoiceNumber ?? '-'} · Sisa {formatCurrency(item.remainingAmount)}</p></div><Badge variant={item.status === 'PAID' ? 'success' : 'warning'}>{item.status}</Badge>{item.status !== 'PAID' && <div className="flex gap-2"><Input className="w-36" type="number" placeholder="Jumlah" value={payment[item.id] ?? ''} onChange={e => setPayment({ ...payment, [item.id]: e.target.value })} /><Button size="sm" onClick={() => pay(item)}>Bayar</Button></div>}</div>)}{!items.length && <p className="py-10 text-center text-sm text-muted-foreground">Belum ada data.</p>}</div></CardContent></Card>
}
