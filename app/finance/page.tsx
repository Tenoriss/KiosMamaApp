import { AppShell } from '@/components/layout/app-shell'
 import { FinanceContent } from '@/components/finance/finance-content'
import { ToastContainer } from '@/components/ui/toast'

export default function FinancePage() {
  return (
    <AppShell title="Keuangan">
       <FinanceContent mode="finance" />
      <ToastContainer />
    </AppShell>
  )
}
