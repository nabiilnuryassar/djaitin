import { Head, Link, useForm } from '@inertiajs/react';
import CustomerStatusBadge from '@/components/customer/CustomerStatusBadge';
import ProductionStageTracker from '@/components/customer/ProductionStageTracker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

type Props = {
    order: {
        id: number;
        order_number: string;
        order_type: string;
        company_name: string | null;
        production_stage: string | null;
        status: string;
        status_label: string;
        measurement_mode: string | null;
        due_date: string | null;
        spec_notes: string | null;
        subtotal: number;
        discount_amount: number;
        total_amount: number;
        paid_amount: number;
        outstanding_amount: number;
        garment_model: { id: number; name: string } | null;
        fabric: { id: number; name: string } | null;
        measurement: { id: number; label: string } | null;
        items: Array<{
            id: number;
            item_name: string;
            size: string | null;
            qty: number;
            unit_price: number;
            discount_amount: number;
            subtotal: number;
        }>;
        payments: Array<{
            id: number;
            payment_number: string;
            method: string;
            status: string;
            amount: number;
            reference_number: string | null;
            proof_image_path: string | null;
            payment_date: string | null;
            rejection_reason: string | null;
        }>;
        attachments: Array<{
            id: number;
            file_name: string;
            file_type: string;
            url: string;
            uploaded_by: string | null;
            uploaded_at: string | null;
        }>;
        shipment: {
            status: string;
            courier_name: string | null;
            recipient_name: string | null;
            recipient_address: string | null;
            recipient_phone: string | null;
            shipping_cost: number;
            tracking_number: string | null;
        } | null;
    };
};

export default function CustomerOrderShow({ order }: Props) {
    const paymentForm = useForm({
        method: 'transfer',
        amount:
            order.outstanding_amount > 0
                ? order.outstanding_amount.toString()
                : '',
        reference_number: '',
        notes: '',
        proof: null as File | null,
    });

    const submitPayment = () => {
        paymentForm.post(customer.payments.store(order.id).url, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <CustomerLayout>
            <Head title={order.order_number} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)] md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="text-sm font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                                Order Detail
                            </p>
                            <span className="rounded-full bg-[#EFF4FF] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#1B5EC5] uppercase">
                                {orderTypeLabel(order.order_type)}
                            </span>
                            <CustomerStatusBadge
                                status={order.status}
                                label={order.status_label}
                            />
                        </div>
                        <h1 className="[font-family:var(--font-heading)] text-3xl font-semibold tracking-tight text-[#0F172A]">
                            {order.order_number}
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            {order.order_type === 'ready_wear'
                                ? 'Detail item RTW, pengiriman, dan pembayaran untuk order customer ini.'
                                : order.order_type === 'convection'
                                  ? 'Detail brief konveksi, tahapan produksi, lampiran, dan pembayaran untuk order customer ini.'
                                  : 'Detail item, measurement, dan pembayaran untuk order customer ini.'}
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                    >
                        <Link href={customer.orders.index()}>
                            Kembali ke daftar order
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                            <CardHeader>
                                <CardTitle>Ringkasan order</CardTitle>
                                <CardDescription>
                                    {order.order_type === 'ready_wear'
                                        ? 'Informasi utama pesanan ready-to-wear.'
                                        : order.order_type === 'convection'
                                          ? 'Informasi utama pesanan konveksi.'
                                          : 'Informasi utama pesanan tailor.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                {order.order_type === 'ready_wear' ? (
                                    <>
                                        <InfoRow
                                            label="Tipe order"
                                            value="Ready-to-Wear"
                                        />
                                        <InfoRow
                                            label="Metode fulfillment"
                                            value={
                                                order.shipment === null
                                                    ? 'Pickup'
                                                    : 'Delivery'
                                            }
                                        />
                                    </>
                                ) : order.order_type === 'convection' ? (
                                    <>
                                        <InfoRow
                                            label="Tipe order"
                                            value="Convection"
                                        />
                                        <InfoRow
                                            label="Perusahaan"
                                            value={
                                                order.company_name ?? '-'
                                            }
                                        />
                                    </>
                                ) : (
                                    <>
                                        <InfoRow
                                            label="Model garmen"
                                            value={
                                                order.garment_model?.name ??
                                                '-'
                                            }
                                        />
                                        <InfoRow
                                            label="Bahan"
                                            value={
                                                order.fabric?.name ?? '-'
                                            }
                                        />
                                        <InfoRow
                                            label="Metode ukuran"
                                            value={
                                                order.measurement_mode ?? '-'
                                            }
                                        />
                                        <InfoRow
                                            label="Measurement"
                                            value={
                                                order.measurement?.label ??
                                                'Offline / belum ada'
                                            }
                                        />
                                    </>
                                )}
                                <InfoRow
                                    label="Target selesai"
                                    value={order.due_date ?? '-'}
                                />
                                <InfoRow
                                    label="Catatan spesifikasi"
                                    value={order.spec_notes ?? '-'}
                                />
                            </CardContent>
                        </Card>

                        {order.order_type === 'convection' && (
                            <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                                <CardHeader>
                                    <CardTitle>Tahap produksi</CardTitle>
                                    <CardDescription>
                                        Tracker progres konveksi dari desain sampai pengiriman atau pickup.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ProductionStageTracker
                                        stage={order.production_stage}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {order.shipment !== null && (
                            <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                                <CardHeader>
                                    <CardTitle>Informasi pengiriman</CardTitle>
                                    <CardDescription>
                                        Detail delivery yang tersimpan saat checkout.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <InfoRow
                                        label="Status shipment"
                                        value={shipmentStatusLabel(
                                            order.shipment.status,
                                        )}
                                    />
                                    <InfoRow
                                        label="Kurir"
                                        value={
                                            order.shipment.courier_name ?? '-'
                                        }
                                    />
                                    <InfoRow
                                        label="Penerima"
                                        value={
                                            order.shipment.recipient_name ??
                                            '-'
                                        }
                                    />
                                    <InfoRow
                                        label="Telepon"
                                        value={
                                            order.shipment.recipient_phone ??
                                            '-'
                                        }
                                    />
                                    <InfoRow
                                        label="Alamat"
                                        value={
                                            order.shipment.recipient_address ??
                                            '-'
                                        }
                                    />
                                    <InfoRow
                                        label="Resi"
                                        value={
                                            order.shipment.tracking_number ??
                                            'Belum tersedia'
                                        }
                                    />
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                            <CardHeader>
                                <CardTitle>Item order</CardTitle>
                                <CardDescription>
                                    Komponen harga yang disimpan di backend.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-[#eadfce] p-4"
                                    >
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="font-medium">
                                                    {item.item_name}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    Qty {item.qty}
                                                    {item.size
                                                        ? ` • Size ${item.size}`
                                                        : ''}
                                                </p>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <p className="text-sm text-slate-600">
                                                    Harga satuan{' '}
                                                    {formatCurrency(
                                                        item.unit_price,
                                                    )}
                                                </p>
                                                <p className="font-medium">
                                                    Subtotal{' '}
                                                    {formatCurrency(
                                                        item.subtotal,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {order.order_type === 'convection' && (
                            <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                                <CardHeader>
                                    <CardTitle>Lampiran desain</CardTitle>
                                    <CardDescription>
                                        Referensi yang terhubung ke order konveksi ini.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {order.attachments.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-[#DBEAFE] bg-[#F8FAFF] p-5 text-sm leading-6 text-slate-600">
                                            Belum ada lampiran untuk order ini.
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {order.attachments.map(
                                                (attachment) => (
                                                    <div
                                                        key={attachment.id}
                                                        className="rounded-2xl border border-[#DBEAFE] bg-[#F8FAFF] p-4"
                                                    >
                                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                            <div className="space-y-1">
                                                                <p className="font-medium text-[#0F172A]">
                                                                    {
                                                                        attachment.file_name
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-slate-600">
                                                                    {
                                                                        attachment.file_type
                                                                    }{' '}
                                                                    • diunggah oleh{' '}
                                                                    {attachment.uploaded_by ??
                                                                        'user'}
                                                                </p>
                                                            </div>
                                                            <Button asChild variant="outline">
                                                                <a
                                                                    href={attachment.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    Buka file
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}

                                    <AttachmentUploader orderId={order.id} />
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                            <CardHeader>
                                <CardTitle>Riwayat pembayaran</CardTitle>
                                <CardDescription>
                                    Semua pembayaran yang terkait dengan order
                                    ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {order.payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="rounded-2xl border border-[#eadfce] p-4"
                                    >
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {payment.payment_number}
                                                    </p>
                                                    <CustomerStatusBadge
                                                        status={payment.status}
                                                    />
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    {payment.method} •{' '}
                                                    {payment.payment_date ??
                                                        'Tanggal belum tersedia'}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    Ref:{' '}
                                                    {payment.reference_number ??
                                                        '-'}
                                                </p>
                                                {payment.proof_image_path && (
                                                    <p className="text-xs text-slate-600">
                                                        Bukti:{' '}
                                                        {
                                                            payment.proof_image_path
                                                        }
                                                    </p>
                                                )}
                                                {payment.rejection_reason && (
                                                    <p className="text-sm text-red-600">
                                                        Ditolak:{' '}
                                                        {
                                                            payment.rejection_reason
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-full max-w-sm space-y-3 md:w-80">
                                                <p className="font-semibold">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </p>
                                                {payment.status ===
                                                    'rejected' && (
                                                    <PaymentProofUploader
                                                        paymentId={payment.id}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-0 bg-[#1f1726] text-[#f5f1e8] shadow-[0_20px_80px_rgba(31,23,38,0.18)]">
                            <CardHeader>
                                <CardTitle>Tagihan</CardTitle>
                                <CardDescription className="text-[#d8c8d7]">
                                    Rekap nilai order dan pembayaran verified.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <SummaryRow
                                    label="Subtotal"
                                    value={formatCurrency(order.subtotal)}
                                />
                                <SummaryRow
                                    label="Diskon"
                                    value={`-${formatCurrency(order.discount_amount)}`}
                                />
                                {order.shipment !== null && (
                                    <SummaryRow
                                        label="Ongkir"
                                        value={formatCurrency(
                                            order.shipment.shipping_cost,
                                        )}
                                    />
                                )}
                                <SummaryRow
                                    label="Total"
                                    value={formatCurrency(order.total_amount)}
                                />
                                <SummaryRow
                                    label="Sudah dibayar"
                                    value={formatCurrency(order.paid_amount)}
                                />
                                <div className="border-t border-white/15 pt-4">
                                    <SummaryRow
                                        label="Sisa tagihan"
                                        value={formatCurrency(
                                            order.outstanding_amount,
                                        )}
                                        strong
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {order.outstanding_amount > 0 && (
                            <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                                <CardHeader>
                                    <CardTitle>Kirim pembayaran baru</CardTitle>
                                    <CardDescription>
                                        Customer portal hanya menerima
                                        pembayaran transfer.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">
                                            Nominal transfer
                                        </Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="1"
                                            value={paymentForm.data.amount}
                                            onChange={(event) =>
                                                paymentForm.setData(
                                                    'amount',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={paymentForm.errors.amount}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="reference_number">
                                            Nomor referensi
                                        </Label>
                                        <Input
                                            id="reference_number"
                                            value={
                                                paymentForm.data
                                                    .reference_number
                                            }
                                            onChange={(event) =>
                                                paymentForm.setData(
                                                    'reference_number',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                paymentForm.errors
                                                    .reference_number
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="proof">
                                            Bukti transfer
                                        </Label>
                                        <Input
                                            id="proof"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(event) =>
                                                paymentForm.setData(
                                                    'proof',
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={paymentForm.errors.proof}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Catatan</Label>
                                        <textarea
                                            id="notes"
                                            className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm"
                                            value={paymentForm.data.notes}
                                            onChange={(event) =>
                                                paymentForm.setData(
                                                    'notes',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={paymentForm.errors.notes}
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        disabled={paymentForm.processing}
                                        onClick={submitPayment}
                                    >
                                        Kirim pembayaran
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
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
        <div className="grid gap-2 rounded-2xl bg-[#f5f1e8] p-3">
            <Label htmlFor={`proof-${paymentId}`}>Upload bukti ulang</Label>
            <Input
                id={`proof-${paymentId}`}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(event) =>
                    form.setData('proof', event.target.files?.[0] ?? null)
                }
            />
            <InputError message={form.errors.proof} />
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

function AttachmentUploader({ orderId }: { orderId: number }) {
    const form = useForm({
        file: null as File | null,
    });

    return (
        <div className="grid gap-3 rounded-2xl bg-[#F8FAFF] p-4">
            <div className="grid gap-2">
                <Label htmlFor={`attachment-upload-${orderId}`}>
                    Upload lampiran tambahan
                </Label>
                <Input
                    id={`attachment-upload-${orderId}`}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) =>
                        form.setData('file', event.target.files?.[0] ?? null)
                    }
                />
                <InputError message={form.errors.file} />
            </div>

            <Button
                type="button"
                size="sm"
                disabled={form.processing}
                onClick={() =>
                    form.post(customer.orders.attachments.store(orderId).url, {
                        forceFormData: true,
                        preserveScroll: true,
                    })
                }
            >
                Upload lampiran
            </Button>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="leading-6 font-medium">{value}</p>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[#d8c8d7]">{label}</span>
            <span
                className={
                    strong
                        ? 'text-lg font-semibold text-[#f5f1e8]'
                        : 'font-medium text-[#f5f1e8]'
                }
            >
                {value}
            </span>
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

function orderTypeLabel(orderType: string): string {
    return orderType === 'ready_wear' ? 'Ready-to-Wear' : 'Tailor';
}

function shipmentStatusLabel(status: string): string {
    return {
        pending: 'Menunggu diproses',
        shipped: 'Sedang dikirim',
        delivered: 'Terkirim',
        pickup: 'Siap diambil',
    }[status] ?? status;
}
