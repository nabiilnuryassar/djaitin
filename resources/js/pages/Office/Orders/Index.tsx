import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
    createTailor,
    index as ordersIndex,
    show as showOrder,
} from '@/actions/App/Http/Controllers/Office/OrderController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    { title: 'Orders', href: ordersIndex() },
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
            <Head title="Orders" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Order tailor
                            </CardTitle>
                            <CardDescription>
                                Filter order berdasarkan status atau pelanggan.
                            </CardDescription>
                        </div>
                        {can.create && (
                            <Button asChild>
                                <Link href={createTailor()}>
                                    Buat order tailor
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            onSubmit={submit}
                            className="grid gap-3 md:grid-cols-[1fr_220px_auto]"
                        >
                            <Input
                                value={form.data.search}
                                onChange={(event) =>
                                    form.setData('search', event.target.value)
                                }
                                placeholder="Cari order atau pelanggan..."
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

                        <div className="grid gap-4">
                            {orders.data.length === 0 ? (
                                <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                    Belum ada order yang cocok dengan filter
                                    ini.
                                </div>
                            ) : (
                                orders.data.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={showOrder(order.id)}
                                        className="grid gap-3 rounded-xl border p-4 transition hover:border-primary/40 md:grid-cols-[1.2fr_1fr_180px]"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {order.order_number}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.customer_name ??
                                                    'Pelanggan tidak diketahui'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.garment_model_name ??
                                                    'Model belum terisi'}
                                            </p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <Badge variant="secondary">
                                                {order.status}
                                            </Badge>
                                            <p className="mt-2">
                                                Due date:{' '}
                                                {order.due_date ?? '-'}
                                            </p>
                                        </div>
                                        <div className="text-sm md:text-right">
                                            <p className="font-medium">
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
                    </CardContent>
                </Card>
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
