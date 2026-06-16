import type {ReactNode} from 'react';

interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
                {eyebrow ? <p className="office-eyebrow mb-2">{eyebrow}</p> : null}
                <h1 className="text-3xl font-semibold tracking-tight text-brand-ink md:text-4xl">{title}</h1>
                {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">{description}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    );
}
