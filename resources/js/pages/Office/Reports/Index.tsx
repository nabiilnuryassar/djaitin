import { Head, Link, router } from '@inertiajs/react';
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
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

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
    const [tab, setTab] = useState<'omzet' | 'pembayaran' | 'inventori' | 'pelanggan'>('omzet');
    const funnelSeries = [
        { label: 'Draft', value: funnelMetrics.draft, color: '#CBD5E1' },
        {
            label: 'Submitted',
            value: funnelMetrics.submitted,
            color: '#93C5FD',
        },
        { label: 'Paid', value: funnelMetrics.paid, color: '#2563EB' },
        { label: 'Closed', value: funnelMetrics.closed, color: '#F9C11A' },
    ];

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Laporan operasional
                            </CardTitle>
                            <p className="text-sm text-slate-600">
                                Omzet, breakdown pembayaran, inventori, dan
                                pelanggan loyal dalam satu dashboard.
                            </p>
                        </div>
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
                                className="inline-flex h-10 items-center rounded-md bg-[#2563EB] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                            >
                                Export PDF
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
                                className="inline-flex h-10 items-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                Export CSV
                            </a>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            className="grid gap-3 md:grid-cols-4"
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
                                                    formData.get('preset') || '',
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
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
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
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            />
                            <input
                                type="date"
                                name="to"
                                defaultValue={filters.to}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            />
                            <Button type="submit">Terapkan</Button>
                        </form>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <SummaryCard
                                label="Omzet"
                                value={formatCurrency(summary.total_revenue)}
                            />
                            <SummaryCard
                                label="Metode Aktif"
                                value={summary.total_transactions.toString()}
                            />
                            <SummaryCard
                                label="Pelanggan Loyal"
                                value={summary.loyal_customers.toString()}
                            />
                            <SummaryCard
                                label="Produk Low Stock"
                                value={summary.low_stock_products.toString()}
                            />
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                            <Card className="rounded-2xl border-slate-200/80 bg-white">
                                <CardHeader className="space-y-2">
                                    <CardTitle className="text-base text-[#0F172A]">
                                        Repeat Order Rate
                                    </CardTitle>
                                    <p className="text-sm text-slate-600">
                                        Persentase customer aktif yang melakukan
                                        minimal dua order dalam periode ini.
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="flex items-end justify-between gap-4 rounded-2xl bg-[#F8FAFF] px-5 py-4">
                                        <div>
                                            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                                Repeat Rate
                                            </p>
                                            <p className="[font-family:var(--font-heading)] text-3xl font-bold text-[#0F172A]">
                                                {repeatOrderRate.rate}%
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {repeatOrderRate.active_customers}{' '}
                                            customer aktif
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <MetricSplit
                                            accentClassName="bg-[#2563EB]"
                                            count={
                                                repeatOrderRate.repeat_customers
                                            }
                                            label="Repeat customer"
                                            total={
                                                repeatOrderRate.active_customers
                                            }
                                        />
                                        <MetricSplit
                                            accentClassName="bg-[#DBEAFE]"
                                            count={
                                                repeatOrderRate.one_time_customers
                                            }
                                            label="One-time customer"
                                            total={
                                                repeatOrderRate.active_customers
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-slate-200/80 bg-white">
                                <CardHeader className="space-y-2">
                                    <CardTitle className="text-base text-[#0F172A]">
                                        SLA & Order Overdue
                                    </CardTitle>
                                    <p className="text-sm text-slate-600">
                                        Pantau order terbuka yang mendekati atau
                                        melewati due date.
                                    </p>
                                </CardHeader>
                                <CardContent className="grid gap-3 sm:grid-cols-3">
                                    <AnalyticsTile
                                        label="Order Terbuka"
                                        tone="text-[#2563EB]"
                                        value={slaMetrics.open_orders}
                                    />
                                    <AnalyticsTile
                                        label="Overdue"
                                        tone="text-red-600"
                                        value={slaMetrics.overdue_orders}
                                    />
                                    <AnalyticsTile
                                        label="Jatuh Tempo Hari Ini"
                                        tone="text-amber-600"
                                        value={slaMetrics.due_today_orders}
                                    />

                                    <div className="sm:col-span-3 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4">
                                        <div className="mb-2 flex items-center justify-between gap-4">
                                            <p className="text-sm font-medium text-[#0F172A]">
                                                Overdue Rate
                                            </p>
                                            <p className="text-sm font-semibold text-red-600">
                                                {slaMetrics.overdue_rate}%
                                            </p>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-200">
                                            <div
                                                className="h-2 rounded-full bg-red-500 transition-[width] duration-300"
                                                style={{
                                                    width: `${Math.min(
                                                        slaMetrics.overdue_rate,
                                                        100,
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="rounded-2xl border-slate-200/80 bg-white">
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-base text-[#0F172A]">
                                    Order Funnel
                                </CardTitle>
                                <p className="text-sm text-slate-600">
                                    Draft, submit, paid, dan closed untuk
                                    membaca titik drop-off order.
                                </p>
                            </CardHeader>
                            <CardContent className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                                <FunnelChart data={funnelSeries} />
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    {funnelSeries.map((item) => (
                                        <div
                                            key={item.label}
                                            className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4"
                                        >
                                            <div className="mb-3 flex items-center gap-3">
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            item.color,
                                                    }}
                                                />
                                                <p className="text-sm font-medium text-slate-600">
                                                    {item.label}
                                                </p>
                                            </div>
                                            <p className="[font-family:var(--font-heading)] text-2xl font-bold text-[#0F172A]">
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-wrap gap-2">
                            {[
                                ['omzet', 'Omzet'],
                                ['pembayaran', 'Pembayaran'],
                                ['inventori', 'Inventori'],
                                ['pelanggan', 'Pelanggan Loyal'],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        setTab(
                                            value as
                                                | 'omzet'
                                                | 'pembayaran'
                                                | 'inventori'
                                                | 'pelanggan',
                                        )
                                    }
                                    className={
                                        tab === value
                                            ? 'rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white'
                                            : 'rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600'
                                    }
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {tab === 'omzet' && (
                            <Card className="rounded-2xl border-slate-200/80">
                                <CardHeader>
                                    <CardTitle>Chart omzet harian</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RevenueChart data={revenueSeries} />
                                </CardContent>
                            </Card>
                        )}

                        {tab === 'pembayaran' && (
                            <div className="grid gap-3 md:grid-cols-2">
                                {paymentBreakdown.map((item) => (
                                    <Card
                                        key={item.method}
                                        className="rounded-2xl border-slate-200/80"
                                    >
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-slate-500">
                                                {item.method}
                                            </p>
                                            <p className="[font-family:var(--font-heading)] text-2xl font-bold text-[#0F172A]">
                                                {formatCurrency(item.amount)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {tab === 'inventori' && (
                            <div className="space-y-3">
                                {lowStockProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-[#0F172A]">
                                                    {product.name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {product.sku} • stok{' '}
                                                    {product.stock}
                                                </p>
                                            </div>
                                            <p className="font-medium text-[#0F172A]">
                                                {formatCurrency(
                                                    product.final_price,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {tab === 'pelanggan' && (
                            <div className="space-y-3">
                                {loyalCustomers.map((customer) => (
                                    <div
                                        key={customer.name}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-[#0F172A]">
                                                    {customer.name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {customer.order_count} order
                                                </p>
                                            </div>
                                            <p className="font-medium text-[#0F172A]">
                                                {formatCurrency(
                                                    customer.revenue,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <Card className="rounded-2xl border-slate-200/80">
            <CardContent className="pt-6">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="[font-family:var(--font-heading)] text-2xl font-bold text-[#0F172A]">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

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
        <div className="rounded-2xl border border-slate-200/80 bg-[#F8FAFF] px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                {label}
            </p>
            <p
                className={`[font-family:var(--font-heading)] mt-2 text-2xl font-bold ${tone}`}
            >
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
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                <p className="text-sm text-slate-600">{count}</p>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
                <div
                    className={`h-2 rounded-full transition-[width] duration-300 ${accentClassName}`}
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
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                Belum ada data funnel untuk periode ini.
            </div>
        );
    }

    return (
        <div className="h-72 rounded-2xl bg-[#F8FAFF] p-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 12, right: 20, left: 12, bottom: 8 }}
                >
                    <CartesianGrid
                        stroke="#DBEAFE"
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
                        tick={{ fill: '#0F172A', fontSize: 12 }}
                        tickLine={false}
                        type="category"
                        width={80}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: 16,
                            borderColor: '#DBEAFE',
                            boxShadow:
                                '0 12px 36px rgba(37, 99, 235, 0.12)',
                        }}
                        formatter={(value) => Number(value ?? 0)}
                        labelStyle={{ color: '#0F172A', fontWeight: 600 }}
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
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                Tidak ada data omzet untuk periode ini.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="h-72 rounded-2xl bg-[#F8FAFF] p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 12, right: 12, left: 12, bottom: 8 }}
                    >
                        <CartesianGrid
                            stroke="#DBEAFE"
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
                                borderColor: '#DBEAFE',
                                boxShadow:
                                    '0 12px 36px rgba(37, 99, 235, 0.12)',
                            }}
                            formatter={(value) =>
                                formatCurrency(Number(value ?? 0))
                            }
                            labelStyle={{ color: '#0F172A', fontWeight: 600 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#2563EB"
                            strokeWidth={3}
                            dot={{
                                fill: '#2563EB',
                                r: 4,
                                stroke: '#DBEAFE',
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 6,
                                fill: '#F9C11A',
                                stroke: '#162044',
                                strokeWidth: 2,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
                {data.slice(-4).map((item) => (
                    <div
                        key={item.date}
                        className="rounded-xl bg-slate-50 px-3 py-2 text-sm"
                    >
                        <p className="text-slate-500">{item.date}</p>
                        <p className="font-medium text-[#0F172A]">
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
