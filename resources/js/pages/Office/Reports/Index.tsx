import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { TrendingUp, CreditCard, Users, AlertTriangle, Inbox } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { Button } from '@/components/ui/button';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

// Office Primitives
import { PageHeader } from '@/components/office/page-header';
import { FilterBar } from '@/components/office/filter-bar';
import { KpiTile } from '@/components/office/kpi-tile';
import { PremiumCard } from '@/components/office/premium-card';
import { SegmentedTabs } from '@/components/office/segmented-tabs';
import { EmptyState } from '@/components/office/empty-state';

type Props = {
    filters: {
        preset: string;
        from: string;
        to: string;
    };
    summary: {
        total_revenue: number;
        total_transactions: number;
        loyal_customers: number;
        low_stock_products: number;
    };
    revenueSeries: Array<{
        date: string;
        amount: number;
    }>;
    paymentBreakdown: Array<{
        method: string;
        amount: number;
    }>;
    loyalCustomers: Array<{
        name: string;
        order_count: number;
        revenue: number;
    }>;
    repeatOrderRate: {
        repeat_customers: number;
        one_time_customers: number;
        active_customers: number;
        rate: number;
    };
    slaMetrics: {
        open_orders: number;
        overdue_orders: number;
        due_today_orders: number;
        overdue_rate: number;
    };
    funnelMetrics: {
        draft: number;
        submitted: number;
        paid: number;
        closed: number;
    };
    lowStockProducts: Array<{
        id: number;
        sku: string;
        name: string;
        stock: number;
        final_price: number;
    }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Laporan', href: office.reports.index() },
];

export default function ReportsIndex({
    filters,
    summary,
    revenueSeries,
    paymentBreakdown,
    loyalCustomers,
    repeatOrderRate,
    slaMetrics,
    funnelMetrics,
    lowStockProducts,
}: Props) {
    const [tab, setTab] = useState<
        'omzet' | 'pembayaran' | 'inventori' | 'pelanggan'
    >('omzet');

    const funnelSeries = [
        { label: 'Draft', value: funnelMetrics.draft, color: '#94A3B8' },
        {
            label: 'Submitted',
            value: funnelMetrics.submitted,
            color: '#3B73B9',
        },
        { label: 'Paid', value: funnelMetrics.paid, color: '#123C78' },
        { label: 'Closed', value: funnelMetrics.closed, color: '#FFD21F' },
    ];

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Operasional" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Analisis"
                    title="Laporan Operasional"
                    description="Pantau omzet harian, breakdown metode pembayaran, stok produk, dan data pelanggan loyal."
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={office.reports.export.url({
                                    query: {
                                        preset: filters.preset,
                                        from: filters.from,
                                        to: filters.to,
                                        format: 'pdf',
                                    },
                                })}
                                className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-deep cursor-pointer"
                            >
                                Ekspor PDF
                            </a>
                            <a
                                href={office.reports.export.url({
                                    query: {
                                        preset: filters.preset,
                                        from: filters.from,
                                        to: filters.to,
                                        format: 'csv',
                                    },
                                })}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-mist/50 cursor-pointer"
                            >
                                Ekspor CSV
                            </a>
                        </div>
                    }
                />

                <FilterBar>
                    <form
                        className="grid gap-3 md:grid-cols-4 w-full"
                        onSubmit={(event) => {
                            event.preventDefault();
                            const formData = new FormData(
                                event.currentTarget,
                            );

                            router.get(
                                office.reports.index.url({
                                    query: {
                                        preset:
                                            String(
                                                formData.get('preset') ||
                                                    '',
                                            ) || null,
                                        from:
                                            String(
                                                formData.get('from') || '',
                                            ) || null,
                                        to:
                                            String(
                                                formData.get('to') || '',
                                            ) || null,
                                    },
                                }),
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
                    >
                        <select
                            name="preset"
                            defaultValue={filters.preset}
                            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                        >
                            <option value="today">Hari ini</option>
                            <option value="7d">7 hari</option>
                            <option value="30d">30 hari</option>
                            <option value="custom">Custom</option>
                        </select>
                        <input
                            type="date"
                            name="from"
                            defaultValue={filters.from}
                            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                        />
                        <input
                            type="date"
                            name="to"
                            defaultValue={filters.to}
                            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                        />
                        <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                            Terapkan Filter
                        </Button>
                    </form>
                </FilterBar>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <KpiTile
                        label="Total Omzet"
                        value={formatCurrency(summary.total_revenue)}
                        icon={TrendingUp}
                        tone="blue"
                    />
                    <KpiTile
                        label="Transaksi Berhasil"
                        value={summary.total_transactions}
                        icon={CreditCard}
                        tone="slate"
                    />
                    <KpiTile
                        label="Pelanggan Loyal"
                        value={summary.loyal_customers}
                        icon={Users}
                        tone="gold"
                    />
                    <KpiTile
                        label="Produk Stok Tipis"
                        value={summary.low_stock_products}
                        icon={AlertTriangle}
                        tone="red"
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <PremiumCard>
                        <div className="mb-5 space-y-1">
                            <h3 className="text-base font-bold text-brand-ink">Tingkat Pembelian Ulang (Repeat Order)</h3>
                            <p className="text-xs text-muted-foreground">
                                Persentase pelanggan aktif yang memesan kembali minimal 2 kali.
                            </p>
                        </div>
                        <div className="space-y-5">
                            <div className="flex items-end justify-between gap-4 rounded-2xl bg-brand-mist/50 border border-border/40 px-5 py-4">
                                <div>
                                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Repeat Rate
                                    </p>
                                    <p className="text-3xl font-bold text-brand-ink mt-0.5">
                                        {repeatOrderRate.rate}%
                                    </p>
                                </div>
                                <p className="text-sm font-semibold text-brand-blue bg-white px-3 py-1.5 rounded-full border border-border/70">
                                    {repeatOrderRate.active_customers} Pelanggan Aktif
                                </p>
                            </div>

                            <div className="space-y-4">
                                <MetricSplit
                                    accentClassName="bg-brand-blue"
                                    count={
                                        repeatOrderRate.repeat_customers
                                    }
                                    label="Pelanggan Repeat Order"
                                    total={
                                        repeatOrderRate.active_customers
                                    }
                                />
                                <MetricSplit
                                    accentClassName="bg-slate-300"
                                    count={
                                        repeatOrderRate.one_time_customers
                                    }
                                    label="Pelanggan One-Time"
                                    total={
                                        repeatOrderRate.active_customers
                                    }
                                />
                            </div>
                        </div>
                    </PremiumCard>

                    <PremiumCard>
                        <div className="mb-5 space-y-1">
                            <h3 className="text-base font-bold text-brand-ink">Ketepatan Waktu & SLA</h3>
                            <p className="text-xs text-muted-foreground">
                                Pesanan terbuka yang mendekati atau melewati tenggat waktu.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <AnalyticsTile
                                label="Pesanan Terbuka"
                                tone="text-brand-blue"
                                value={slaMetrics.open_orders}
                            />
                            <AnalyticsTile
                                label="Overdue"
                                tone="text-red-600"
                                value={slaMetrics.overdue_orders}
                            />
                            <AnalyticsTile
                                label="Jatuh Tempo Hari Ini"
                                tone="text-brand-gold text-yellow-600"
                                value={slaMetrics.due_today_orders}
                            />

                            <div className="rounded-2xl border border-border/70 bg-brand-mist/30 px-4 py-4 sm:col-span-3">
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <p className="text-sm font-semibold text-brand-ink">
                                        Rasio Keterlambatan (Overdue Rate)
                                    </p>
                                    <p className="text-sm font-bold text-red-600">
                                        {slaMetrics.overdue_rate}%
                                    </p>
                                </div>
                                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-red-500 transition-[width] duration-300"
                                        style={{
                                            width: `${Math.min(
                                                slaMetrics.overdue_rate,
                                                100,
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>
                </div>

                <PremiumCard>
                    <div className="mb-5 space-y-1">
                        <h3 className="text-base font-bold text-brand-ink">Funnel Pesanan</h3>
                        <p className="text-xs text-muted-foreground">
                            Visualisasi progress pesanan dari draft hingga selesai untuk mendeteksi drop-off.
                        </p>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <FunnelChart data={funnelSeries} />
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            {funnelSeries.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-border/70 bg-brand-mist/30 px-4 py-3"
                                >
                                    <div className="mb-2 flex items-center gap-3">
                                        <span
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    item.color,
                                            }}
                                        />
                                        <p className="text-sm font-semibold text-brand-ink">
                                            {item.label}
                                        </p>
                                    </div>
                                    <p className="text-2xl font-bold text-brand-ink">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </PremiumCard>

                <div className="mb-2">
                    <SegmentedTabs
                        items={[
                            { value: 'omzet', label: 'Omzet Harian' },
                            { value: 'pembayaran', label: 'Breakdown Pembayaran' },
                            { value: 'inventori', label: 'Stok Inventori' },
                            { value: 'pelanggan', label: 'Pelanggan Loyal' },
                        ]}
                        value={tab}
                        onChange={(val) => setTab(val as any)}
                    />
                </div>

                {tab === 'omzet' && (
                    <PremiumCard>
                        <h3 className="text-base font-bold text-brand-ink mb-4">Grafik Omzet Harian</h3>
                        <RevenueChart data={revenueSeries} />
                    </PremiumCard>
                )}

                {tab === 'pembayaran' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {paymentBreakdown.map((item) => (
                            <PremiumCard
                                key={item.method}
                                className="transition hover:border-brand-blue/30"
                            >
                                <p className="text-sm font-semibold text-muted-foreground">
                                    Metode: {item.method}
                                </p>
                                <p className="text-2xl font-bold text-brand-ink mt-2">
                                    {formatCurrency(item.amount)}
                                </p>
                            </PremiumCard>
                        ))}
                    </div>
                )}

                {tab === 'inventori' && (
                    <div className="space-y-3">
                        {lowStockProducts.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                title="Semua stok aman"
                                description="Tidak ada produk ready-to-wear yang berada di bawah ambang stok minim."
                            />
                        ) : (
                            lowStockProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm transition hover:border-brand-blue/30"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-brand-ink">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                SKU: <span className="font-mono">{product.sku}</span> · Stok:{' '}
                                                <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                                    {product.stock}
                                                </span>
                                            </p>
                                        </div>
                                        <p className="font-bold text-brand-ink text-sm">
                                            {formatCurrency(product.final_price)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {tab === 'pelanggan' && (
                    <div className="space-y-3">
                        {loyalCustomers.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                title="Belum ada data pelanggan"
                                description="Belum ada data transaksi pelanggan loyal yang tercatat."
                            />
                        ) : (
                            loyalCustomers.map((customer) => (
                                <div
                                    key={customer.name}
                                    className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm transition hover:border-brand-blue/30"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-brand-ink">
                                                {customer.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Telah menyelesaikan:{' '}
                                                <span className="font-semibold text-brand-ink">
                                                    {customer.order_count} pesanan
                                                </span>
                                            </p>
                                        </div>
                                        <p className="font-bold text-brand-ink text-sm">
                                            Kontribusi: {formatCurrency(customer.revenue)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </OfficeLayout>
    );
}

// Subcomponents helper
function AnalyticsTile({
    label,
    tone,
    value,
}: {
    label: string;
    tone: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-border/70 bg-brand-mist/30 px-4 py-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${tone}`}>
                {value}
            </p>
        </div>
    );
}

function MetricSplit({
    accentClassName,
    count,
    label,
    total,
}: {
    accentClassName: string;
    count: number;
    label: string;
    total: number;
}) {
    const width = total > 0 ? Math.max((count / total) * 100, 6) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm">
                <p className="font-semibold text-brand-ink">{label}</p>
                <p className="font-semibold text-brand-ink">{count}</p>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-[width] duration-300 ${accentClassName}`}
                    style={{
                        width: `${Math.min(width, 100)}%`,
                    }}
                />
            </div>
        </div>
    );
}

function FunnelChart({
    data,
}: {
    data: Array<{ label: string; value: number; color: string }>;
}) {
    if (data.every((item) => item.value === 0)) {
        return (
            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground bg-brand-mist/20">
                Belum ada data funnel untuk periode ini.
            </div>
        );
    }

    return (
        <div className="h-72 rounded-2xl bg-brand-mist/20 border border-border/40 p-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 12, right: 20, left: 12, bottom: 8 }}
                >
                    <CartesianGrid
                        stroke="rgba(18, 60, 120, 0.08)"
                        strokeDasharray="4 4"
                        horizontal={false}
                    />
                    <XAxis
                        axisLine={false}
                        tick={{ fill: '#475569', fontSize: 12 }}
                        tickLine={false}
                        type="number"
                    />
                    <YAxis
                        axisLine={false}
                        dataKey="label"
                        tick={{ fill: '#123C78', fontSize: 12, fontWeight: 500 }}
                        tickLine={false}
                        type="category"
                        width={80}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: 16,
                            borderColor: 'rgba(18, 60, 120, 0.15)',
                            boxShadow: '0 12px 36px rgba(18, 60, 120, 0.08)',
                        }}
                        formatter={(value) => Number(value ?? 0)}
                        labelStyle={{ color: '#123C78', fontWeight: 600 }}
                    />
                    <Bar dataKey="value" radius={[0, 12, 12, 0]}>
                        {data.map((item) => (
                            <Cell key={item.label} fill={item.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function RevenueChart({
    data,
}: {
    data: Array<{ date: string; amount: number }>;
}) {
    if (data.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground bg-brand-mist/20">
                Tidak ada data omzet untuk periode ini.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="h-72 rounded-2xl bg-brand-mist/20 border border-border/40 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 12, right: 12, left: 12, bottom: 8 }}
                    >
                        <CartesianGrid
                            stroke="rgba(18, 60, 120, 0.08)"
                            strokeDasharray="4 4"
                            vertical={false}
                        />
                        <XAxis
                            axisLine={false}
                            dataKey="date"
                            tick={{ fill: '#475569', fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis
                            axisLine={false}
                            tick={{ fill: '#475569', fontSize: 12 }}
                            tickFormatter={(value) =>
                                new Intl.NumberFormat('id-ID', {
                                    notation: 'compact',
                                    compactDisplay: 'short',
                                }).format(Number(value))
                            }
                            tickLine={false}
                            width={64}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 16,
                                borderColor: 'rgba(18, 60, 120, 0.15)',
                                boxShadow: '0 12px 36px rgba(18, 60, 120, 0.08)',
                            }}
                            formatter={(value) =>
                                formatCurrency(Number(value ?? 0))
                            }
                            labelStyle={{ color: '#123C78', fontWeight: 600 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#3B73B9"
                            strokeWidth={3}
                            dot={{
                                fill: '#3B73B9',
                                r: 4,
                                stroke: '#EFF4FF',
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 6,
                                fill: '#FFD21F',
                                stroke: '#123C78',
                                strokeWidth: 2,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
                {data.slice(-4).map((item) => (
                    <div
                        key={item.date}
                        className="rounded-xl border border-border/70 bg-brand-mist/30 px-3 py-2 text-sm"
                    >
                        <p className="text-muted-foreground text-xs">{item.date}</p>
                        <p className="font-semibold text-brand-ink mt-0.5">
                            {formatCurrency(item.amount)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
