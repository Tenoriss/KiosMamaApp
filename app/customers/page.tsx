import { AppShell } from '@/components/layout/app-shell'
 import { PartiesContent } from '@/components/parties/parties-content'
import { ToastContainer } from '@/components/ui/toast'

export default function CustomersPage() {
  return (
    <AppShell title="Pelanggan">
       <PartiesContent mode="customer" />
      <ToastContainer />
    </AppShell>
  )
}
