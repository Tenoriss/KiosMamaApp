import { AppShell } from '@/components/layout/app-shell'
import { PosContent } from '@/components/pos/pos-content'
import { ToastContainer } from '@/components/ui/toast'

export default function PosPage() {
  return (
    <AppShell title="Kasir (POS)">
      <PosContent />
      <ToastContainer />
    </AppShell>
  )
}
