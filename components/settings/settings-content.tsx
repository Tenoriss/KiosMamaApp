'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, RotateCcw, Save, Settings2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { BackupService } from '@/lib/services/backup-service'
import { safeGet, safeSet } from '@/lib/storage/safe-storage'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/types/settings'
import { useTheme } from '@/components/providers/theme-provider'

export function SettingsContent() {
  const { theme, setTheme } = useTheme()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const stored = safeGet<AppSettings | null>(STORAGE_KEYS.SETTINGS, null)
    if (stored) setForm(stored)
  }, [])

  const save = () => {
    const next = { ...form, theme, updatedAt: new Date().toISOString() }
    safeSet(STORAGE_KEYS.SETTINGS, next)
    window.dispatchEvent(new Event('kios-mama-settings-updated'))
    toast.success('Pengaturan toko berhasil disimpan.')
  }

  const exportData = () => { BackupService.downloadBackup(form.storeName); toast.success('Backup berhasil diunduh.') }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        const validation = BackupService.validateBackup(data)
        if (!validation.valid) return toast.error(validation.errors[0])
        const result = BackupService.importData(data, 'DewcyBahy')
        if (!result.success) return toast.error(result.error ?? 'Import gagal.')
        toast.success('Backup berhasil dipulihkan. Muat ulang halaman untuk melihat data.')
      } catch { toast.error('File backup tidak dapat dibaca.') }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const resetData = () => {
    if (!window.confirm('Hapus semua data toko? Tindakan ini tidak dapat dibatalkan.')) return
    BackupService.resetAllData('DewcyBahy')
    setForm(DEFAULT_SETTINGS)
    toast.success('Data toko berhasil direset.')
  }

  return <div className="space-y-5"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-teal-600" />Profil Toko</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Input label="Nama Toko" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} /><Input label="Nomor Telepon" value={form.storePhone ?? ''} onChange={e => setForm({ ...form, storePhone: e.target.value })} /><Input label="Alamat" value={form.storeAddress ?? ''} onChange={e => setForm({ ...form, storeAddress: e.target.value })} /><NumberInput label="Batas Stok Menipis" min="0" value={form.lowStockThreshold} onValueChange={value => setForm({ ...form, lowStockThreshold: Number(value || 0) })} /><Textarea className="sm:col-span-2" label="Header Nota" value={form.receiptHeader ?? ''} onChange={e => setForm({ ...form, receiptHeader: e.target.value })} placeholder="Teks yang muncul di bagian atas nota" /><Textarea className="sm:col-span-2" label="Footer Nota" value={form.receiptFooter ?? ''} onChange={e => setForm({ ...form, receiptFooter: e.target.value })} placeholder="Terima kasih telah berbelanja" /></CardContent></Card><Card><CardHeader><CardTitle>Preferensi Aplikasi</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Select label="Tema" value={theme} onChange={e => { const value = e.target.value as AppSettings['theme']; setTheme(value); setForm({ ...form, theme: value }) }} options={[{ value: 'light', label: 'Terang' }, { value: 'dark', label: 'Gelap' }, { value: 'system', label: 'Ikuti Sistem' }]} /><Input label="Mata Uang" value="MYR - Ringgit Malaysia" readOnly /><Input label="Timezone" value="Asia/Kuala_Lumpur" readOnly /><div className="flex items-end"><Button className="w-full" onClick={save}><Save className="h-4 w-4" />Simpan Pengaturan</Button></div></CardContent></Card><Card><CardHeader><CardTitle>Backup dan Data</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-3"><Button variant="outline" onClick={exportData}><Download className="h-4 w-4" />Download Backup</Button><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" />Import Backup</Button><input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importData} /><Button variant="destructive" onClick={resetData}><RotateCcw className="h-4 w-4" />Reset Semua Data</Button></CardContent></Card></div>
}
