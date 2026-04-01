import { Head } from '@inertiajs/react';
import { Clock3, CreditCard, Factory, PackageCheck, ShoppingBag, Shirt } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

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
                <div className="flex flex-col gap-4 rounded-[2rem] border border-[#DBEAFE] bg-gradient-to-br from-white to-[#EFF4FF] p-8 shadow-[0_20px_80px_rgba(37,99,235,0.08)] md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                            Customer Dashboard
                        </p>
                        <h1 className="[font-family:var(--font-heading)] text-3xl font-semibold tracking-tight text-[#0F172A]">
                            Ringkasan order, pembayaran, dan ukuran pribadi.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            Semua angka di halaman ini hanya merefleksikan data
                            milik akun customer yang sedang login.
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
                        href={customer.catalog.index()}
                        title="Browse katalog RTW"
                        description="Lihat produk siap pakai yang bisa langsung masuk cart."
                        icon={ShoppingBag}
                    />
                    <QuickLinkCard
                        href={customer.convection.create()}
                        title="Ajukan konveksi"
                        description="Buka wizard order konveksi dengan multi-item dan referensi desain."
                        icon={Factory}
                    />
                    <QuickLinkCard
                        href={customer.orders.index()}
                        title="Lihat semua order"
                        description="Buka detail pesanan, status, dan sisa tagihan."
                        icon={PackageCheck}
                    />
                    <QuickLinkCard
                        href={customer.payments.index()}
                        title="Kelola pembayaran"
                        description="Lihat transfer pending dan unggah bukti tambahan bila perlu."
                        icon={CreditCard}
                    />
                    <QuickLinkCard
                        href={customer.profile.edit({
                            query: { section: 'measurements' },
                        })}
                        title="Atur ukuran"
                        description="Buka measurement library yang sekarang menyatu dengan halaman profil."
                        icon={Clock3}
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
        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.08)]">
            <CardHeader className="space-y-4">
                <div className="w-fit rounded-2xl bg-[#EFF4FF] p-3 text-[#2563EB]">
                    <Icon className="size-5" />
                </div>
                <div>
                    <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                        {label}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                        {hint}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <p className="[font-family:var(--font-heading)] text-3xl font-semibold text-[#0F172A]">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function QuickLinkCard({
    href,
    title,
    description,
    icon: Icon,
}: {
    href: ReturnType<typeof customer.home>;
    title: string;
    description: string;
    icon: typeof ShoppingBag;
}) {
    return (
        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.08)]">
            <CardHeader className="space-y-4">
                <div className="w-fit rounded-2xl bg-[#EFF4FF] p-3 text-[#2563EB]">
                    <Icon className="size-5" />
                </div>
                <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                    {title}
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    asChild
                    variant="outline"
                    className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                >
                    <Link href={href}>Buka</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
