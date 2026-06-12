import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface DataTableProps {
    children: ReactNode;
    className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
    return (
        <div className={cn('overflow-hidden rounded-2xl border border-border bg-white shadow-sm', className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">{children}</table>
            </div>
        </div>
    );
}

export function DataTableHead({ children }: { children: ReactNode }) {
    return <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</thead>;
}

export function DataTableBody({ children }: { children: ReactNode }) {
    return <tbody className="divide-y divide-border/70">{children}</tbody>;
}

export function DataTableCell({ children, className }: { children: ReactNode; className?: string }) {
    return <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>;
}

export function DataTableHeaderCell({ children, className }: { children: ReactNode; className?: string }) {
    return <th className={cn('px-4 py-3 text-left align-middle', className)}>{children}</th>;
}
