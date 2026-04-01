import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ClipboardList, Factory, Ruler, Shirt, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';
import office from '@/routes/office';
import { login } from '@/routes';
import type { User } from '@/types/auth';

export default function CustomerHome() {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const dashboardHref = auth.user?.role === 'customer' ? customer.dashboard() : office.dashboard();

    return (
        <CustomerLayout>
            <Head title="Djaitin Customer" />

            <div className="space-y-10">
                <section className="grid gap-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)] lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-5">
                        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#a34a2c]">
                            Djaitin Customer
                        </p>
                        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                            Pesan tailor, belanja RTW, ajukan konveksi, dan pantau pembayaran dari satu portal.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-slate-600">
                            Surface customer berjalan penuh di <span className="font-medium">/app</span>.
                            Customer bisa mulai dari layanan tailor, katalog ready-to-wear, atau permintaan konveksi, lalu memantau status order tanpa lagi bercampur dengan workflow office.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboardHref}>
                                        Buka Dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild>
                                        <Link href={customer.services.tailor()}>
                                            Lihat Layanan Tailor
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={customer.services.rtw()}>
                                            Lihat Ready-to-Wear
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={customer.services.convection()}>
                                            Lihat Konveksi
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-[#f5f1e8] p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-[#a34a2c]">
                            Alur cepat
                        </p>
                        <div className="mt-6 space-y-4">
                            {[
                                'Pilih model garmen dan bahan aktif.',
                                'Gunakan ukuran tersimpan, isi manual, atau pilih ukur offline.',
                                'Upload bukti transfer untuk memulai order.',
                                'Pantau status produksi dan sisa pembayaran dari dashboard.',
                            ].map((step, index) => (
                                <div key={step} className="flex gap-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1f1726] text-sm font-semibold text-[#f5f1e8]">
                                        0{index + 1}
                                    </div>
                                    <p className="pt-1 text-sm leading-6 text-slate-700">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <FeatureCard
                        icon={Shirt}
                        title="Tailor Interaktif"
                        description="Pilih model, bahan, metode ukuran, dan unggah bukti transfer langsung dari customer portal."
                    />
                    <FeatureCard
                        icon={ShoppingBag}
                        title="Katalog RTW"
                        description="Belanja produk siap pakai lewat katalog, keranjang, dan checkout customer."
                    />
                    <FeatureCard
                        icon={Factory}
                        title="Order Konveksi"
                        description="Ajukan produksi massal dengan multi-item builder dan lampiran referensi desain."
                    />
                    <FeatureCard
                        icon={ClipboardList}
                        title="Tracking Order"
                        description="Lihat status pesanan sendiri, riwayat pembayaran, dan detail item tanpa akses ke data customer lain."
                    />
                    <FeatureCard
                        icon={Ruler}
                        title="Measurement Library"
                        description="Simpan ukuran tubuh yang bisa dipakai ulang untuk order tailor berikutnya."
                    />
                </section>
            </div>
        </CustomerLayout>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Shirt;
    title: string;
    description: string;
}) {
    return (
        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
            <CardHeader className="space-y-4">
                <div className="w-fit rounded-2xl bg-[#f3e3d8] p-3 text-[#a34a2c]">
                    <Icon className="size-5" />
                </div>
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                        {description}
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
}
