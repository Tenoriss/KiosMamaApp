import { AppShell } from '@/components/layout/app-shell'
import { InventoryContent } from '@/components/inventory/inventory-content'
import { ToastContainer } from '@/components/ui/toast'

export default function InventoryPage() {
  return (
    <AppShell title="Inventori">
      <InventoryContent />
      <ToastContainer />
    </AppShell>
  )
}
