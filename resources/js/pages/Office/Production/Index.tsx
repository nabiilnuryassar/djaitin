import { Head, Link, router } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

type Props = {
    filters: {
        status: string;
        order_type: string;
    };
    orders: {
        data: Array<{
            id: number;
            order_number: string;
            customer_name: string | null;
            status: string;
            order_type: string;
            production_stage: string | null;
            due_date: string | null;
            overdue: boolean;
            outstanding_amount: number;
        }>;
    };
    statuses: Array<{ value: string; label: string }>;
    orderTypes: Array<{ value: string; label: string }>;
    productionStages: Array<{ value: string; label: string }>;
    quickStatuses: Array<{ value: string; label: string }>;
    can: {
        update_stage: boolean;
        update_status: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Produksi', href: office.production.index() },
];

export default function ProductionIndex({
    filters,
    orders,
    orderTypes,
    productionStages,
    quickStatuses,
    statuses,
    can,
}: Props) {
    const submitFilters = (formData: FormData) => {
        router.get(
            office.production.index.url({
                query: {
                    status: String(formData.get('status') || '') || null,
                    order_type:
                        String(formData.get('order_type') || '') || null,
                },
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Production Board" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Production board
                            </CardTitle>
                            <p className="text-sm text-slate-600">
                                Pantau due date, progres konveksi, dan update
                                status order langsung dari board produksi.
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={office.orders.index()}>
                                Lihat daftar order
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            className="grid gap-3 md:grid-cols-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitFilters(
                                    new FormData(event.currentTarget),
                                );
                            }}
                        >
                            <select
                                name="status"
                                defaultValue={filters.status}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            >
                                <option value="">Semua status</option>
                                {statuses.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="order_type"
                                defaultValue={filters.order_type}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            >
                                <option value="">Semua tipe</option>
                                {orderTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <Button type="submit">Terapkan filter</Button>
                        </form>

                        <div className="space-y-3">
                            {orders.data.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                                    Tidak ada order produksi yang cocok dengan
                                    filter.
                                </div>
                            ) : (
                                orders.data.map((order) => (
                                    <div
                                        key={order.id}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-4"
                                    >
                                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="space-y-3 xl:max-w-lg">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link
                                                        href={office.orders.show(
                                                            order.id,
                                                        )}
                                                        className="font-semibold text-[#0F172A]"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                    <Badge variant="secondary">
                                                        {formatLabel(
                                                            order.order_type,
                                                        )}
                                                    </Badge>
                                                    <Badge
                                                        className={
                                                            order.overdue
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }
                                                    >
                                                        {order.overdue
                                                            ? 'Overdue'
                                                            : 'On Track'}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {formatLabel(
                                                            order.status,
                                                        )}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {order.customer_name ??
                                                            'Tanpa nama pelanggan'}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        Due date:{' '}
                                                        {order.due_date ?? '-'}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        Sisa tagihan:{' '}
                                                        {formatCurrency(
                                                            order.outstanding_amount,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 xl:min-w-[430px] xl:grid-cols-2">
                                                {can.update_status ? (
                                                    <form
                                                        {...office.orders.status.form(
                                                            order.id,
                                                        )}
                                                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                                                    >
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-[#0F172A]">
                                                                    Quick
                                                                    status
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    Update
                                                                    progres
                                                                    operasional
                                                                    tanpa masuk
                                                                    detail order.
                                                                </p>
                                                            </div>
                                                            <select
                                                                name="status"
                                                                defaultValue={
                                                                    order.status
                                                                }
                                                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                            >
                                                                {quickStatuses.map(
                                                                    (
                                                                        status,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                status.value
                                                                            }
                                                                            value={
                                                                                status.value
                                                                            }
                                                                        >
                                                                            {
                                                                                status.label
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                            <Button
                                                                type="submit"
                                                                className="w-full"
                                                            >
                                                                Update status
                                                            </Button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                                        <p className="text-sm font-semibold text-[#0F172A]">
                                                            Status order
                                                        </p>
                                                        <p className="mt-2 text-sm text-slate-600">
                                                            {formatLabel(
                                                                order.status,
                                                            )}
                                                        </p>
                                                    </div>
                                                )}

                                                {order.order_type ===
                                                    'convection' &&
                                                can.update_stage ? (
                                                    <form
                                                        {...office.orders.productionStage.form(
                                                            order.id,
                                                        )}
                                                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                                                    >
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-[#0F172A]">
                                                                    Tahap
                                                                    produksi
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    Cocok untuk
                                                                    order
                                                                    konveksi
                                                                    yang butuh
                                                                    tracking
                                                                    bertahap.
                                                                </p>
                                                            </div>
                                                            <select
                                                                name="production_stage"
                                                                defaultValue={
                                                                    order.production_stage ??
                                                                    'design'
                                                                }
                                                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                            >
                                                                {productionStages.map(
                                                                    (stage) => (
                                                                        <option
                                                                            key={
                                                                                stage.value
                                                                            }
                                                                            value={
                                                                                stage.value
                                                                            }
                                                                        >
                                                                            {
                                                                                stage.label
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                            <Button
                                                                type="submit"
                                                                variant="outline"
                                                                className="w-full"
                                                            >
                                                                Update tahap
                                                            </Button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                                        <p className="text-sm font-semibold text-[#0F172A]">
                                                            Tahap produksi
                                                        </p>
                                                        <p className="mt-2 text-sm text-slate-600">
                                                            {order.order_type ===
                                                            'convection'
                                                                ? formatLabel(
                                                                      order.production_stage ??
                                                                          'belum_diatur',
                                                                  )
                                                                : 'Tidak memakai tracking tahap produksi'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}

function formatLabel(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
