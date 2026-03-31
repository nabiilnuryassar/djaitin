import { Head } from '@inertiajs/react';
import { Clock3, CreditCard, PackageCheck, Shirt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';
import { Link } from '@inertiajs/react';

type Props = {
    summary: {
        active_orders: number;
        pending_payments: number;
        saved_measurements: number;
    };
};

export default function CustomerDashboard({ summary }: Props) {
    return (
        <CustomerLayout>
            <Head title="Customer Dashboard" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)] md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#a34a2c]">
                            Customer Dashboard
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Ringkasan order, pembayaran, dan ukuran pribadi.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            Semua angka di halaman ini hanya merefleksikan data milik akun customer yang sedang login.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={customer.tailor.configure()}>
                            Mulai Order Tailor
                            <Shirt className="size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard
                        icon={PackageCheck}
                        label="Order Aktif"
                        value={summary.active_orders}
                        hint="Pesanan sendiri yang masih berjalan atau menunggu pembayaran."
                    />
                    <SummaryCard
                        icon={CreditCard}
                        label="Pembayaran Pending"
                        value={summary.pending_payments}
                        hint="Transfer yang masih menunggu verifikasi atau perlu bukti ulang."
                    />
                    <SummaryCard
                        icon={Clock3}
                        label="Ukuran Tersimpan"
                        value={summary.saved_measurements}
                        hint="Measurement library yang siap dipakai ulang."
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <QuickLinkCard
                        href={customer.orders.index()}
                        title="Lihat semua order"
                        description="Buka detail pesanan, status, dan sisa tagihan."
                    />
                    <QuickLinkCard
                        href={customer.payments.index()}
                        title="Kelola pembayaran"
                        description="Lihat transfer pending dan unggah bukti tambahan bila perlu."
                    />
                    <QuickLinkCard
                        href={customer.measurements.index()}
                        title="Atur ukuran"
                        description="Simpan ukuran baru atau revisi ukuran yang sudah ada."
                    />
                </div>
            </div>
        </CustomerLayout>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    hint,
}: {
    icon: typeof PackageCheck;
    label: string;
    value: number;
    hint: string;
}) {
    return (
        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
            <CardHeader className="space-y-4">
                <div className="w-fit rounded-2xl bg-[#f3e3d8] p-3 text-[#a34a2c]">
                    <Icon className="size-5" />
                </div>
                <div>
                    <CardTitle>{label}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                        {hint}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-semibold">{value}</p>
            </CardContent>
        </Card>
    );
}

function QuickLinkCard({
    href,
    title,
    description,
}: {
    href: ReturnType<typeof customer.home>;
    title: string;
    description: string;
}) {
    return (
        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="outline" className="border-[#d8c8b3] bg-white/70">
                    <Link href={href}>Buka</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
