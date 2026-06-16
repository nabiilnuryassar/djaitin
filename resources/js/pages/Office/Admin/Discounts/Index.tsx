import { Head } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { EmptyState } from '@/components/office/empty-state';
import { PageHeader } from '@/components/office/page-header';
import { SectionShell } from '@/components/office/section-shell';
import { Button } from '@/components/ui/button';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

// Office Primitives

type Props = {
    policyId: number;
    values: {
        loyalty_order_threshold: number;
        loyalty_discount_percent: number;
    };
    history: Array<{
        id: number;
        user_name: string | null;
        created_at: string | null;
        old_values: Record<string, unknown> | null;
        new_values: Record<string, unknown> | null;
        notes: string | null;
    }>;
    can: {
        update: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Diskon Loyalitas', href: office.admin.discounts.index() },
];

export default function DiscountsIndex({
    policyId,
    values,
    history,
    can,
}: Props) {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Kebijakan Diskon" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Admin"
                    title="Kebijakan Diskon"
                    description="Atur batas pesanan closed dan persentase potongan harga otomatis untuk pelanggan loyal."
                />

                <SectionShell title="Atur Kebijakan Diskon">
                    <form
                        {...office.admin.discounts.update.form(policyId)}
                        className="grid gap-6 md:grid-cols-2"
                    >
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-brand-ink">
                                Batas Minimum Pesanan Closed
                            </span>
                            <input
                                name="loyalty_order_threshold"
                                type="number"
                                min={1}
                                defaultValue={
                                    values.loyalty_order_threshold
                                }
                                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                            />
                            <span className="block text-xs leading-5 text-muted-foreground">
                                Diskon aktif setelah pelanggan menyelesaikan pesanan sebanyak batas ini.
                                Jika nilainya 5, diskon mulai berlaku pada order berikutnya (ke-6).
                            </span>
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-brand-ink">
                                Persentase Diskon (%)
                            </span>
                            <input
                                name="loyalty_discount_percent"
                                type="number"
                                min={0}
                                max={100}
                                defaultValue={
                                    values.loyalty_discount_percent
                                }
                                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                            />
                            <span className="block text-xs leading-5 text-muted-foreground">
                                Nilai default diskon adalah 20% untuk pelanggan yang sudah loyal.
                            </span>
                        </label>
                        {can.update && (
                            <div className="md:col-span-2 border-t border-border/50 pt-4">
                                <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                                    Simpan Kebijakan
                                </Button>
                            </div>
                        )}
                    </form>
                </SectionShell>

                <SectionShell title="Riwayat Perubahan Kebijakan">
                    {history.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="Belum ada riwayat"
                            description="Belum ada perubahan kebijakan diskon yang tercatat."
                        />
                    ) : (
                        <div className="space-y-4">
                            {history.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="rounded-2xl border border-border bg-brand-mist/30 p-4"
                                >
                                    <p className="font-semibold text-brand-ink text-sm">
                                        Oleh: {entry.user_name ?? 'Sistem'} · {entry.created_at ?? '-'}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {entry.notes ?? 'Tanpa catatan'}
                                    </p>
                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Nilai Lama:</p>
                                            <pre className="overflow-x-auto rounded-xl border border-border/50 bg-white p-3 text-[11px] font-mono text-brand-ink">
                                                {JSON.stringify(
                                                    entry.old_values,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Nilai Baru:</p>
                                            <pre className="overflow-x-auto rounded-xl border border-border/50 bg-white p-3 text-[11px] font-mono text-brand-ink">
                                                {JSON.stringify(
                                                    entry.new_values,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionShell>
            </div>
        </OfficeLayout>
    );
}
