import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        {
          'bg-primary/10 text-primary': variant === 'default',
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': variant === 'success',
          'bg-amber-500/10 text-amber-600 dark:text-amber-400': variant === 'warning',
          'bg-red-500/10 text-red-600 dark:text-red-400': variant === 'destructive',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'border border-border text-muted-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function StockBadge({ stock, minimumStock }: { stock: number; minimumStock?: number }) {
  if (stock <= 0) {
    return <Badge variant="destructive">Habis</Badge>
  }
  if (minimumStock !== undefined && stock <= minimumStock) {
    return <Badge variant="warning">Hampir Habis</Badge>
  }
  return <Badge variant="success">Aman</Badge>
}
