import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Plus, Shirt } from 'lucide-react';
import CustomerStatusBadge from '@/components/customer/CustomerStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

type Props = {
    orders: Array<{
        id: number;
        order_number: string;
        status: string;
        status_label: string;
        garment_model_name: string | null;
        due_date: string | null;
        total_amount: number;
        outstanding_amount: number;
        latest_payment_status: string | null;
    }>;
};

export default function CustomerOrdersIndex({ orders }: Props) {
    return (
        <CustomerLayout>
            <Head title="Orders Saya" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)] md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#a34a2c]">
                            Orders
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Riwayat order tailor customer.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            Detail di bawah hanya menampilkan order yang dimiliki akun customer saat ini.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={customer.tailor.configure()}>
                            <Plus className="size-4" />
                            Order Tailor Baru
                        </Link>
                    </Button>
                </div>

                {orders.length === 0 ? (
                    <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                        <CardContent className="flex flex-col items-start gap-4 p-8">
                            <div className="rounded-2xl bg-[#f3e3d8] p-3 text-[#a34a2c]">
                                <Shirt className="size-5" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Belum ada order</h2>
                                <p className="max-w-xl text-sm leading-6 text-slate-600">
                                    Mulai dari layanan tailor untuk membuat order pertama dan mengunggah bukti transfer langsung dari portal ini.
                                </p>
                            </div>
                            <Button asChild>
                                <Link href={customer.services.tailor()}>
                                    Buka layanan tailor
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <Link key={order.id} href={customer.orders.show(order.id)}>
                                <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)] transition hover:-translate-y-0.5">
                                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <CardTitle>{order.order_number}</CardTitle>
                                                <CustomerStatusBadge status={order.status} label={order.status_label} />
                                            </div>
                                            <CardDescription className="text-sm leading-6 text-slate-600">
                                                {order.garment_model_name ?? 'Tailor custom'} •
                                                {' '}jatuh tempo {order.due_date ?? 'belum ditentukan'}
                                            </CardDescription>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-sm text-slate-500">Sisa tagihan</p>
                                            <p className="text-lg font-semibold">{formatCurrency(order.outstanding_amount)}</p>
                                            <p className="text-xs text-slate-500">
                                                Pembayaran terakhir: {order.latest_payment_status ?? 'belum ada'}
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-between">
                                        <p className="text-sm text-slate-600">
                                            Total order {formatCurrency(order.total_amount)}
                                        </p>
                                        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#a34a2c]">
                                            Lihat detail
                                            <ArrowRight className="size-4" />
                                        </span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
