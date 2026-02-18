import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatCard({ title, value, icon: Icon, trend, description }: StatCardProps) {
  return (
    <div className="glass-card-hover p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-primary/20 rounded-lg">
          <Icon className="w-5 h-5 gold-text" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}

        {trend && (
          <div className="flex items-center gap-1 text-xs pt-1">
            <span className={trend.isPositive ? 'text-green-400' : 'text-red-400'}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
