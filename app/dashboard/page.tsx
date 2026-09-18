import { AppShell } from '@/components/layout/app-shell'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { ToastContainer } from '@/components/ui/toast'

export default function DashboardPage() {
  return (
    <AppShell title="Beranda">
      <DashboardContent />
      <ToastContainer />
    </AppShell>
  )
}
