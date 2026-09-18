import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { StorageProvider } from '@/components/providers/storage-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { SplashScreen } from '@/components/ui/splash-screen'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kios Mama - Sistem Manajemen Kios',
  description: 'Sistem manajemen toko modern untuk Kios',
  icons: {
    icon: '/icon.png',
  },  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <StorageProvider>
              <SplashScreen />
              {children}
            </StorageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
