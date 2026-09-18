'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, Store, UserRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'
import { useStoreName } from '@/components/providers/store-name'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useAuth()
  const storeName = useStoreName()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!login(username.trim(), password)) {
      setError('Username atau password salah.')
      return
    }
    router.replace('/dashboard')
  }

  return (
    <main className="light flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.12),_transparent_35%),linear-gradient(135deg,#fafaf9_0%,#f4f3ef_55%,#e9f5f1_100%)] p-4">
      <section className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_24px_80px_rgba(28,37,35,0.14)] md:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden flex-col justify-between bg-[#173f3a] p-10 text-white md:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d9a441] text-[#173f3a]"><Store /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-100">Sistem Kasir</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">{storeName}</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-teal-100">Kelola produk, transaksi, stok, dan laporan toko dari satu tempat.</p>
          </div>
          <p className="text-xs text-teal-100">Local-first workspace</p>
        </div>
        <div className="bg-white p-7 text-stone-900 sm:p-10">
          <div className="mb-8 md:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173f3a] text-[#d9a441]"><Store className="h-5 w-5" /></div>
            <p className="mt-4 max-w-[14rem] truncate text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">{storeName}</p>
          </div>
          <p className="text-sm font-semibold text-teal-700">Selamat datang</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-950">Masuk ke kasir</h2>
          <p className="mt-2 text-sm text-stone-500">Gunakan akun pemilik untuk melanjutkan.</p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Input label="Username" required value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" leftIcon={<UserRound className="h-4 w-4" />} />
            <Input label="Password" required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" leftIcon={<LockKeyhole className="h-4 w-4" />} />
            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full bg-[#173f3a] text-white hover:bg-[#245a52]" size="lg">Masuk ke Dashboard</Button>
          </form>
        </div>
      </section>
    </main>
  )
}
