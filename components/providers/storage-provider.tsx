'use client'

import { useEffect } from 'react'
import { initializeStorage } from '@/lib/storage/storage-meta'

export function StorageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize storage on first client-side load
    // This is safe because localStorage is client-side only
    initializeStorage()
  }, [])

  return <>{children}</>
}
