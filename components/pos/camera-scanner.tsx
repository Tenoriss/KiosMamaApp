'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
}

type ScannerWindow = Window & {
  BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike
}

export function CameraScanner({ onDetected }: { onDetected: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const [open, setOpen] = useState(false)
  const [supported, setSupported] = useState(true)

  const stop = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    setOpen(false)
  }

  const start = async () => {
    const Detector = (window as ScannerWindow).BarcodeDetector
    if (!Detector) {
      setSupported(false)
      toast.error('Browser ini belum mendukung scan barcode kamera. Gunakan kolom barcode di POS.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      streamRef.current = stream
      if (!videoRef.current) {
        stop()
        return
      }
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      const detector = new Detector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'] })
      setOpen(true)
      timerRef.current = window.setInterval(async () => {
        if (!videoRef.current) return
        const codes = await detector.detect(videoRef.current)
        const value = codes[0]?.rawValue
        if (value) {
          onDetected(value)
          stop()
        }
      }, 500)
    } catch {
      toast.error('Kamera tidak bisa dibuka. Izinkan akses kamera di browser.')
      stop()
    }
  }

  useEffect(() => stop, [])

  return <div className="space-y-2"><Button type="button" variant={open ? 'destructive' : 'outline'} onClick={open ? stop : start}><Camera className="h-4 w-4" />{open ? 'Tutup Kamera' : 'Scan dengan Kamera'}</Button>{open && <Card className="overflow-hidden border-teal-500/40 bg-black p-2"><video ref={videoRef} className="aspect-video w-full rounded-lg object-cover" muted playsInline /><p className="px-2 py-2 text-center text-xs text-white">Arahkan barcode produk ke kamera</p></Card>}{!supported && <p className="text-xs text-muted-foreground"><CameraOff className="mr-1 inline h-3 w-3" />Gunakan browser terbaru atau masukkan barcode secara manual.</p>}</div>
}
