import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CreditCard,
    Ellipsis,
    Factory,
    ShieldCheck,
    Shirt,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/layouts/customer-layout';
import { cn } from '@/lib/utils';
import customer from '@/routes/customer';
import type { SharedPageProps } from '@/types/auth';

type Props = {
    customerProfile: {
        name: string;
        member_label: string;
    };
    summary: {
        active_orders: number;
        pending_payments: number;
        saved_measurements: number;
        total_spending: number;
    };
    recentOrders: Array<{
        id: number;
        order_number: string;
        product_name: string;
        status: string;
    }>;
    recentPayments: Array<{
        id: number;
        amount: number;
        status: string;
        payment_date: string | null;
    }>;
};

export default function CustomerDashboard({
    customerProfile,
    summary,
    recentOrders,
    recentPayments,
}: Props) {
    const page = usePage<SharedPageProps>();
    const unreadNotificationsCount = page.props.unread_notifications_count ?? 0;

    return (
        <CustomerLayout>
            <Head title="Beranda Customer" />

            <div className="space-y-6">
                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_320px]">
                    <div className="relative overflow-hidden rounded-[28px] border border-[#dbe4f5] bg-white px-6 py-6 shadow-[0_22px_50px_rgba(15,23,42,0.06)]">
                        <div className="absolute top-8 right-10 hidden text-[#dce7fb] lg:block">
                            <Sparkles className="size-24" strokeWidth={1.4} />
                        </div>
                        <div className="max-w-xl space-y-2">
                            <h1 className="[font-family:var(--font-heading)] text-3xl font-semibold tracking-tight text-[#1a243d] md:text-[2.15rem]">
                                Selamat datang, {customerProfile.name}
                            </h1>
                            <p className="max-w-lg text-sm leading-7 text-slate-600">
                                Senang melihat Anda kembali. Berikut adalah
                                ringkasan aktivitas busana bespoke Anda hari
                                ini.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-3 md:grid-cols-3">
                            <HeroMetric
                                label="Pesanan Aktif"
                                value={summary.active_orders.toString()}
                                accent="blue"
                            />
                            <HeroMetric
                                label="Total Pengeluaran"
                                value={formatCurrency(summary.total_spending)}
                                accent="dark"
                            />
                            <HeroMetric
                                label="Pemberitahuan"
                                value={unreadNotificationsCount.toString()}
                                accent="amber"
                            />
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#184bc8_0%,#0f39b3_100%)] px-6 py-6 text-white shadow-[0_24px_50px_rgba(21,88,207,0.28)]">
                        <div className="absolute inset-y-0 right-0 w-32 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_58%)]" />
                        <div className="absolute top-4 right-4 h-28 w-24 rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0))]" />
                        <div className="relative space-y-4">
                            <span className="inline-flex rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                                Eksklusif
                            </span>
                            <div className="space-y-2">
                                <h2 className="[font-family:var(--font-heading)] text-2xl leading-tight font-semibold">
                                    Koleksi Batik Sutra Terbaru
                                </h2>
                                <p className="text-sm leading-6 text-white/80">
                                    Pesan sekarang untuk diskon 15% khusus
                                    member premium.
                                </p>
                            </div>
                            <Button
                                asChild
                                className="h-10 rounded-full bg-white px-5 text-[#184bc8] hover:bg-white/90"
                            >
                                <Link href={customer.catalog.index()}>
                                    Lihat Katalog
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <ServiceCard
                        href={customer.tailor.configure()}
                        icon={Shirt}
                        title="Pesan Tailor"
                        description="Layanan ukur custom eksklusif"
                    />
                    <ServiceCard
                        href={customer.catalog.index()}
                        icon={ShoppingBag}
                        title="Belanja RTW"
                        description="Telusuri katalog ready-to-wear"
                    />
                    <ServiceCard
                        href={customer.convection.create()}
                        icon={Factory}
                        title="Request Konveksi"
                        description="Pesanan produksi massal & seragam"
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_320px]">
                    <div className="rounded-[28px] border border-[#dbe4f5] bg-white shadow-[0_22px_50px_rgba(15,23,42,0.06)]">
                        <div className="flex items-center justify-between px-6 py-5">
                            <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#1a243d]">
                                Pesanan Aktif
                            </h2>
                            <Link
                                href={customer.orders.index()}
                                className="text-sm font-semibold text-[#2f62d8]"
                            >
                                Lihat Semua
                            </Link>
                        </div>

                        <div className="border-t border-[#edf2fb]">
                            <div className="grid grid-cols-[1.1fr_2fr_1.1fr_0.7fr] gap-4 px-6 py-4 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                <span>ID Pesanan</span>
                                <span>Produk</span>
                                <span>Status</span>
                                <span>Aksi</span>
                            </div>

                            {recentOrders.length === 0 ? (
                                <div className="px-6 py-12 text-sm text-slate-500">
                                    Belum ada pesanan untuk ditampilkan.
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="grid grid-cols-[1.1fr_2fr_1.1fr_0.7fr] gap-4 border-t border-[#edf2fb] px-6 py-4"
                                    >
                                        <div className="text-sm font-semibold text-[#1a243d]">
                                            {order.order_number}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#f3f6fb] text-slate-400">
                                                <Shirt className="size-4" />
                                            </div>
                                            <p className="text-sm font-medium text-[#1a243d]">
                                                {order.product_name}
                                            </p>
                                        </div>
                                        <div>
                                            <span
                                                className={statusBadgeClassName(
                                                    order.status,
                                                )}
                                            >
                                                {formatStatus(order.status)}
                                            </span>
                                        </div>
                                        <div>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className="h-9 w-9 rounded-full p-0 text-slate-500 hover:bg-[#f3f7ff] hover:text-[#2f62d8]"
                                            >
                                                <Link
                                                    href={customer.orders.show(
                                                        order.id,
                                                    )}
                                                >
                                                    <Ellipsis className="size-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-[#dbe4f5] bg-white px-5 py-5 shadow-[0_22px_50px_rgba(15,23,42,0.06)]">
                        <div className="flex items-center justify-between">
                            <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#1a243d]">
                                Riwayat Pembayaran
                            </h2>
                            <Link
                                href={customer.payments.index()}
                                className="text-sm font-semibold text-[#2f62d8]"
                            >
                                Riwayat
                            </Link>
                        </div>

                        <div className="mt-5 space-y-3">
                            {recentPayments.length === 0 ? (
                                <div className="rounded-2xl bg-[#f7f9fd] px-4 py-10 text-center text-sm text-slate-500">
                                    Belum ada pembayaran.
                                </div>
                            ) : (
                                recentPayments.map((payment) => (
                                    <PaymentHistoryCard
                                        key={payment.id}
                                        payment={payment}
                                    />
                                ))
                            )}
                        </div>

                        <div className="mt-4 rounded-2xl bg-[#f3f7ff] p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-[#184bc8] text-white">
                                    <CreditCard className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-[#184bc8]">
                                        Selesaikan Pembayaran
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {summary.pending_payments > 0
                                            ? 'Ada tagihan menunggu persetujuan atau unggahan bukti tambahan.'
                                            : 'Semua pembayaran sedang aman. Anda tetap bisa membuka riwayat transaksi.'}
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    size="sm"
                                    className="rounded-full bg-[#184bc8] px-4 text-white hover:bg-[#103da9]"
                                >
                                    <Link href={customer.payments.index()}>
                                        Bayar
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="flex flex-col gap-6 border-t border-[#dbe4f5] pt-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="size-8" />
                        <div>
                            <p className="font-semibold tracking-[0.16em] text-[#162044] uppercase">
                                Djaitin
                            </p>
                            <p className="text-xs">
                                © 2026 Djaitin. All rights reserved.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-5 text-xs md:text-sm">
                        <Link
                            href={customer.profile.edit({
                                query: { section: 'profile' },
                            })}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href={customer.profile.edit({
                                query: { section: 'profile' },
                            })}
                        >
                            Terms of Service
                        </Link>
                        <Link href={customer.notifications.index()}>
                            Contact Support
                        </Link>
                    </div>
                </footer>
            </div>
        </CustomerLayout>
    );
}

function HeroMetric({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent: 'blue' | 'dark' | 'amber';
}) {
    return (
        <div className="rounded-2xl bg-[#f4f7fc] px-4 py-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p
                className={cn(
                    'mt-2 [font-family:var(--font-heading)] text-[1.75rem] font-semibold tracking-tight',
                    {
                        blue: 'text-[#184bc8]',
                        dark: 'text-[#1a243d]',
                        amber: 'text-[#f4b21a]',
                    }[accent],
                )}
            >
                {value}
            </p>
        </div>
    );
}

function ServiceCard({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: ReturnType<typeof customer.home>;
    icon: typeof Shirt;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 rounded-[24px] border border-[#dbe4f5] bg-white px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f9fbff]"
        >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f3f6fb] text-[#184bc8]">
                <Icon className="size-5" />
            </div>
            <div>
                <p className="font-semibold text-[#1a243d]">{title}</p>
                <p className="mt-1 text-xs text-slate-500">{description}</p>
            </div>
        </Link>
    );
}

function PaymentHistoryCard({
    payment,
}: {
    payment: Props['recentPayments'][number];
}) {
    const isVerified = payment.status === 'verified';

    return (
        <div className="rounded-2xl bg-[#f7f9fd] px-4 py-4">
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        'mt-0.5 flex size-9 items-center justify-center rounded-full',
                        isVerified
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-amber-100 text-amber-600',
                    )}
                >
                    {isVerified ? (
                        <ShieldCheck className="size-4" />
                    ) : (
                        <Bell className="size-4" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold text-[#1a243d]">
                                {formatCurrency(payment.amount)}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                {payment.payment_date ?? '-'}
                            </p>
                        </div>
                        <span
                            className={cn(
                                'inline-flex items-center gap-1 text-[11px] font-semibold uppercase',
                                isVerified
                                    ? 'text-emerald-600'
                                    : 'text-amber-600',
                            )}
                        >
                            <span className="size-1.5 rounded-full bg-current" />
                            {formatStatus(payment.status)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function statusBadgeClassName(status: string): string {
    return cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase',
        {
            pending_payment: 'bg-slate-100 text-slate-500',
            in_progress: 'bg-blue-100 text-[#184bc8]',
            done: 'bg-emerald-100 text-emerald-600',
            delivered: 'bg-emerald-100 text-emerald-600',
            closed: 'bg-slate-200 text-slate-600',
        }[status] ?? 'bg-slate-100 text-slate-500',
    );
}

function formatStatus(status: string): string {
    return status
        .split('_')
        .map((part) => part.toUpperCase())
        .join('_');
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
