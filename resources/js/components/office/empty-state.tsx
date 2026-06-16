import type {LucideIcon} from 'lucide-react';
import type {ReactNode} from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                <Icon className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold text-brand-ink">{title}</h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}
