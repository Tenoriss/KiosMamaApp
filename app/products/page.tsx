import { AppShell } from '@/components/layout/app-shell'
import { ProductsContent } from '@/components/products/products-content'
import { ToastContainer } from '@/components/ui/toast'

export default function ProductsPage() {
  return (
    <AppShell title="Produk">
      <ProductsContent />
      <ToastContainer />
    </AppShell>
  )
}
