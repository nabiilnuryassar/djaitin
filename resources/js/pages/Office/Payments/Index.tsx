import { Form, Head, Link } from '@inertiajs/react';
import { CreditCard, Inbox } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { show as showOrder } from '@/actions/App/Http/Controllers/Office/OrderController';
import {
    index as paymentsIndex,
    reject as rejectPayment,
    verify as verifyPayment,
} from '@/actions/App/Http/Controllers/Office/PaymentController';
import refundPayment from '@/actions/App/Http/Controllers/Office/PaymentRefundController';
import { EmptyState } from '@/components/office/empty-state';
import { PageHeader } from '@/components/office/page-header';
import { PremiumCard } from '@/components/office/premium-card';
import { StatusBadge } from '@/components/office/status-badge';
import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
    proof_image_path: string | null;
    proof_image_url: string | null;
    order: {
        id: number | null;
        order_number: string | null;
        customer_name: string | null;
    };
    payment_date: string | null;
    verified_at: string | null;
    refunded_at: string | null;
    refunded_by_name: string | null;
    refund_reason: string | null;
};

type Props = {
    pendingPayments: Payment[];
    payments: {
        data: Payment[];
    };
    can: {
        verify: boolean;
        reject: boolean;
        refund: boolean;
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

            <div className="flex flex-1 flex-col gap-6 bg-brand-mist p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Pembayaran"
                    title="Verifikasi & Riwayat Pembayaran"
                    description="Validasi transfer pending dan kelola riwayat pembayaran order."
                />

                <PremiumCard padded={false}>
                    <div className="border-b border-border/70 px-6 py-5">
                        <h2 className="text-lg font-semibold text-brand-ink">
                            Menunggu Verifikasi
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Transfer yang masih menunggu validasi.
                        </p>
                    </div>
                    <div className="grid gap-4 p-5">
                        {pendingPayments.length === 0 ? (
                            <EmptyState
                                icon={CreditCard}
                                title="Tidak ada transfer pending"
                                description="Tidak ada transfer pending saat ini."
                            />
                        ) : (
                            pendingPayments.map((payment) => (
                                <PaymentCard
                                    key={payment.id}
                                    payment={payment}
                                    can={can}
                                />
                            ))
                        )}
                    </div>
                </PremiumCard>

                <PremiumCard padded={false}>
                    <div className="border-b border-border/70 px-6 py-5">
                        <h2 className="text-lg font-semibold text-brand-ink">
                            Semua Pembayaran
                        </h2>
                    </div>
                    <div className="grid gap-3 p-5">
                        {payments.data.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                title="Belum ada pembayaran"
                                description="Riwayat pembayaran akan tampil di sini."
                            />
                        ) : (
                            payments.data.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="grid gap-4 rounded-2xl border border-border/70 bg-brand-mist/50 p-4 xl:grid-cols-[1fr_220px]"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-brand-ink">
                                                {payment.payment_number}
                                            </p>
                                            <StatusBadge value={payment.status} domain="payment" />
                                            <Badge variant="outline" className="rounded-full">
                                                {payment.method}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {payment.order.customer_name ?? '-'} ·{' '}
                                            {payment.order.id ? (
                                                <Link
                                                    href={showOrder(
                                                        payment.order.id,
                                                    )}
                                                    className="font-medium text-brand-blue underline-offset-4 hover:underline"
                                                >
                                                    {payment.order.order_number}
                                                </Link>
                                            ) : (
                                                (payment.order.order_number ?? '-')
                                            )}
                                        </p>
                                        <p className="text-sm font-semibold text-brand-ink">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {payment.payment_date ?? '-'}
                                        </p>
                                        {payment.status === 'refunded' && (
                                            <RefundSummary payment={payment} />
                                        )}
                                    </div>
                                    <div className="grid content-start gap-3">
                                        {can.refund &&
                                            payment.status === 'verified' && (
                                                <RefundPaymentDialog
                                                    payment={payment}
                                                />
                                            )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </PremiumCard>
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
        refund: boolean;
    };
}) {
    return (
        <div className="grid gap-4 rounded-2xl border border-border/70 bg-brand-mist/50 p-4 xl:grid-cols-[1fr_240px]">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-brand-ink">{payment.payment_number}</p>
                    <StatusBadge value={payment.status} domain="payment" />
                    <Badge variant="outline" className="rounded-full">{payment.method}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    {payment.order.customer_name ?? '-'} ·{' '}
                    {payment.order.id ? (
                        <Link
                            href={showOrder(payment.order.id)}
                            className="font-medium text-brand-blue underline-offset-4 hover:underline"
                        >
                            {payment.order.order_number}
                        </Link>
                    ) : (
                        (payment.order.order_number ?? '-')
                    )}
                </p>
                <p className="text-sm font-semibold text-brand-ink">{formatCurrency(payment.amount)}</p>
                {payment.reference_number && (
                    <p className="text-sm text-muted-foreground">
                        Ref: {payment.reference_number}
                    </p>
                )}
                <PaymentProofPreview payment={payment} />
            </div>

            <div className="grid gap-3">
                {can.verify && (
                    <Form {...verifyPayment.form(payment.id)}>
                        {({ processing }) => (
                            <Button
                                type="submit"
                                className="w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep"
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
                                    className="rounded-xl"
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

function RefundPaymentDialog({ payment }: { payment: Payment }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="destructive" className="w-full rounded-xl">
                    Refund
                </Button>
            </DialogTrigger>
            <DialogContent className="border-red-100 bg-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Konfirmasi refund</DialogTitle>
                    <DialogDescription>
                        Refund akan mengubah status pembayaran, menghitung ulang
                        nilai order, dan membatalkan order jika masih aktif.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 text-sm leading-6 text-red-900">
                    <p className="font-semibold">{payment.payment_number}</p>
                    <p>{formatCurrency(payment.amount)}</p>
                    <p className="mt-1 text-red-700">
                        Aksi ini dicatat di audit log office.
                    </p>
                </div>

                <Form
                    {...refundPayment.form(payment.id)}
                    className="grid gap-3"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor={`refund-reason-${payment.id}`}>
                                    Alasan refund
                                </Label>
                                <textarea
                                    id={`refund-reason-${payment.id}`}
                                    name="reason"
                                    placeholder="Contoh: Customer membatalkan pesanan."
                                    className="min-h-24 rounded-md border bg-white px-3 py-2 text-sm"
                                />
                                <InputError message={errors.reason} />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    Konfirmasi refund
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function RefundSummary({ payment }: { payment: Payment }) {
    return (
        <div className="rounded-xl border border-red-100 bg-red-50/60 p-3 text-sm leading-6 text-red-900">
            <p className="font-semibold">Refund tercatat</p>
            <p>{payment.refund_reason ?? 'Alasan refund tidak tersedia.'}</p>
            <p className="mt-1 text-xs text-red-700">
                {payment.refunded_at ?? '-'} ·{' '}
                {payment.refunded_by_name ?? 'Admin'}
            </p>
        </div>
    );
}

function PaymentProofPreview({ payment }: { payment: Payment }) {
    if (!payment.proof_image_url) {
        return (
            <div className="rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Customer belum mengunggah bukti transfer.
            </div>
        );
    }

    const isPdf = payment.proof_image_path?.toLowerCase().endsWith('.pdf');

    return (
        <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Bukti transfer
            </p>
            {isPdf ? (
                <a
                    href={payment.proof_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium text-brand-blue hover:bg-muted/60"
                >
                    Buka bukti (PDF)
                </a>
            ) : (
                <a
                    href={payment.proof_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-fit overflow-hidden rounded-md border"
                    title="Klik untuk perbesar"
                >
                    <img
                        src={payment.proof_image_url}
                        alt={`Bukti transfer ${payment.payment_number}`}
                        className="h-40 w-auto max-w-xs object-cover"
                        loading="lazy"
                    />
                </a>
            )}
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
