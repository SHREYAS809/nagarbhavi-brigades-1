import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionButton {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
    className?: string;
}

interface DashboardMetricCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    subValue?: string;
    actions?: ActionButton[];
    className?: string;
    variant?: 'default' | 'highlight'; // highlight for the red/gold accented cards
}

export function DashboardMetricCard({
    title,
    value,
    icon: Icon,
    subValue,
    actions,
    className,
    variant = 'default',
}: DashboardMetricCardProps) {
    return (
        <Card className={cn(
            "glass-card border-white/10 flex flex-col h-full transition-all duration-300 hover:border-primary/30",
            variant === 'highlight' && "border-t-4 border-t-primary shadow-[0_0_15px_rgba(251,191,36,0.1)]",
            className
        )}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center py-4 space-y-2">
                {Icon && (
                    <div className={cn(
                        "p-3 rounded-full mb-2 bg-gradient-to-br from-white/5 to-white/10 border border-white/5",
                        variant === 'highlight' && "text-primary bg-primary/10 border-primary/20"
                    )}>
                        <Icon className="w-8 h-8 opacity-80" />
                    </div>
                )}
                <div className="text-3xl font-bold font-heading text-foreground tracking-tight">
                    {value}
                </div>
                {subValue && (
                    <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
                )}
            </CardContent>

            {actions && actions.length > 0 && (
                <CardFooter className="grid grid-cols-2 gap-px p-0 mt-auto border-t border-white/10 bg-black/20">
                    {actions.map((action, index) => {
                        const ButtonContent = (
                            <Button
                                key={index}
                                variant="ghost"
                                onClick={action.onClick}
                                className={cn(
                                    "rounded-none h-12 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-white/5 uppercase tracking-wide w-full",
                                    actions.length === 1 && "col-span-2",
                                    index < actions.length - 1 && "border-r border-white/10",
                                    action.className
                                )}
                            >
                                {action.label}
                            </Button>
                        );

                        if (action.href) {
                            return (
                                <Link key={index} href={action.href} className={cn(actions.length === 1 && "col-span-2")}>
                                    {ButtonContent}
                                </Link>
                            );
                        }

                        return ButtonContent;
                    })}
                </CardFooter>
            )}
        </Card>
    );
}
