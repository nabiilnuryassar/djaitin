import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardList,
    CreditCard,
    DollarSign,
    Factory,
    Gauge,
    Inbox,
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
import { EmptyState } from '@/components/office/empty-state';
import { KpiTile } from '@/components/office/kpi-tile';
import { PageHeader } from '@/components/office/page-header';
import { PremiumCard } from '@/components/office/premium-card';
import { StatusBadge } from '@/components/office/status-badge';
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

const metricToneMap: Record<string, 'blue' | 'gold' | 'green' | 'red' | 'slate'> = {
    orders: 'blue',
    payments: 'gold',
    customers: 'green',
    revenue: 'gold',
    inventory: 'slate',
    alert: 'red',
    production: 'blue',
    done: 'green',
};

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

            <div className="flex flex-1 flex-col gap-6 bg-brand-mist p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Back Office"
                    title="Dashboard Operasional"
                    description={`Ringkasan kerja untuk tim ${formatRole(role)}, dengan fokus pada order aktif, verifikasi pembayaran, dan progres produksi hari ini.`}
                    actions={
                        <div className="flex flex-wrap gap-3">
                            <AlertPill
                                icon={ShieldAlert}
                                label="Order Terlambat"
                                value={alerts.overdue_orders.toString()}
                                tone="danger"
                            />
                            <AlertPill
                                icon={PackageCheck}
                                label="Stok Rendah"
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
                    }
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((card) => (
                        <KpiTile
                            key={card.key}
                            label={card.label}
                            value={card.value}
                            helper={card.hint}
                            icon={iconMap[card.icon as MetricIconKey] ?? ClipboardList}
                            tone={metricToneMap[card.icon] ?? 'blue'}
                        />
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_360px]">
                    <div className="grid gap-4">
                        <PremiumCard padded={false}>
                            <div className="flex flex-col gap-3 border-b border-border/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-brand-ink">
                                        Pesanan Terbaru
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Snapshot cepat antrean order terbaru.
                                    </p>
                                </div>
                                <Link
                                    href={ordersIndex()}
                                    className="text-sm font-semibold tracking-[0.14em] text-brand-blue uppercase transition hover:text-brand-blue-deep"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            {recentOrders.length === 0 ? (
                                <div className="p-6">
                                    <EmptyState
                                        icon={ClipboardList}
                                        title="Belum ada order terbaru"
                                        description="Order terbaru akan muncul di panel ini untuk membantu tim office membaca ritme kerja harian."
                                    />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <div className="min-w-[720px]">
                                        <div className="grid grid-cols-[1.05fr_1.45fr_1fr_1fr_1.2fr] gap-4 bg-muted/50 px-6 py-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                            <span>ID Pesanan</span>
                                            <span>Pelanggan</span>
                                            <span>Tipe</span>
                                            <span>Status</span>
                                            <span>Jumlah</span>
                                        </div>
                                        {recentOrders.map((order) => (
                                            <Link
                                                key={order.id}
                                                href={showOrder(order.id)}
                                                className="grid cursor-pointer grid-cols-[1.05fr_1.45fr_1fr_1fr_1.2fr] gap-4 border-t border-border/70 px-6 py-4 text-sm transition hover:bg-brand-mist/60"
                                            >
                                                <div className="font-semibold text-brand-ink">
                                                    {order.order_number}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-brand-ink">
                                                        {order.customer_name ??
                                                            'Pelanggan tidak diketahui'}
                                                    </p>
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {formatTypeLabel(
                                                        order.order_type,
                                                    )}
                                                </div>
                                                <div>
                                                    <StatusBadge value={order.status} domain="order" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-brand-ink">
                                                        {formatCurrency(
                                                            order.total_amount,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
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
                        </PremiumCard>

                        <PremiumCard padded={false}>
                            <div className="flex items-center justify-between border-b border-border/70 px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-semibold text-brand-ink">
                                        Pulsa Produksi
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Fokus live untuk batch yang sedang
                                        bergerak.
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-brand-blue uppercase">
                                    <span className="size-2 rounded-full bg-brand-blue" />
                                    Live Batch
                                </div>
                            </div>
                            <div className="space-y-5 px-6 py-6">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                            Produksi Aktif
                                        </p>
                                        <p className="text-3xl font-semibold text-brand-ink">
                                            {productionPulse.active_count}
                                        </p>
                                    </div>
                                    <Link
                                        href={office.production.index()}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue"
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
                        </PremiumCard>
                    </div>

                    <div className="grid gap-4">
                        <PremiumCard>
                            <h2 className="text-lg font-semibold text-brand-ink">
                                Distribusi Status Order
                            </h2>
                            <div className="mt-5 space-y-4">
                                {orderStatusDistribution.map((item) => (
                                    <div key={item.key} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">
                                                {item.label}
                                            </span>
                                            <span className="font-semibold text-brand-ink">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted/60">
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
                        </PremiumCard>

                        <PremiumCard>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-brand-ink">
                                    Antrian Verifikasi
                                </h2>
                                {can.view_payments && (
                                    <Link
                                        href={office.payments.index()}
                                        className="text-xs font-semibold tracking-[0.14em] text-brand-blue uppercase"
                                    >
                                        Lihat Semua
                                    </Link>
                                )}
                            </div>

                            <div className="mt-5 space-y-4">
                                {pendingPayments.length === 0 ? (
                                    <EmptyState
                                        icon={Inbox}
                                        title="Tidak ada transfer menunggu"
                                        description="Tidak ada transfer yang perlu diverifikasi."
                                    />
                                ) : (
                                    pendingPayments.map((payment) => (
                                        <article
                                            key={payment.id}
                                            className="rounded-2xl border border-border/70 bg-brand-mist/50 p-4 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-brand-ink">
                                                        {payment.order
                                                            .customer_name ??
                                                            'Pelanggan tidak diketahui'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Order{' '}
                                                        {payment.order.id ? (
                                                            <Link
                                                                href={showOrder(
                                                                    payment
                                                                        .order
                                                                        .id,
                                                                )}
                                                                className="font-medium text-brand-blue"
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
                                                <p className="text-sm font-semibold text-brand-ink">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 font-medium text-brand-blue">
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
                                                                className="h-10 w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep"
                                                            >
                                                                Setujui
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
                        </PremiumCard>
                    </div>
                </div>
            </div>
        </OfficeLayout>
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
            <span className="text-base font-semibold">
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
        <div className="rounded-2xl border border-border/70 bg-brand-mist/50 p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        {stage.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-brand-ink">
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
                    <p className="text-xs text-muted-foreground">Belum ada batch.</p>
                ) : (
                    stage.orders.map((order) => (
                        <Link
                            key={order.id}
                            href={showOrder(order.id)}
                            className="block cursor-pointer rounded-xl bg-white px-3 py-2 text-xs transition hover:bg-brand-blue/5"
                        >
                            <p className="font-semibold text-brand-ink">
                                {order.order_number}
                            </p>
                            <p className="mt-1 text-muted-foreground">
                                {order.customer_name ?? 'Tanpa nama pelanggan'}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

function distributionBarClassName(status: string): string {
    return (
        {
            draft: 'bg-slate-300',
            pending_payment: 'bg-amber-400',
            in_progress: 'bg-brand-blue',
            done: 'bg-emerald-500',
            closed: 'bg-slate-500',
        }[status] ?? 'bg-slate-300'
    );
}

function productionStageAccentClassName(stage: string): string {
    return (
        {
            material: 'bg-slate-300',
            production: 'bg-brand-blue',
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
