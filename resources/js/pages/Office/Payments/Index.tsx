import { Form, Head, Link } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { show as showOrder } from '@/actions/App/Http/Controllers/Office/OrderController';
import {
    index as paymentsIndex,
    reject as rejectPayment,
    verify as verifyPayment,
} from '@/actions/App/Http/Controllers/Office/PaymentController';
import InputError from '@/components/input-error';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import OfficeLayout from '@/layouts/office-layout';
import type { BreadcrumbItem } from '@/types';

type Payment = {
    id: number;
    payment_number: string;
    status: string;
    method: string;
    amount: number;
    reference_number: string | null;
    rejection_reason: string | null;
    order: {
        id: number | null;
        order_number: string | null;
        customer_name: string | null;
    };
    payment_date: string | null;
    verified_at: string | null;
};

type Props = {
    pendingPayments: Payment[];
    payments: {
        data: Payment[];
    };
    can: {
        verify: boolean;
        reject: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Pembayaran', href: paymentsIndex() },
];

export default function PaymentsIndex({
    pendingPayments,
    payments,
    can,
}: Props) {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembayaran" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <Card>
                    <CardHeader>
                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            Pending verification
                        </CardTitle>
                        <CardDescription>
                            Transfer yang masih menunggu validasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {pendingPayments.length === 0 ? (
                            <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                Tidak ada transfer pending saat ini.
                            </div>
                        ) : (
                            pendingPayments.map((payment) => (
                                <PaymentCard
                                    key={payment.id}
                                    payment={payment}
                                    can={can}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            Semua pembayaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {payments.data.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">
                                            {payment.payment_number}
                                        </p>
                                        <Badge variant="secondary">
                                            {payment.status}
                                        </Badge>
                                        <Badge variant="outline">
                                            {payment.method}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {payment.order.customer_name ?? '-'} ·{' '}
                                        {payment.order.order_number ?? '-'}
                                    </p>
                                </div>
                                <div className="text-sm md:text-right">
                                    <p className="font-medium">
                                        {formatCurrency(payment.amount)}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {payment.payment_date ?? '-'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}

function PaymentCard({
    payment,
    can,
}: {
    payment: Payment;
    can: {
        verify: boolean;
        reject: boolean;
    };
}) {
    return (
        <div className="grid gap-4 rounded-xl border p-4 xl:grid-cols-[1fr_240px]">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <p className="font-medium">{payment.payment_number}</p>
                    <Badge variant="secondary">{payment.status}</Badge>
                    <Badge variant="outline">{payment.method}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    {payment.order.customer_name ?? '-'} ·{' '}
                    {payment.order.id ? (
                        <Link
                            href={showOrder(payment.order.id)}
                            className="underline-offset-4 hover:underline"
                        >
                            {payment.order.order_number}
                        </Link>
                    ) : (
                        (payment.order.order_number ?? '-')
                    )}
                </p>
                <p className="text-sm">{formatCurrency(payment.amount)}</p>
                {payment.reference_number && (
                    <p className="text-sm text-muted-foreground">
                        Ref: {payment.reference_number}
                    </p>
                )}
            </div>

            <div className="grid gap-3">
                {can.verify && (
                    <Form {...verifyPayment.form(payment.id)}>
                        {({ processing }) => (
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                Verifikasi transfer
                            </Button>
                        )}
                    </Form>
                )}
                {can.reject && (
                    <Form
                        {...rejectPayment.form(payment.id)}
                        className="grid gap-3"
                    >
                        {({ errors, processing }) => (
                            <>
                                <textarea
                                    name="rejection_reason"
                                    placeholder="Alasan penolakan"
                                    className="min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm"
                                />
                                <InputError message={errors.rejection_reason} />
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    Tolak transfer
                                </Button>
                            </>
                        )}
                    </Form>
                )}
            </div>
        </div>
    );
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
