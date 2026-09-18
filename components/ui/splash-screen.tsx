'use client'

import { useEffect, useState } from 'react'
import { useStoreName } from '@/components/providers/store-name'

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const storeName = useStoreName()

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1400)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.18),_transparent_45%),linear-gradient(135deg,#102a2a_0%,#173f3a_55%,#0f2926_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(217,164,65,0.12),_transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-[#f7efe1] p-2 shadow-[0_20px_50px_rgba(15,118,110,0.35)]">
          <img src="/rencana-kantin-mama.jpeg" alt="Logo Kantin Mama" className="h-full w-full rounded-xl object-contain" />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-teal-100/80">
            Welcome
          </p>
          <h1 className="mt-2 max-w-[18rem] text-3xl font-black tracking-tight text-white">{storeName}</h1>
        </div>
        <div className="mt-2 flex gap-2">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-2.5 w-2.5 animate-pulse rounded-full bg-white/90"
              style={{ animationDelay: `${dot * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
