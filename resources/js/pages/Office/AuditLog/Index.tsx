import { Head, Link, router } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

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
                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            Audit log viewer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            className="grid gap-3 md:grid-cols-5"
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
                                                    formData.get('action') || '',
                                                ) || null,
                                            module:
                                                String(
                                                    formData.get('module') || '',
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
                            <select
                                name="user_id"
                                defaultValue={filters.user_id}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            >
                                <option value="">Semua user</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                name="action"
                                defaultValue={filters.action}
                                placeholder="Aksi"
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            />
                            <input
                                name="module"
                                defaultValue={filters.module}
                                placeholder="Modul"
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            />
                            <input
                                type="date"
                                name="from"
                                defaultValue={filters.from}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            />
                            <input
                                type="date"
                                name="to"
                                defaultValue={filters.to}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            />
                            <Button
                                type="submit"
                                className="md:col-span-5 md:w-fit"
                            >
                                Filter log
                            </Button>
                        </form>

                        {auditLogs.data.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
                                Belum ada audit log yang cocok dengan filter.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {auditLogs.data.map((entry) => (
                                    <details
                                        key={entry.id}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-4"
                                    >
                                        <summary className="cursor-pointer list-none">
                                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <p className="font-medium text-[#0F172A]">
                                                        {entry.action}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {entry.module} •{' '}
                                                        {entry.user_name ??
                                                            'System'}{' '}
                                                        • {entry.created_at ??
                                                            '-'}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    {entry.notes ??
                                                        'Tanpa catatan'}
                                                </p>
                                            </div>
                                        </summary>
                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <JsonPanel
                                                title="Before"
                                                value={entry.old_values}
                                            />
                                            <JsonPanel
                                                title="After"
                                                value={entry.new_values}
                                            />
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-slate-500">
                                Halaman {auditLogs.current_page} dari{' '}
                                {auditLogs.last_page} • {auditLogs.total} log
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {auditLogs.links.map((link) => (
                                    <Button
                                        key={`${link.label}-${link.url ?? 'null'}`}
                                        asChild={link.url !== null}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        className="min-w-11"
                                        disabled={link.url === null}
                                    >
                                        {link.url === null ? (
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ) : (
                                            <Link
                                                href={link.url}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
        <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-2 text-sm font-semibold text-[#0F172A]">{title}</p>
            <pre className="overflow-x-auto text-xs text-slate-600">
                {JSON.stringify(value, null, 2)}
            </pre>
        </div>
    );
}
