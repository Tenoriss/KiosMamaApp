type PlaceholderPageProps = {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-border bg-card p-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Modul
        </p>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description ?? 'Halaman ini sedang dalam pengembangan. Fitur akan segera tersedia di versi berikutnya.'}
        </p>
      </div>
    </div>
  )
}
