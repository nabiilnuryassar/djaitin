import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCheck, ClipboardList, Factory, Upload } from 'lucide-react';
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
import { login } from '@/routes';
import type { User } from '@/types/auth';

export default function ConvectionServicePage() {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const isCustomer = auth.user?.role === 'customer';

    return (
        <CustomerLayout>
            <Head title="Convection" />

            <div className="space-y-8">
                <section className="grid gap-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(37,99,235,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                        <p className="text-sm font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                            Convection Service
                        </p>
                        <h1 className="[font-family:var(--font-heading)] text-4xl font-semibold tracking-tight text-[#0F172A]">
                            Buat permintaan produksi massal dengan item builder, lampiran desain, dan tracking tahap produksi.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-slate-600">
                            Flow konveksi customer dirancang untuk brief yang lebih kompleks: multi-item, referensi desain, dan pembayaran penuh sebelum order boleh masuk produksi.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {isCustomer ? (
                                <Button asChild>
                                    <Link href={customer.convection.create()}>
                                        Ajukan Order Konveksi
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild>
                                    <Link href={login()}>
                                        Masuk untuk Ajukan Order
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link href={customer.orders.index()}>
                                    Lihat Riwayat Order
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card className="border-0 bg-[#162044] text-white shadow-none">
                        <CardHeader>
                            <CardTitle className="[font-family:var(--font-heading)] text-2xl">
                                Yang dikerjakan di phase ini
                            </CardTitle>
                            <CardDescription className="text-white/80">
                                Customer flow konveksi memakai pipeline order yang sama dengan office.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-white/85">
                            {[
                                'Brief perusahaan dan catatan produksi tersimpan langsung di order.',
                                'Daftar item massal dihitung otomatis menjadi total pesanan.',
                                'Referensi desain wajib ada sebelum submit final.',
                                'Order belum boleh masuk produksi kalau pembayaran belum lunas terverifikasi.',
                            ].map((item) => (
                                <div key={item} className="flex gap-3">
                                    <CheckCheck className="mt-0.5 size-4 text-[#F9C11A]" />
                                    <p>{item}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <InfoCard
                        icon={Factory}
                        title="Multi-Item Request"
                        description="Satu order konveksi bisa memuat beberapa item produksi dengan qty dan harga yang berbeda."
                    />
                    <InfoCard
                        icon={Upload}
                        title="Lampiran Desain"
                        description="File referensi bisa diunggah saat submit dan ditambah lagi di detail order bila perlu revisi."
                    />
                    <InfoCard
                        icon={ClipboardList}
                        title="Tahap Produksi"
                        description="Customer bisa melihat progres dari desain sampai pengiriman atau pickup."
                    />
                </section>
            </div>
        </CustomerLayout>
    );
}

function InfoCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Factory;
    title: string;
    description: string;
}) {
    return (
        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
            <CardHeader className="space-y-4">
                <div className="w-fit rounded-2xl bg-[#EFF4FF] p-3 text-[#2563EB]">
                    <Icon className="size-5" />
                </div>
                <div>
                    <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                        {title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                        {description}
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
}
