import { AppShell } from '@/components/layout/app-shell'
import { SettingsContent } from '@/components/settings/settings-content'
import { ToastContainer } from '@/components/ui/toast'

export default function SettingsPage() {
  return (
    <AppShell title="Pengaturan">
      <SettingsContent />
      <ToastContainer />
    </AppShell>
  )
}
