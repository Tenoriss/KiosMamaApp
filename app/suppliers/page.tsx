import { AppShell } from '@/components/layout/app-shell'
 import { PartiesContent } from '@/components/parties/parties-content'
import { ToastContainer } from '@/components/ui/toast'

export default function SuppliersPage() {
  return (
    <AppShell title="Supplier">
       <PartiesContent mode="supplier" />
      <ToastContainer />
    </AppShell>
  )
}
