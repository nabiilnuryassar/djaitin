import { Head, Link, router } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { Button } from '@/components/ui/button';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

// Office Primitives
import { PageHeader } from '@/components/office/page-header';
import { FilterBar } from '@/components/office/filter-bar';
import { EmptyState } from '@/components/office/empty-state';
import { OfficePagination } from '@/components/office/pagination';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    filters: {
        user_id: string;
        action: string;
        module: string;
        from: string;
        to: string;
    };
    users: Array<{
        id: number;
        name: string;
    }>;
    auditLogs: {
        data: Array<{
            id: number;
            action: string;
            module: string;
            notes: string | null;
            user_name: string | null;
            created_at: string | null;
            old_values: Record<string, unknown> | null;
            new_values: Record<string, unknown> | null;
        }>;
        current_page: number;
        last_page: number;
        total: number;
        links: PaginationLink[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Audit Log', href: office.auditLog.index() },
];

export default function AuditLogIndex({ filters, users, auditLogs }: Props) {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Admin"
                    title="Audit Log"
                    description="Pantau riwayat perubahan, aktivitas operator, dan manipulasi data sistem secara detail."
                />

                <FilterBar>
                    <form
                        className="grid gap-3 sm:grid-cols-2 md:grid-cols-5 w-full items-end"
                        onSubmit={(event) => {
                            event.preventDefault();
                            const formData = new FormData(
                                event.currentTarget,
                            );

                            router.get(
                                office.auditLog.index.url({
                                    query: {
                                        user_id:
                                            String(
                                                formData.get('user_id') ||
                                                    '',
                                            ) || null,
                                        action:
                                            String(
                                                formData.get('action') ||
                                                    '',
                                            ) || null,
                                        module:
                                            String(
                                                formData.get('module') ||
                                                    '',
                                            ) || null,
                                        from:
                                            String(
                                                formData.get('from') || '',
                                            ) || null,
                                        to:
                                            String(
                                                formData.get('to') || '',
                                            ) || null,
                                    },
                                }),
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
                    >
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-brand-ink">Pengguna</span>
                            <select
                                name="user_id"
                                defaultValue={filters.user_id}
                                className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                            >
                                <option value="">Semua Pengguna</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-brand-ink">Aksi</span>
                            <input
                                name="action"
                                defaultValue={filters.action}
                                placeholder="Contoh: create, update"
                                className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-brand-ink">Modul</span>
                            <input
                                name="module"
                                defaultValue={filters.module}
                                placeholder="Contoh: Order, Payment"
                                className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-brand-ink">Dari Tanggal</span>
                            <input
                                type="date"
                                name="from"
                                defaultValue={filters.from}
                                className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-brand-ink">Sampai Tanggal</span>
                            <input
                                type="date"
                                name="to"
                                defaultValue={filters.to}
                                className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                            />
                        </div>
                        <div className="md:col-span-5 flex justify-end mt-2">
                            <Button
                                type="submit"
                                className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer"
                            >
                                Terapkan Filter
                            </Button>
                        </div>
                    </form>
                </FilterBar>

                {auditLogs.data.length === 0 ? (
                    <EmptyState
                        icon={Inbox}
                        title="Tidak ada audit log"
                        description="Tidak ada data audit log yang cocok dengan filter saat ini."
                    />
                ) : (
                    <div className="space-y-4">
                        {auditLogs.data.map((entry) => (
                            <details
                                key={entry.id}
                                className="group rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-brand-blue/30"
                            >
                                <summary className="cursor-pointer list-none outline-none">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <p className="font-bold text-brand-ink text-sm group-open:text-brand-blue transition">
                                                {entry.action}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Modul: <span className="font-semibold text-brand-ink">{entry.module}</span> · Operator:{' '}
                                                <span className="font-semibold text-brand-ink">{entry.user_name ?? 'Sistem'}</span> · Tanggal:{' '}
                                                <span>{entry.created_at ?? '-'}</span>
                                            </p>
                                        </div>
                                        <p className="text-xs font-semibold text-brand-ink bg-brand-mist/50 px-3 py-1.5 rounded-full border border-border/70">
                                            {entry.notes ?? 'Tanpa catatan'}
                                        </p>
                                    </div>
                                    <div className="text-[10px] text-brand-blue font-semibold mt-3 group-open:hidden">
                                        Klik untuk detail data (JSON)
                                    </div>
                                </summary>
                                <div className="mt-4 grid gap-4 border-t border-border/50 pt-4 md:grid-cols-2">
                                    <JsonPanel
                                        title="Sebelum Perubahan (Before)"
                                        value={entry.old_values}
                                    />
                                    <JsonPanel
                                        title="Setelah Perubahan (After)"
                                        value={entry.new_values}
                                    />
                                </div>
                            </details>
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-3 border-t border-border/70 pt-4 md:flex-row md:items-center md:justify-between mt-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                        Halaman {auditLogs.current_page} dari{' '}
                        {auditLogs.last_page} · Total {auditLogs.total} log aktivitas
                    </p>
                    <OfficePagination links={auditLogs.links} />
                </div>
            </div>
        </OfficeLayout>
    );
}

function JsonPanel({
    title,
    value,
}: {
    title: string;
    value: Record<string, unknown> | null;
}) {
    return (
        <div className="rounded-xl border border-border/50 bg-brand-mist/30 p-4">
            <p className="mb-2 text-xs font-semibold text-brand-blue uppercase tracking-wider">{title}</p>
            <pre className="overflow-x-auto text-[11px] font-mono text-brand-ink leading-5">
                {JSON.stringify(value, null, 2)}
            </pre>
        </div>
    );
}
