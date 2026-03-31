import { Head, Link } from '@inertiajs/react';
import { ClipboardList, CreditCard, DollarSign, Users } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { index as ordersIndex, show as showOrder } from '@/actions/App/Http/Controllers/Office/OrderController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OfficeLayout from '@/layouts/office-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    metrics: {
        orders_today: number;
        pending_payments: number;
        customers: number;
        revenue_today: number;
    };
    recentOrders: Array<{
        id: number;
        order_number: string;
        status: string;
        customer_name: string | null;
        total_amount: number;
        outstanding_amount: number;
    }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: DashboardController(),
    },
];

export default function Dashboard({ metrics, recentOrders }: Props) {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard App" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={ClipboardList}
                        label="Order Hari Ini"
                        value={metrics.orders_today.toString()}
                        hint="Order baru yang masuk hari ini."
                    />
                    <MetricCard
                        icon={CreditCard}
                        label="Transfer Pending"
                        value={metrics.pending_payments.toString()}
                        hint="Menunggu verifikasi kasir atau admin."
                    />
                    <MetricCard
                        icon={Users}
                        label="Pelanggan"
                        value={metrics.customers.toString()}
                        hint="Total pelanggan aktif di sistem."
                    />
                    <MetricCard
                        icon={DollarSign}
                        label="Omzet Hari Ini"
                        value={formatCurrency(metrics.revenue_today)}
                        hint="Akumulasi pembayaran verified hari ini."
                    />
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Order terbaru</CardTitle>
                            <CardDescription>
                                Snapshot cepat untuk operasional hari ini.
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={ordersIndex()}>Lihat semua order</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {recentOrders.length === 0 ? (
                            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                Belum ada order terbaru.
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={showOrder(order.id)}
                                    className="flex flex-col gap-3 rounded-xl border p-4 transition hover:border-primary/40 hover:bg-accent/30 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {order.order_number}
                                            </span>
                                            <Badge variant="secondary">
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {order.customer_name ?? 'Pelanggan tidak diketahui'}
                                        </p>
                                    </div>
                                    <div className="text-sm md:text-right">
                                        <p className="font-medium">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Sisa {formatCurrency(order.outstanding_amount)}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    hint,
}: {
    icon: typeof ClipboardList;
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between pt-6">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold">{value}</p>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
