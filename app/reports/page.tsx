import { AppShell } from '@/components/layout/app-shell'
import { InventoryContent } from '@/components/inventory/inventory-content'
import { ToastContainer } from '@/components/ui/toast'

export default function ReportsPage() {
  return (
    <AppShell title="Laporan">
      <InventoryContent />
      <ToastContainer />
    </AppShell>
  )
}
