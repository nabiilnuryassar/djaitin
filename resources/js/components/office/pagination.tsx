import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links?: PaginationLink[];
}

function cleanLabel(label: string): string {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

export function OfficePagination({ links = [] }: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav className="mt-5 flex flex-wrap items-center justify-end gap-2" aria-label="Pagination">
            {links.map((link, index) => {
                const className = cn(
                    'inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition',
                    link.active ? 'border-brand-blue bg-brand-blue text-white' : 'border-border bg-white text-muted-foreground hover:border-brand-blue hover:text-brand-blue',
                    !link.url && 'pointer-events-none opacity-45',
                );

                return link.url ? (
                    <Link key={`${link.label}-${index}`} href={link.url} className={className} preserveState>
                        <span dangerouslySetInnerHTML={{ __html: cleanLabel(link.label) }} />
                    </Link>
                ) : (
                    <span key={`${link.label}-${index}`} className={className} dangerouslySetInnerHTML={{ __html: cleanLabel(link.label) }} />
                );
            })}
        </nav>
    );
}
