import { Head, Link, router, useForm } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
    createTailor,
    index as ordersIndex,
    show as showOrder,
} from '@/actions/App/Http/Controllers/Office/OrderController';
import { EmptyState } from '@/components/office/empty-state';
import { FilterBar } from '@/components/office/filter-bar';
import { PageHeader } from '@/components/office/page-header';
import { StatusBadge } from '@/components/office/status-badge';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OfficeLayout from '@/layouts/office-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    filters: {
        search: string;
        status: string;
    };
    statuses: Array<{
        value: string;
        label: string;
    }>;
    orders: {
        data: Array<{
            id: number;
            order_number: string;
            order_type: string;
            company_name: string | null;
            customer_name: string | null;
            garment_model_name: string | null;
            status: string;
            due_date: string | null;
            total_amount: number;
            outstanding_amount: number;
        }>;
    };
    can: {
        create: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Pesanan', href: ordersIndex() },
];

export default function OrdersIndex({ filters, statuses, orders, can }: Props) {
    const form = useForm({
        search: filters.search,
        status: filters.status,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            ordersIndex.url({
                query: {
                    search: form.data.search || null,
                    status: form.data.status || null,
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
            <Head title="Pesanan" />

            <div className="flex flex-1 flex-col gap-6 bg-brand-mist p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Pesanan"
                    title="Antrian Pesanan"
                    description="Kelola tailor, ready-to-wear, dan convection order dalam satu daftar operasional."
                    actions={
                        can.create ? (
                            <Button asChild>
                                <Link href={createTailor()}>
                                    Buat Order Tailor
                                </Link>
                            </Button>
                        ) : null
                    }
                />

                <FilterBar>
                    <form
                        onSubmit={submit}
                        className="flex flex-1 flex-col gap-3 md:flex-row md:items-center"
                    >
                        <Input
                            value={form.data.search}
                            onChange={(event) =>
                                form.setData('search', event.target.value)
                            }
                            placeholder="Cari order atau pelanggan..."
                            className="flex-1"
                        />
                        <select
                            value={form.data.status}
                            onChange={(event) =>
                                form.setData('status', event.target.value)
                            }
                            className="h-9 rounded-md border bg-transparent px-3 text-sm"
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
                        <Button type="submit" variant="outline">
                            Filter
                        </Button>
                    </form>
                </FilterBar>

                <div className="grid gap-4">
                    {orders.data.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="Belum ada pesanan"
                            description="Pesanan yang cocok dengan filter akan tampil di sini."
                        />
                    ) : (
                        orders.data.map((order) => (
                            <Link
                                key={order.id}
                                href={showOrder(order.id)}
                                className="grid cursor-pointer gap-3 rounded-2xl border border-border/70 bg-white p-4 shadow-sm transition hover:border-brand-blue/40 hover:shadow-md md:grid-cols-[1.2fr_1fr_180px]"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-brand-ink">
                                            {order.order_number}
                                        </p>
                                        <Badge variant="outline" className="rounded-full">
                                            {orderTypeLabel(
                                                order.order_type,
                                            )}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {order.customer_name ??
                                            'Pelanggan tidak diketahui'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.order_type ===
                                        'convection'
                                            ? (order.company_name ??
                                              'Perusahaan belum terisi')
                                            : (order.garment_model_name ??
                                              'Model belum terisi')}
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <StatusBadge value={order.status} domain="order" />
                                    <p className="mt-2">
                                        Tenggat:{' '}
                                        {order.due_date ?? '-'}
                                    </p>
                                </div>
                                <div className="text-sm md:text-right">
                                    <p className="font-semibold text-brand-ink">
                                        {formatCurrency(
                                            order.total_amount,
                                        )}
                                    </p>
                                    <p className="text-muted-foreground">
                                        Sisa{' '}
                                        {formatCurrency(
                                            order.outstanding_amount,
                                        )}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </OfficeLayout>
    );
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function orderTypeLabel(orderType: string): string {
    if (orderType === 'convection') {
        return 'Convection';
    }

    if (orderType === 'ready_wear') {
        return 'Ready-to-Wear';
    }

    return 'Tailor';
}
