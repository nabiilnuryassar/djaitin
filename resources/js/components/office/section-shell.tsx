import type {ReactNode} from 'react';
import { PremiumCard } from '@/components/office/premium-card';

interface SectionShellProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export function SectionShell({ title, description, actions, children }: SectionShellProps) {
    return (
        <PremiumCard>
            <div className="mb-5 flex flex-col gap-3 border-b border-border/70 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
                    {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
                </div>
                {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
            {children}
        </PremiumCard>
    );
}
