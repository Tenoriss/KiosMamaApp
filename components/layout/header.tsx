'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { Sun, Moon, Monitor, Menu } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useStoreName } from '@/components/providers/store-name'

type HeaderProps = {
  title?: string
  onMenuClick: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const storeName = useStoreName()

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#fbfaf7]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[#fbfaf7]/85 dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex min-w-0 h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4 md:px-6">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition hover:bg-slate-100 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div className="min-w-0">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300 sm:text-[10px] sm:tracking-[0.2em]">{storeName}</p>
            <h1 className="truncate text-base font-bold tracking-tight text-stone-950 dark:text-stone-50 sm:text-lg">{title}</h1>
          </div>
        )}

        <div className="ml-auto shrink-0 flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-stone-200 bg-white/80 p-1 shadow-sm dark:border-stone-700 dark:bg-stone-900/80 sm:gap-1">
            {(
              [
                { value: 'light', icon: Sun, label: 'Terang' },
                { value: 'system', icon: Monitor, label: 'Sistem' },
                { value: 'dark', icon: Moon, label: 'Gelap' },
              ] as const
            ).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all sm:h-8 sm:w-8',
                  theme === value
                    ? 'bg-[#173f3a] text-white shadow-md'
                    : 'text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white'
                )}
                aria-label={label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
