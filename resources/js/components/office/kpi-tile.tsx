import { PremiumCard } from '@/components/office/premium-card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface KpiTileProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    helper?: string;
    tone?: 'blue' | 'gold' | 'green' | 'red' | 'slate';
}

const toneClasses = {
    blue: 'bg-brand-blue/10 text-brand-blue',
    gold: 'bg-brand-gold/20 text-brand-ink',
    green: 'bg-emerald-500/10 text-emerald-700',
    red: 'bg-red-500/10 text-red-700',
    slate: 'bg-slate-500/10 text-slate-700',
};

export function KpiTile({ label, value, icon: Icon, helper, tone = 'blue' }: KpiTileProps) {
    return (
        <PremiumCard className="relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink">{value}</p>
                    {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
                </div>
                <span className={cn('inline-flex h-11 w-11 items-center justify-center rounded-2xl', toneClasses[tone])}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
        </PremiumCard>
    );
}
