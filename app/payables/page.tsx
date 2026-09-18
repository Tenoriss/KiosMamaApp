import { AppShell } from '@/components/layout/app-shell'
 import { FinanceContent } from '@/components/finance/finance-content'
import { ToastContainer } from '@/components/ui/toast'

export default function PayablesPage() {
  return (
    <AppShell title="Hutang">
       <FinanceContent mode="payables" />
      <ToastContainer />
    </AppShell>
  )
}
