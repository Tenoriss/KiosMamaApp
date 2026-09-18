import { AppShell } from '@/components/layout/app-shell'
 import { SalesContent } from '@/components/sales/sales-content'
import { ToastContainer } from '@/components/ui/toast'

export default function SalesPage() {
  return (
    <AppShell title="Penjualan">
       <SalesContent />
      <ToastContainer />
    </AppShell>
  )
}
