'use client'

import { useEffect, useState } from 'react'
import { safeGet } from '@/lib/storage/safe-storage'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { DEFAULT_SETTINGS, type AppSettings } from '@/lib/types/settings'

export function useStoreName() {
  const [storeName, setStoreName] = useState(DEFAULT_SETTINGS.storeName)

  useEffect(() => {
    const loadName = () => setStoreName(safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS).storeName || DEFAULT_SETTINGS.storeName)
    loadName()
    window.addEventListener('kios-mama-settings-updated', loadName)
    return () => window.removeEventListener('kios-mama-settings-updated', loadName)
  }, [])

  return storeName
}
