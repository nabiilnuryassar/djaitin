import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    DollarSign,
    Factory,
    Users,
} from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
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
import OfficeLayout from '@/layouts/office-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Props = {
    role: string | null;
    metricCards: Array<{
        key: string;
        label: string;
        value: string;
        hint: string;
        icon: string;
    }>;
    alerts: {
        overdue_orders: number;
        low_stock_products: number;
        revenue_30_days: number;
        loyal_customers: number;
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

type MetricIconKey = keyof typeof iconMap;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: DashboardController(),
    },
];

export default function Dashboard({
    role,
    metricCards,
    alerts,
    recentOrders,
}: Props) {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard App" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            Dashboard {formatRole(role)}
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                            Ringkasan kerja yang disesuaikan dengan akses dan
                            kebutuhan operasional kamu hari ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                        <AlertTile
                            label="Order Terlambat"
                            value={alerts.overdue_orders.toString()}
                            tone="danger"
                        />
                        <AlertTile
                            label="Produk Low Stock"
                            value={alerts.low_stock_products.toString()}
                            tone="warning"
                        />
                        <AlertTile
                            label="Omzet 30 Hari"
                            value={formatCurrency(alerts.revenue_30_days)}
                            tone="info"
                        />
                        <AlertTile
                            label="Pelanggan Loyal"
                            value={alerts.loyal_customers.toString()}
                            tone="success"
                        />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {metricCards.map((card) => (
                        <MetricCard
                            key={card.key}
                            icon={iconMap[card.icon as MetricIconKey] ?? ClipboardList}
                            label={card.label}
                            value={card.value}
                            hint={card.hint}
                        />
                    ))}
                </div>

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Order terbaru
                            </CardTitle>
                            <CardDescription>
                                Snapshot cepat untuk operasional hari ini.
                            </CardDescription>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                        >
                            <Link href={ordersIndex()}>Lihat semua order</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center">
                                <ClipboardList className="size-10 text-slate-400" />
                                <p className="mt-4 [font-family:var(--font-heading)] text-lg font-semibold text-[#0F172A]">
                                    Belum ada order terbaru
                                </p>
                                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                                    Order baru yang masuk hari ini akan muncul
                                    di sini untuk membantu tim office memantau
                                    antrean kerja.
                                </p>
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={showOrder(order.id)}
                                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-blue-200 hover:bg-[#EFF4FF]/40 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[#0F172A]">
                                                {order.order_number}
                                            </span>
                                            <Badge
                                                className={orderStatusBadgeClassName(
                                                    order.status,
                                                )}
                                            >
                                                {formatStatusLabel(
                                                    order.status,
                                                )}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {order.customer_name ??
                                                'Pelanggan tidak diketahui'}
                                        </p>
                                    </div>
                                    <div className="text-sm md:text-right">
                                        <p className="font-medium text-[#0F172A]">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                        <p className="text-slate-600">
                                            Sisa{' '}
                                            {formatCurrency(
                                                order.outstanding_amount,
                                            )}
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
        <Card className="rounded-2xl border border-transparent bg-gradient-to-br from-white to-slate-50/50 shadow-sm transition-all hover:border-blue-100 hover:shadow-md">
            <CardContent className="flex items-start justify-between pt-6">
                <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
                        {label}
                    </p>
                    <p className="[font-family:var(--font-heading)] text-3xl font-bold text-[#0F172A]">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{hint}</p>
                </div>
                <div className="rounded-2xl bg-[#EFF4FF] p-3 text-[#2563EB]">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function AlertTile({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: 'danger' | 'warning' | 'info' | 'success';
}) {
    return (
        <div
            className={cn(
                'rounded-2xl border px-4 py-4',
                {
                    danger: 'border-red-200 bg-red-50 text-red-900',
                    warning: 'border-amber-200 bg-amber-50 text-amber-900',
                    info: 'border-blue-200 bg-blue-50 text-blue-900',
                    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
                }[tone],
            )}
        >
            <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                {label}
            </p>
            <p className="mt-2 [font-family:var(--font-heading)] text-2xl font-bold">
                {value}
            </p>
        </div>
    );
}

function orderStatusBadgeClassName(status: string): string {
    return cn(
        'border-transparent font-medium',
        {
            draft: 'bg-slate-100 text-slate-700',
            pending_payment: 'bg-amber-100 text-amber-800',
            in_progress: 'bg-blue-100 text-blue-800',
            pickup: 'bg-blue-100 text-blue-800',
            done: 'bg-emerald-100 text-emerald-800',
            delivered: 'bg-emerald-100 text-emerald-800',
            closed: 'bg-emerald-100 text-emerald-800',
            cancelled: 'bg-red-100 text-red-800',
        }[status] ?? 'bg-slate-100 text-slate-700',
    );
}

function formatStatusLabel(status: string): string {
    return status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatRole(role: string | null): string {
    if (role === null) {
        return 'Office';
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
}

const iconMap = {
    orders: ClipboardList,
    payments: CreditCard,
    customers: Users,
    revenue: DollarSign,
    inventory: Archive,
    alert: AlertTriangle,
    production: Factory,
    done: CheckCircle2,
} as const;
