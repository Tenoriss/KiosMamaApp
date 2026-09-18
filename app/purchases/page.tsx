import { AppShell } from '@/components/layout/app-shell'
import { PurchasesContent } from '@/components/purchases/purchases-content'
import { ToastContainer } from '@/components/ui/toast'

export default function PurchasesPage() {
  return (
    <AppShell title="Pembelian">
      <PurchasesContent />
      <ToastContainer />
    </AppShell>
  )
}
