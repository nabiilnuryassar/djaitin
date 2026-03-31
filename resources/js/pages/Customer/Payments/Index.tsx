import { Head, Link, useForm } from '@inertiajs/react';
import CustomerStatusBadge from '@/components/customer/CustomerStatusBadge';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

type Props = {
    payments: Array<{
        id: number;
        payment_number: string;
        status: string;
        method: string;
        amount: number;
        reference_number: string | null;
        rejection_reason: string | null;
        payment_date: string | null;
        order: {
            id: number | null;
            order_number: string | null;
        };
    }>;
};

export default function CustomerPaymentsIndex({ payments }: Props) {
    return (
        <CustomerLayout>
            <Head title="Pembayaran Saya" />

            <div className="space-y-6">
                <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)]">
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#a34a2c]">
                        Payments
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                        Riwayat transfer dan status verifikasi.
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                        Gunakan halaman ini untuk melihat semua pembayaran milik customer yang sedang login dan mengunggah bukti ulang jika ada transfer yang ditolak.
                    </p>
                </div>

                <div className="grid gap-4">
                    {payments.map((payment) => (
                        <Card key={payment.id} className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle>{payment.payment_number}</CardTitle>
                                        <CustomerStatusBadge status={payment.status} />
                                    </div>
                                    <CardDescription className="text-sm leading-6 text-slate-600">
                                        {payment.method} • {payment.payment_date ?? 'Tanggal belum tersedia'}
                                    </CardDescription>
                                    {payment.order.id && payment.order.order_number && (
                                        <Link
                                            href={customer.orders.show(payment.order.id)}
                                            className="inline-flex text-sm font-medium text-[#a34a2c]"
                                        >
                                            {payment.order.order_number}
                                        </Link>
                                    )}
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                                    <p className="text-sm text-slate-600">
                                        Ref: {payment.reference_number ?? '-'}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {payment.rejection_reason && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                        Transfer ditolak: {payment.rejection_reason}
                                    </div>
                                )}
                                {payment.status === 'rejected' && (
                                    <PaymentProofUploader paymentId={payment.id} />
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {payments.length === 0 && (
                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                            <CardContent className="p-8 text-sm text-slate-600">
                                Belum ada riwayat pembayaran.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}

function PaymentProofUploader({ paymentId }: { paymentId: number }) {
    const form = useForm({
        proof: null as File | null,
    });

    return (
        <div className="grid gap-3 rounded-2xl bg-[#f5f1e8] p-4">
            <div className="grid gap-2">
                <Label htmlFor={`proof-upload-${paymentId}`}>Upload bukti transfer ulang</Label>
                <Input
                    id={`proof-upload-${paymentId}`}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) => form.setData('proof', event.target.files?.[0] ?? null)}
                />
                <InputError message={form.errors.proof} />
            </div>

            <Button
                type="button"
                size="sm"
                disabled={form.processing}
                onClick={() =>
                    form.post(customer.payments.uploadProof(paymentId).url, {
                        forceFormData: true,
                        preserveScroll: true,
                    })
                }
            >
                Upload ulang
            </Button>
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
