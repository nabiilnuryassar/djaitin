import { Head, Link, router } from '@inertiajs/react';
import { Inbox, ClipboardList } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

// Office Primitives
import { PageHeader } from '@/components/office/page-header';
import { FilterBar } from '@/components/office/filter-bar';
import { StatusBadge } from '@/components/office/status-badge';
import { EmptyState } from '@/components/office/empty-state';
import { PremiumCard } from '@/components/office/premium-card';

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
            <Head title="Papan Produksi" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Operasional"
                    title="Papan Produksi"
                    description="Pantau due date, progres konveksi, dan update status order langsung dari board produksi."
                    actions={
                        <Button asChild variant="outline" className="rounded-xl cursor-pointer">
                            <Link href={office.orders.index()}>
                                Lihat Semua Pesanan
                            </Link>
                        </Button>
                    }
                />

                <FilterBar>
                    <form
                        className="grid gap-3 md:grid-cols-3 w-full"
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
                            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                        >
                            <option value="">Semua Status</option>
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
                            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                        >
                            <option value="">Semua Tipe</option>
                            {orderTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                            Terapkan Filter
                        </Button>
                    </form>
                </FilterBar>

                <div className="space-y-4">
                    {orders.data.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="Tidak ada order produksi"
                            description="Tidak ada order produksi yang cocok dengan filter saat ini."
                        />
                    ) : (
                        orders.data.map((order) => (
                            <PremiumCard
                                key={order.id}
                                className="transition hover:border-brand-blue/30"
                            >
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="space-y-3 xl:max-w-lg">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={office.orders.show(
                                                    order.id,
                                                )}
                                                className="font-bold text-brand-ink text-base hover:text-brand-blue transition"
                                            >
                                                {order.order_number}
                                            </Link>
                                            <Badge variant="outline" className="rounded-full">
                                                {order.order_type === 'convection' ? 'Konveksi' : 'RTW'}
                                            </Badge>
                                            <Badge
                                                className={cn(
                                                    'rounded-full border-none font-semibold',
                                                    order.overdue
                                                        ? 'bg-red-50 text-red-700'
                                                        : 'bg-emerald-50 text-emerald-700'
                                                )}
                                            >
                                                {order.overdue
                                                    ? 'Terlambat (Overdue)'
                                                    : 'Tepat Waktu'}
                                            </Badge>
                                            <StatusBadge value={order.status} domain="order" />
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-semibold text-brand-ink">
                                                {order.customer_name ??
                                                    'Tanpa nama pelanggan'}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Tenggat: <span className="font-medium text-brand-ink">{order.due_date ?? '-'}</span>
                                            </p>
                                            <p className="text-muted-foreground">
                                                Sisa tagihan: <span className="font-semibold text-brand-ink">{formatCurrency(
                                                    order.outstanding_amount,
                                                )}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 xl:min-w-[430px] xl:grid-cols-2">
                                        {can.update_status ? (
                                            <form
                                                {...office.orders.status.form(
                                                    order.id,
                                                )}
                                                className="rounded-2xl border border-border/70 bg-brand-mist/30 p-4"
                                            >
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-brand-ink">
                                                            Status Cepat
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Perbarui status operasional pesanan.
                                                        </p>
                                                    </div>
                                                    <select
                                                        name="status"
                                                        defaultValue={
                                                            order.status
                                                        }
                                                        className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
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
                                                        className="w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer"
                                                    >
                                                        Perbarui Status
                                                    </Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="rounded-2xl border border-border/70 bg-brand-mist/30 p-4">
                                                <p className="text-sm font-semibold text-brand-ink">
                                                    Status Pesanan
                                                </p>
                                                <div className="mt-2">
                                                    <StatusBadge value={order.status} domain="order" />
                                                </div>
                                            </div>
                                        )}

                                        {order.order_type ===
                                            'convection' &&
                                        can.update_stage ? (
                                            <form
                                                {...office.orders.productionStage.form(
                                                    order.id,
                                                )}
                                                className="rounded-2xl border border-border/70 bg-brand-mist/30 p-4"
                                            >
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-brand-ink">
                                                            Tahap Produksi
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Perbarui progress produksi konveksi.
                                                        </p>
                                                    </div>
                                                    <select
                                                        name="production_stage"
                                                        defaultValue={
                                                            order.production_stage ??
                                                            'design'
                                                        }
                                                        className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
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
                                                        className="w-full rounded-xl cursor-pointer"
                                                    >
                                                        Perbarui Tahap
                                                    </Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="rounded-2xl border border-border/70 bg-brand-mist/30 p-4">
                                                <p className="text-sm font-semibold text-brand-ink">
                                                    Tahap Produksi
                                                </p>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {order.order_type ===
                                                    'convection'
                                                        ? formatLabel(
                                                              order.production_stage ??
                                                                  'belum_diatur',
                                                          )
                                                        : 'RTW (Tanpa tahapan produksi)'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </PremiumCard>
                        ))
                    )}
                </div>
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
