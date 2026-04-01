import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCheck,
    CreditCard,
    ShoppingBag,
    Truck,
} from 'lucide-react';
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

export default function ReadyToWearServicePage() {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const isCustomer = auth.user?.role === 'customer';

    return (
        <CustomerLayout>
            <Head title="Ready-to-Wear" />

            <div className="space-y-8">
                <section className="grid gap-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(37,99,235,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                        <p className="text-sm font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                            Ready-to-Wear
                        </p>
                        <h1 className="[font-family:var(--font-heading)] text-4xl font-semibold tracking-tight text-[#0F172A]">
                            Browse katalog, simpan ke cart, lalu checkout pickup atau delivery.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-slate-600">
                            Produk RTW berjalan dengan validasi stock di
                            backend. Stock tidak berkurang saat item hanya masuk
                            cart atau order baru dibuat, tetapi baru turun saat
                            pembayaran verified.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href={customer.catalog.index()}>
                                    Buka Katalog
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            {isCustomer ? (
                                <Button asChild variant="outline">
                                    <Link href={customer.cart.index()}>
                                        Lihat Keranjang
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild variant="outline">
                                    <Link href={login()}>Masuk</Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="border-0 bg-[#162044] text-white shadow-none">
                        <CardHeader>
                            <CardTitle className="[font-family:var(--font-heading)] text-2xl">
                                Yang tersedia di phase ini
                            </CardTitle>
                            <CardDescription className="text-white/80">
                                Flow belanja RTW yang langsung tersambung ke order system.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-white/85">
                            {[
                                'Katalog aktif dengan filter kategori dan size.',
                                'Cart terisolasi per customer account.',
                                'Checkout mendukung pickup atau delivery.',
                                'Transfer bisa diverifikasi office untuk memicu pengurangan stock.',
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
                        icon={ShoppingBag}
                        title="Belanja Cepat"
                        description="Pilih produk aktif per size tanpa perlu masuk ke flow tailor custom."
                    />
                    <InfoCard
                        icon={Truck}
                        title="Pickup atau Delivery"
                        description="Customer bisa ambil sendiri atau pilih pengiriman ke alamat tersimpan."
                    />
                    <InfoCard
                        icon={CreditCard}
                        title="Pembayaran Terkontrol"
                        description="Transfer tercatat dari portal, dan stock baru turun setelah verified."
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
    icon: typeof ShoppingBag;
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
