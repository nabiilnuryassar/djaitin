import { Head, Link, useForm } from '@inertiajs/react';
import {
    uploadAttachment,
} from '@/actions/App/Http/Controllers/Customer/OrderController';
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
import { useState } from 'react';

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
            title: string;
            notes: string | null;
            attachment_type: string;
            attachment_type_label: string;
            file_type: string;
            url: string;
            uploaded_by: string | null;
            uploaded_by_role: string | null;
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

    const [activeTab, setActiveTab] = useState<
        'overview' | 'design' | 'payments'
    >('overview');
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

                <SectionTabs
                    tabs={[
                        { id: 'overview', label: 'Overview' },
                        ...(order.order_type === 'convection'
                            ? [{ id: 'design', label: 'Design Desk' as const }]
                            : []),
                        { id: 'payments', label: 'Pembayaran' },
                    ]}
                    activeTab={activeTab}
                    onChange={(tabId) =>
                        setActiveTab(
                            tabId as 'overview' | 'design' | 'payments',
                        )
                    }
                />

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        {activeTab === 'overview' && (
                            <>
                                <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                                    <CardHeader>
                                        <CardTitle>Ringkasan order</CardTitle>
                                        <CardDescription>
                                            {order.order_type === 'ready_wear'
                                                ? 'Informasi utama pesanan ready-to-wear.'
                                                : order.order_type ===
                                                    'convection'
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
                                        ) : order.order_type ===
                                          'convection' ? (
                                            <>
                                                <InfoRow
                                                    label="Tipe order"
                                                    value="Convection"
                                                />
                                                <InfoRow
                                                    label="Perusahaan"
                                                    value={
                                                        order.company_name ??
                                                        '-'
                                                    }
                                                />
                                                </>
                                        ) : (
                                            <>
                                                <InfoRow
                                                    label="Model garmen"
                                                    value={
                                                        order.garment_model
                                                            ?.name ?? '-'
                                                    }
                                                />
                                                <InfoRow
                                                    label="Bahan"
                                                    value={
                                                        order.fabric?.name ??
                                                        '-'
                                                    }
                                                />
                                                <InfoRow
                                                    label="Metode ukuran"
                                                    value={
                                                        order.measurement_mode ??
                                                        '-'
                                                    }
                                                />
                                                <InfoRow
                                                    label="Measurement"
                                                    value={
                                                        order.measurement
                                                            ?.label ??
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
                                            <CardTitle>
                                                Tahap produksi
                                            </CardTitle>
                                            <CardDescription>
                                                Tracker progres konveksi dari
                                                desain sampai pengiriman atau
                                                pickup.
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
                                            <CardTitle>
                                                Informasi pengiriman
                                            </CardTitle>
                                            <CardDescription>
                                                Detail delivery yang tersimpan
                                                saat checkout.
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
                                                    order.shipment
                                                        .courier_name ?? '-'
                                                }
                                            />
                                            <InfoRow
                                                label="Penerima"
                                                value={
                                                    order.shipment
                                                        .recipient_name ?? '-'
                                                }
                                            />
                                            <InfoRow
                                                label="Telepon"
                                                value={
                                                    order.shipment
                                                        .recipient_phone ?? '-'
                                                }
                                            />
                                            <InfoRow
                                                label="Alamat"
                                                value={
                                                    order.shipment
                                                        .recipient_address ??
                                                    '-'
                                                }
                                            />
                                            <InfoRow
                                                label="Resi"
                                                value={
                                                    order.shipment
                                                        .tracking_number ??
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
                                            Komponen harga dan kuantitas yang
                                            disimpan di backend.
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
                                                            {formatCurrency(item.unit_price)}
                                                        </p>
                                                        <p className="font-medium">
                                                            Subtotal{' '}
                                                            {formatCurrency(item.subtotal)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {activeTab === 'design' &&
                            order.order_type === 'convection' && (
                                <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                                    <CardHeader>
                                        <CardTitle>Lampiran Desain</CardTitle>
                                        <CardDescription>
                                            Ruang berbagi referensi dan file
                                            desain antara customer dan tim
                                            Djaitin.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="rounded-3xl border border-[#DBEAFE] bg-[linear-gradient(135deg,#F8FAFF_0%,#EFF4FF_100%)] p-5">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold tracking-[0.18em] text-[#2563EB] uppercase">
                                                    Design Desk
                                                </p>
                                                <p className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                                    Kirim dan lihat file desain
                                                    di satu tempat
                                                </p>
                                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                                    Upload referensi, revisi,
                                                    atau final artwork dan
                                                    tambahkan catatan untuk tim
                                                    Djaitin.
                                                </p>
                                            </div>
                                        </div>

                                        {order.attachments.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-[#DBEAFE] bg-[#F8FAFF] p-5 text-sm leading-6 text-slate-600">
                                                Belum ada lampiran untuk order
                                                ini.
                                            </div>
                                        ) : (
                                            <div className="grid gap-3">
                                                {order.attachments.map(
                                                    (attachment) => (
                                                        <AttachmentCard
                                                            key={attachment.id}
                                                            attachment={
                                                                attachment
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        )}

                                        <AttachmentUploader
                                            orderId={order.id}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                        {activeTab === 'payments' && (
                            <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                                <CardHeader>
                                    <CardTitle>Riwayat pembayaran</CardTitle>
                                    <CardDescription>
                                        Semua pembayaran yang terkait dengan
                                        order ini.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {order.payments.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-[#DBEAFE] bg-[#F8FAFF] p-5 text-sm leading-6 text-slate-600">
                                            Belum ada pembayaran untuk order ini.
                                        </div>
                                    ) : (
                                        order.payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="rounded-2xl border border-[#eadfce] p-4"
                                            >
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-medium">
                                                                {
                                                                    payment.payment_number
                                                                }
                                                            </p>
                                                            <CustomerStatusBadge
                                                                status={
                                                                    payment.status
                                                                }
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
                                                                paymentId={
                                                                    payment.id
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        )}
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
                                        value={formatCurrency(order.outstanding_amount)}
                                        strong
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {order.outstanding_amount > 0 &&
                            activeTab === 'payments' && (
                                <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                                    <CardHeader>
                                        <CardTitle>
                                            Kirim pembayaran baru
                                        </CardTitle>
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
                                                message={
                                                    paymentForm.errors.amount
                                                }
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
                                                        event.target
                                                            .files?.[0] ?? null,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    paymentForm.errors.proof
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">
                                                Catatan
                                            </Label>
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
                                                message={
                                                    paymentForm.errors.notes
                                                }
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
        title: '',
        notes: '',
        attachment_type: 'revision',
    });

    return (
        <div className="grid gap-4 rounded-3xl border border-[#DBEAFE] bg-[#F8FAFF] p-5">
            <div className="space-y-1">
                <p className="[font-family:var(--font-heading)] text-lg font-semibold text-[#0F172A]">
                    Kirim file baru ke tim Djaitin
                </p>
                <p className="text-sm leading-6 text-slate-600">
                    Gunakan untuk upload revisi logo, referensi tambahan, atau
                    final artwork terbaru.
                </p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`attachment-title-${orderId}`}>
                    Judul file
                </Label>
                <Input
                    id={`attachment-title-${orderId}`}
                    value={form.data.title}
                    onChange={(event) =>
                        form.setData('title', event.target.value)
                    }
                    placeholder="Contoh: Revisi logo sponsor"
                />
                <InputError message={form.errors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`attachment-type-${orderId}`}>Kategori</Label>
                <select
                    id={`attachment-type-${orderId}`}
                    value={form.data.attachment_type}
                    onChange={(event) =>
                        form.setData('attachment_type', event.target.value)
                    }
                    className="h-10 rounded-xl border border-[#DBEAFE] bg-white px-3 text-sm text-slate-700"
                >
                    <option value="revision">Revisi</option>
                    <option value="reference">Referensi</option>
                    <option value="final_artwork">Final Artwork</option>
                    <option value="other">Lainnya</option>
                </select>
                <InputError message={form.errors.attachment_type} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`attachment-notes-${orderId}`}>
                    Catatan singkat
                </Label>
                <textarea
                    id={`attachment-notes-${orderId}`}
                    value={form.data.notes}
                    onChange={(event) =>
                        form.setData('notes', event.target.value)
                    }
                    className="min-h-24 rounded-2xl border border-[#DBEAFE] bg-white px-4 py-3 text-sm text-slate-700"
                    placeholder="Jelaskan perubahan yang perlu diperhatikan tim office."
                />
                <InputError message={form.errors.notes} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`attachment-upload-${orderId}`}>
                    Upload lampiran
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
                    form.post(uploadAttachment(orderId).url, {
                        forceFormData: true,
                        preserveScroll: true,
                    })
                }
            >
                Kirim ke tim Djaitin
            </Button>
        </div>
    );
}

function AttachmentCard({
    attachment,
}: {
    attachment: Props['order']['attachments'][number];
}) {
    return (
        <div className="rounded-3xl border border-[#DBEAFE] bg-white p-5 shadow-[0_14px_32px_rgba(37,99,235,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone="blue">
                            {attachment.attachment_type_label}
                        </StatusPill>
                        <StatusPill tone="slate">
                            {attachment.uploaded_by_role === 'customer'
                                ? 'Dari Customer'
                                : 'Dari Tim Djaitin'}
                        </StatusPill>
                    </div>
                    <div>
                        <p className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            {attachment.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            {attachment.file_name} • {attachment.file_type}
                        </p>
                    </div>
                    <div className="grid gap-1 text-sm text-slate-600">
                        <p>
                            Diunggah oleh {attachment.uploaded_by ?? 'User'} •{' '}
                            {attachment.uploaded_at ?? '-'}
                        </p>
                        {attachment.notes && (
                            <p className="rounded-2xl bg-[#F8FAFF] px-4 py-3 leading-6 text-slate-700">
                                {attachment.notes}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex w-full flex-col gap-3 md:w-60">
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

function StatusPill({
    children,
    tone,
}: {
    children: string;
    tone: 'blue' | 'slate';
}) {
    const toneClass =
        tone === 'slate'
            ? 'bg-slate-100 text-slate-700'
            : 'bg-[#EFF4FF] text-[#1B5EC5]';

    return (
        <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase ${toneClass}`}
        >
            {children}
        </span>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function SectionTabs({
    tabs,
    activeTab,
    onChange,
}: {
    tabs: Array<{ id: string; label: string }>;
    activeTab: string;
    onChange: (tabId: string) => void;
}) {
    return (
        <div className="rounded-[1.5rem] border border-[#DBEAFE] bg-white p-2 shadow-[0_16px_40px_rgba(31,23,38,0.05)]">
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={
                            activeTab === tab.id
                                ? 'rounded-xl bg-[#1B5EC5] px-4 py-2.5 text-sm font-semibold text-white'
                                : 'rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-[#EFF4FF] hover:text-[#1B5EC5]'
                        }
                        onClick={() => onChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function orderTypeLabel(orderType: string): string {
    return orderType === 'ready_wear' ? 'Ready-to-Wear' : 'Tailor';
}

function shipmentStatusLabel(status: string): string {
    return (
        {
            pending: 'Menunggu diproses',
            shipped: 'Sedang dikirim',
            delivered: 'Terkirim',
            pickup: 'Siap diambil',
        }[status] ?? status
    );
}
