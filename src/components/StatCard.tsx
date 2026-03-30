import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'default',
  className 
}: StatCardProps) {
  const iconBg = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };

  const decorBg = {
    default: 'from-primary/5 to-transparent',
    success: 'from-success/5 to-transparent',
    warning: 'from-warning/5 to-transparent',
    destructive: 'from-destructive/5 to-transparent',
  };

  return (
    <div className={cn('stat-card group', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300', decorBg[variant])} />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold font-display">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110', iconBg[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
