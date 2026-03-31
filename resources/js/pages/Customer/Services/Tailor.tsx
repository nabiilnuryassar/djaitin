import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCheck, Ruler, Shirt, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';
import { login, register } from '@/routes';
import type { User } from '@/types/auth';

export default function TailorServicePage() {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const isCustomer = auth.user?.role === 'customer';

    return (
        <CustomerLayout>
            <Head title="Layanan Tailor" />

            <div className="space-y-8">
                <section className="grid gap-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#a34a2c]">
                            Tailor Service
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight">
                            Flow tailor customer dengan draft, ukuran tersimpan, dan transfer proof.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-slate-600">
                            Customer memilih model garmen, bahan aktif, metode ukuran, lalu mengirim bukti transfer
                            dari portal yang sama. Harga dibentuk di backend dari model dan bahan, bukan dari input client.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href={customer.tailor.configure()}>
                                    Konfigurasi Pesanan
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            {!isCustomer && (
                                <>
                                    <Button asChild variant="outline">
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={register()}>Daftar Customer</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <Card className="border-0 bg-[#f5f1e8] shadow-none">
                        <CardHeader>
                            <CardTitle>Yang tersedia di v1</CardTitle>
                            <CardDescription>
                                Satu flow yang cukup lengkap untuk customer tailor.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-slate-700">
                            {[
                                'Guest bisa melihat wizard sampai ringkasan sebelum login.',
                                'Customer login bisa simpan draft dan submit order.',
                                'Manual measurement otomatis jadi record reusable saat order final disubmit.',
                                'Offline measurement tetap didukung tanpa measurement record.',
                                'Pembayaran customer dibatasi ke transfer.',
                            ].map((item) => (
                                <div key={item} className="flex gap-3">
                                    <CheckCheck className="mt-0.5 size-4 text-[#a34a2c]" />
                                    <p>{item}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <InfoCard
                        icon={Shirt}
                        title="Pilih model dan bahan"
                        description="Harga unit dihitung dari base price model ditambah price adjustment bahan."
                    />
                    <InfoCard
                        icon={Ruler}
                        title="Tentukan metode ukuran"
                        description="Gunakan ukuran tersimpan, input manual, atau tandai customer akan diukur offline."
                    />
                    <InfoCard
                        icon={Wallet}
                        title="Transfer dan verifikasi"
                        description="Customer mengunggah bukti transfer, lalu office memverifikasi sebelum status lanjut."
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
