import { Head } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

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
    { title: 'Discount Policy', href: office.admin.discounts.index() },
];

export default function DiscountsIndex({
    policyId,
    values,
    history,
    can,
}: Props) {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Discount Policy" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            Loyalty discount policy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            {...office.admin.discounts.update.form(policyId)}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <label className="space-y-2">
                                <span className="text-sm font-semibold text-[#0F172A]">
                                    Batas order tailor closed
                                </span>
                                <input
                                    name="loyalty_order_threshold"
                                    type="number"
                                    min={1}
                                    defaultValue={
                                        values.loyalty_order_threshold
                                    }
                                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                                />
                                <span className="block text-xs leading-5 text-slate-500">
                                    Diskon aktif setelah pelanggan menutup lebih
                                    dari nilai ini. Jika nilainya 5, diskon
                                    mulai berlaku pada order tailor ke-6.
                                </span>
                            </label>
                            <label className="space-y-2">
                                <span className="text-sm font-semibold text-[#0F172A]">
                                    Persentase diskon
                                </span>
                                <input
                                    name="loyalty_discount_percent"
                                    type="number"
                                    min={0}
                                    max={100}
                                    defaultValue={
                                        values.loyalty_discount_percent
                                    }
                                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                                />
                                <span className="block text-xs leading-5 text-slate-500">
                                    Nilai default sesuai narasi bisnis adalah
                                    20% untuk pelanggan yang sudah loyal.
                                </span>
                            </label>
                            {can.update && (
                                <div className="md:col-span-2">
                                    <Button type="submit">
                                        Simpan policy
                                    </Button>
                                </div>
                            )}
                        </form>

                        <div className="space-y-3">
                            {history.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-4"
                                >
                                    <p className="font-medium text-[#0F172A]">
                                        {entry.user_name ?? 'System'} •{' '}
                                        {entry.created_at ?? '-'}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {entry.notes ?? 'Tanpa catatan'}
                                    </p>
                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                        <pre className="overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                                            {JSON.stringify(
                                                entry.old_values,
                                                null,
                                                2,
                                            )}
                                        </pre>
                                        <pre className="overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                                            {JSON.stringify(
                                                entry.new_values,
                                                null,
                                                2,
                                            )}
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}
