import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardList,
    CreditCard,
    DollarSign,
    Factory,
    Gauge,
    Layers3,
    PackageCheck,
    ShieldAlert,
    Users,
} from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
    index as ordersIndex,
    show as showOrder,
} from '@/actions/App/Http/Controllers/Office/OrderController';
import { FlashMessage } from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import OfficeLayout from '@/layouts/office-layout';
import { cn } from '@/lib/utils';
import office from '@/routes/office';
import { verify as verifyPayment } from '@/routes/office/payments';
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
        order_type: string;
        customer_name: string | null;
        total_amount: number;
        outstanding_amount: number;
    }>;
    orderStatusDistribution: Array<{
        key: string;
        label: string;
        count: number;
    }>;
    pendingPayments: Array<{
        id: number;
        payment_number: string;
        amount: number;
        reference_number: string | null;
        method: string;
        order: {
            id: number | null;
            order_number: string | null;
            customer_name: string | null;
        };
    }>;
    productionPulse: {
        active_count: number;
        stages: Array<{
            key: string;
            label: string;
            count: number;
            orders: Array<{
                id: number;
                order_number: string;
                customer_name: string | null;
            }>;
        }>;
    };
    can: {
        view_payments: boolean;
        verify_payments: boolean;
    };
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
    orderStatusDistribution,
    pendingPayments,
    productionPulse,
    can,
}: Props) {
    const totalStatusOrders = orderStatusDistribution.reduce(
        (total, item) => total + item.count,
        0,
    );

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Operasional" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_38%),linear-gradient(180deg,_#f8f8ff_0%,_#f6f7ff_45%,_#f8fafc_100%)] p-4 md:p-6">
                <FlashMessage />

                <div className="space-y-2">
                    <p className="text-sm font-medium text-[#4775d1]">
                        Overview
                    </p>
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="[font-family:var(--font-heading)] text-3xl font-semibold tracking-tight text-[#16213f] md:text-4xl">
                                Dashboard Operasional
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Ringkasan kerja untuk tim {formatRole(role)},
                                dengan fokus pada order aktif, verifikasi
                                pembayaran, dan progres produksi hari ini.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <AlertPill
                                icon={ShieldAlert}
                                label="Order Terlambat"
                                value={alerts.overdue_orders.toString()}
                                tone="danger"
                            />
                            <AlertPill
                                icon={PackageCheck}
                                label="Low Stock"
                                value={alerts.low_stock_products.toString()}
                                tone="warning"
                            />
                            <AlertPill
                                icon={Users}
                                label="Pelanggan Loyal"
                                value={alerts.loyal_customers.toString()}
                                tone="info"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-12">
                    {metricCards.map((card, index) => (
                        <MetricCard
                            key={card.key}
                            index={index}
                            icon={
                                iconMap[card.icon as MetricIconKey] ??
                                ClipboardList
                            }
                            label={card.label}
                            value={card.value}
                            hint={card.hint}
                            orderStatusDistribution={orderStatusDistribution}
                            canViewPayments={can.view_payments}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_360px]">
                    <div className="grid gap-4">
                        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.07)] backdrop-blur">
                            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="[font-family:var(--font-heading)] text-xl font-semibold text-[#16213f]">
                                        Recent Orders
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Snapshot cepat antrean order terbaru.
                                    </p>
                                </div>
                                <Link
                                    href={ordersIndex()}
                                    className="text-sm font-semibold tracking-[0.14em] text-[#2d68d8] uppercase transition hover:text-[#1e4fb4]"
                                >
                                    View All Orders
                                </Link>
                            </div>

                            {recentOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                                    <ClipboardList className="size-10 text-slate-300" />
                                    <p className="mt-4 [font-family:var(--font-heading)] text-lg font-semibold text-[#16213f]">
                                        Belum ada order terbaru
                                    </p>
                                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                                        Order terbaru akan muncul di panel ini
                                        untuk membantu tim office membaca ritme
                                        kerja harian.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <div className="min-w-[720px]">
                                        <div className="grid grid-cols-[1.05fr_1.45fr_1fr_1fr_1.2fr] gap-4 bg-[#f6f5ff] px-6 py-4 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                            <span>Order ID</span>
                                            <span>Customer</span>
                                            <span>Type</span>
                                            <span>Status</span>
                                            <span>Amount</span>
                                        </div>
                                        {recentOrders.map((order) => (
                                            <Link
                                                key={order.id}
                                                href={showOrder(order.id)}
                                                className="grid grid-cols-[1.05fr_1.45fr_1fr_1fr_1.2fr] gap-4 border-t border-slate-100 px-6 py-5 text-sm transition hover:bg-[#f8fbff]"
                                            >
                                                <div className="font-semibold text-[#1d2a49]">
                                                    {order.order_number}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#1d2a49]">
                                                        {order.customer_name ??
                                                            'Pelanggan tidak diketahui'}
                                                    </p>
                                                </div>
                                                <div className="text-slate-600">
                                                    {formatTypeLabel(
                                                        order.order_type,
                                                    )}
                                                </div>
                                                <div>
                                                    <span
                                                        className={orderStatusBadgeClassName(
                                                            order.status,
                                                        )}
                                                    >
                                                        {formatStatusLabel(
                                                            order.status,
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#1d2a49]">
                                                        {formatCurrency(
                                                            order.total_amount,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Sisa{' '}
                                                        {formatCurrency(
                                                            order.outstanding_amount,
                                                        )}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.07)] backdrop-blur">
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <h2 className="[font-family:var(--font-heading)] text-xl font-semibold text-[#16213f]">
                                        Production Pulse
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Fokus live untuk batch yang sedang
                                        bergerak.
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#2f69d8] uppercase">
                                    <span className="size-2 rounded-full bg-[#2f69d8]" />
                                    Live Batches
                                </div>
                            </div>
                            <div className="space-y-5 px-6 py-6">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                            Active Production
                                        </p>
                                        <p className="[font-family:var(--font-heading)] text-3xl font-semibold text-[#16213f]">
                                            {productionPulse.active_count}
                                        </p>
                                    </div>
                                    <Link
                                        href={office.production.index()}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2d68d8]"
                                    >
                                        Buka board
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                                <div className="grid gap-3 xl:grid-cols-5">
                                    {productionPulse.stages.map((stage) => (
                                        <ProductionStageColumn
                                            key={stage.key}
                                            stage={stage}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-4">
                        <section className="rounded-[28px] border border-white/70 bg-white/90 px-5 py-5 shadow-[0_20px_50px_rgba(15,23,42,0.07)] backdrop-blur">
                            <h2 className="[font-family:var(--font-heading)] text-lg font-semibold text-[#16213f]">
                                Order Status Distribution
                            </h2>
                            <div className="mt-5 space-y-4">
                                {orderStatusDistribution.map((item) => (
                                    <div key={item.key} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-600">
                                                {item.label}
                                            </span>
                                            <span className="font-semibold text-[#1d2a49]">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100">
                                            <div
                                                className={cn(
                                                    'h-2 rounded-full transition-all',
                                                    distributionBarClassName(
                                                        item.key,
                                                    ),
                                                )}
                                                style={{
                                                    width: `${calculateBarWidth(item.count, totalStatusOrders)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-white/70 bg-white/90 px-5 py-5 shadow-[0_20px_50px_rgba(15,23,42,0.07)] backdrop-blur">
                            <div className="flex items-center justify-between">
                                <h2 className="[font-family:var(--font-heading)] text-lg font-semibold text-[#16213f]">
                                    Verification Queue
                                </h2>
                                {can.view_payments && (
                                    <Link
                                        href={office.payments.index()}
                                        className="text-xs font-semibold tracking-[0.14em] text-[#2d68d8] uppercase"
                                    >
                                        Review All
                                    </Link>
                                )}
                            </div>

                            <div className="mt-5 space-y-4">
                                {pendingPayments.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                                        Tidak ada transfer yang perlu
                                        diverifikasi.
                                    </div>
                                ) : (
                                    pendingPayments.map((payment) => (
                                        <article
                                            key={payment.id}
                                            className="rounded-2xl border border-slate-100 bg-[#fbfcff] p-4 shadow-[0_10px_25px_rgba(15,23,42,0.04)]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-[#1d2a49]">
                                                        {payment.order
                                                            .customer_name ??
                                                            'Pelanggan tidak diketahui'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Order{' '}
                                                        {payment.order.id ? (
                                                            <Link
                                                                href={showOrder(
                                                                    payment
                                                                        .order
                                                                        .id,
                                                                )}
                                                                className="font-medium text-[#2d68d8]"
                                                            >
                                                                #
                                                                {
                                                                    payment
                                                                        .order
                                                                        .order_number
                                                                }
                                                            </Link>
                                                        ) : (
                                                            (payment.order
                                                                .order_number ??
                                                            '-')
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-semibold text-[#1d2a49]">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                <span className="rounded-full bg-[#e9f0ff] px-2.5 py-1 font-medium text-[#2d68d8]">
                                                    {formatMethodLabel(
                                                        payment.method,
                                                    )}
                                                </span>
                                                <span>
                                                    Ref:{' '}
                                                    {payment.reference_number ??
                                                        '-'}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                {can.verify_payments && (
                                                    <Form
                                                        {...verifyPayment.form(
                                                            payment.id,
                                                        )}
                                                        className="flex-1"
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                type="submit"
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="h-10 w-full rounded-xl bg-[#1558cf] text-white hover:bg-[#0f49b0]"
                                                            >
                                                                Approve
                                                            </Button>
                                                        )}
                                                    </Form>
                                                )}
                                                {can.view_payments && (
                                                    <Button
                                                        asChild
                                                        type="button"
                                                        variant="outline"
                                                        className="h-10 rounded-xl border-red-100 bg-red-50 px-4 text-red-600 hover:bg-red-100 hover:text-red-700"
                                                    >
                                                        <Link
                                                            href={office.payments.index()}
                                                        >
                                                            Review
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </OfficeLayout>
    );
}

function MetricCard({
    index,
    icon: Icon,
    label,
    value,
    hint,
    orderStatusDistribution,
    canViewPayments,
}: {
    index: number;
    icon: typeof ClipboardList;
    label: string;
    value: string;
    hint: string;
    orderStatusDistribution: Props['orderStatusDistribution'];
    canViewPayments: boolean;
}) {
    const columnSpanClassName =
        ['lg:col-span-3', 'lg:col-span-4', 'lg:col-span-2', 'lg:col-span-3'][
            index
        ] ?? 'lg:col-span-3';

    return (
        <section
            className={cn(
                'rounded-[26px] border border-white/70 px-5 py-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur',
                columnSpanClassName,
                index === 2
                    ? 'bg-[#1558cf] text-white'
                    : 'bg-white/90 text-[#16213f]',
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                    <p
                        className={cn(
                            'text-xs font-semibold tracking-[0.16em] uppercase',
                            index === 2 ? 'text-white/70' : 'text-slate-400',
                        )}
                    >
                        {label}
                    </p>
                    <p className="[font-family:var(--font-heading)] text-3xl font-semibold">
                        {value}
                    </p>
                    <p
                        className={cn(
                            'max-w-sm text-xs leading-5',
                            index === 2 ? 'text-white/80' : 'text-slate-500',
                        )}
                    >
                        {hint}
                    </p>
                </div>
                <div
                    className={cn(
                        'rounded-2xl p-3',
                        index === 2
                            ? 'bg-white/12 text-white'
                            : 'bg-[#eef4ff] text-[#2563eb]',
                    )}
                >
                    <Icon className="size-5" />
                </div>
            </div>

            {index === 1 ? (
                <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#fff7df] px-3 py-2 text-xs font-medium text-[#7c6500]">
                    <Gauge className="size-4" />
                    Performance target tetap terjaga.
                </div>
            ) : null}

            {index === 2 && canViewPayments ? (
                <Button
                    asChild
                    type="button"
                    className="mt-5 h-9 rounded-xl bg-white/14 px-4 text-white hover:bg-white/20"
                >
                    <Link href={office.payments.index()}>Review All</Link>
                </Button>
            ) : null}

            {index === 3 ? (
                <div className="mt-5 space-y-3">
                    <div className="flex gap-2">
                        {orderStatusDistribution.slice(1, 4).map((item) => (
                            <div
                                key={item.key}
                                className={cn(
                                    'h-2 flex-1 rounded-full',
                                    distributionBarClassName(item.key),
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-2 text-[11px] text-slate-500">
                        {orderStatusDistribution.slice(1, 4).map((item) => (
                            <span key={item.key}>
                                {item.label}: {item.count}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
}

function AlertPill({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof ShieldAlert;
    label: string;
    value: string;
    tone: 'danger' | 'warning' | 'info' | 'success';
}) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-3 rounded-full border px-4 py-2',
                {
                    danger: 'border-red-200 bg-red-50 text-red-800',
                    warning: 'border-amber-200 bg-amber-50 text-amber-800',
                    info: 'border-blue-200 bg-blue-50 text-blue-800',
                    success:
                        'border-emerald-200 bg-emerald-50 text-emerald-800',
                }[tone],
            )}
        >
            <Icon className="size-4" />
            <span className="text-xs font-semibold tracking-[0.14em] uppercase">
                {label}
            </span>
            <span className="[font-family:var(--font-heading)] text-base font-semibold">
                {value}
            </span>
        </div>
    );
}

function ProductionStageColumn({
    stage,
}: {
    stage: Props['productionPulse']['stages'][number];
}) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-[#fbfcff] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        {stage.label}
                    </p>
                    <p className="mt-2 [font-family:var(--font-heading)] text-xl font-semibold text-[#16213f]">
                        {stage.count}
                    </p>
                </div>
                <div
                    className={cn(
                        'mt-1 h-12 w-1 rounded-full',
                        productionStageAccentClassName(stage.key),
                    )}
                />
            </div>
            <div className="mt-4 space-y-2">
                {stage.orders.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada batch.</p>
                ) : (
                    stage.orders.map((order) => (
                        <Link
                            key={order.id}
                            href={showOrder(order.id)}
                            className="block rounded-xl bg-white px-3 py-2 text-xs transition hover:bg-[#f0f6ff]"
                        >
                            <p className="font-semibold text-[#1d2a49]">
                                {order.order_number}
                            </p>
                            <p className="mt-1 text-slate-500">
                                {order.customer_name ?? 'Tanpa nama pelanggan'}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

function orderStatusBadgeClassName(status: string): string {
    return cn(
        'inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold',
        {
            draft: 'bg-slate-100 text-slate-700',
            pending_payment: 'bg-amber-100 text-amber-800',
            in_progress: 'bg-blue-100 text-blue-800',
            pickup: 'bg-blue-100 text-blue-800',
            done: 'bg-indigo-100 text-indigo-700',
            delivered: 'bg-violet-100 text-violet-800',
            closed: 'bg-slate-200 text-slate-700',
            cancelled: 'bg-red-100 text-red-800',
        }[status] ?? 'bg-slate-100 text-slate-700',
    );
}

function distributionBarClassName(status: string): string {
    return (
        {
            draft: 'bg-slate-300',
            pending_payment: 'bg-amber-400',
            in_progress: 'bg-blue-600',
            done: 'bg-indigo-600',
            closed: 'bg-slate-500',
        }[status] ?? 'bg-slate-300'
    );
}

function productionStageAccentClassName(stage: string): string {
    return (
        {
            material: 'bg-slate-300',
            production: 'bg-blue-600',
            qc: 'bg-amber-400',
            packing: 'bg-violet-500',
            shipping: 'bg-emerald-500',
        }[stage] ?? 'bg-slate-300'
    );
}

function calculateBarWidth(count: number, total: number): number {
    if (total === 0) {
        return 6;
    }

    return Math.max(8, Math.round((count / total) * 100));
}

function formatStatusLabel(status: string): string {
    return status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatTypeLabel(type: string): string {
    return type
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatMethodLabel(method: string): string {
    return method
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
    inventory: Layers3,
    alert: ShieldAlert,
    production: Factory,
    done: PackageCheck,
} as const;
