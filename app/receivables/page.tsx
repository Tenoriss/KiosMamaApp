import { AppShell } from '@/components/layout/app-shell'
 import { FinanceContent } from '@/components/finance/finance-content'
import { ToastContainer } from '@/components/ui/toast'

export default function ReceivablesPage() {
  return (
    <AppShell title="Piutang">
       <FinanceContent mode="receivables" />
      <ToastContainer />
    </AppShell>
  )
}
