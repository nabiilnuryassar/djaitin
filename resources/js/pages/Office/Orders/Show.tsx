import { Form, Head, useForm } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import { useState } from 'react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
    index as ordersIndex,
    show as showOrder,
    uploadAttachment as uploadOrderAttachment,
    updateStatus as updateOrderStatus,
} from '@/actions/App/Http/Controllers/Office/OrderController';
import {
    reject as rejectPayment,
    store as storePayment,
    verify as verifyPayment,
} from '@/actions/App/Http/Controllers/Office/PaymentController';
import refundPayment from '@/actions/App/Http/Controllers/Office/PaymentRefundController';
import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { EmptyState } from '@/components/office/empty-state';
import { PageHeader } from '@/components/office/page-header';
import { PremiumCard } from '@/components/office/premium-card';
import { SectionShell } from '@/components/office/section-shell';
import { SegmentedTabs } from '@/components/office/segmented-tabs';
import { StatusBadge } from '@/components/office/status-badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OfficeLayout from '@/layouts/office-layout';
import {
    nota as printNotaRoute,
    productionStage as updateProductionStageRoute,
} from '@/routes/office/orders';
import { kwitansi as printReceiptRoute } from '@/routes/office/payments';
import type { BreadcrumbItem } from '@/types';

// Office Primitives

type Payment = {
    id: number;
    payment_number: string;
    method: string;
    status: string;
    amount: number;
    reference_number: string | null;
    rejection_reason: string | null;
    notes: string | null;
    payment_date: string | null;
    verified_at: string | null;
    refunded_at: string | null;
    refunded_by_name: string | null;
    refund_reason: string | null;
    can_print_receipt: boolean;
    proof_image_path: string | null;
    proof_image_url: string | null;
};

type Props = {
    order: {
        id: number;
        order_number: string;
        status: string;
        order_type: string;
        company_name: string | null;
        production_stage: string | null;
        due_date: string | null;
        spec_notes: string | null;
        subtotal: number;
        discount_amount: number;
        total_amount: number;
        paid_amount: number;
        outstanding_amount: number;
        is_loyalty_applied: boolean;
        customer: {
            id: number | null;
            name: string | null;
            phone: string | null;
        };
        garment_model: {
            id: number;
            name: string;
        } | null;
        fabric: {
            id: number;
            name: string;
        } | null;
        measurement: {
            id: number;
            label: string;
        } | null;
        items: Array<{
            id: number;
            item_name: string;
            qty: number;
            unit_price: number;
            discount_amount: number;
            subtotal: number;
        }>;
        shipment: {
            id: number;
            status: string;
            tracking_number: string | null;
            courier_name: string | null;
            recipient_name: string;
        } | null;
        payments: Payment[];
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
        activity: Array<{
            id: number;
            action: string;
            notes: string | null;
            user_name: string | null;
            created_at: string | null;
        }>;
    };
    statuses: Array<{
        value: string;
        label: string;
    }>;
    productionStages: Array<{
        value: string;
        label: string;
    }>;
    can: {
        update_status: boolean;
        update_production_stage: boolean;
        record_payment: boolean;
        upload_attachment: boolean;
        verify_payment: boolean;
        reject_payment: boolean;
        refund_payment: boolean;
        print_nota: boolean;
    };
};

export default function OrdersShow({
    order,
    statuses,
    productionStages,
    can,
}: Props) {
    const [activeTab, setActiveTab] = useState<
        'overview' | 'production' | 'payments' | 'activity'
    >('overview');
    const [selectedAttachment, setSelectedAttachment] = useState<
        Props['order']['attachments'][number] | null
    >(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: DashboardController() },
        { title: 'Pesanan', href: ordersIndex() },
        { title: order.order_number, href: showOrder(order.id) },
    ];

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title={order.order_number} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Detail Pesanan"
                    title={order.order_number}
                    description="Detail order, pembayaran, dokumen, dan riwayat aktivitas."
                    actions={
                        <div className="flex items-center gap-2">
                            <StatusBadge value={order.status} domain="order" />
                            <Badge variant="outline" className="rounded-full">
                                {order.order_type === 'convection' ? 'Konveksi' : 'RTW'}
                            </Badge>
                            {order.is_loyalty_applied && (
                                <Badge className="rounded-full bg-brand-gold text-brand-navy border-none font-semibold">
                                    Loyalty
                                </Badge>
                            )}
                        </div>
                    }
                />

                <div className="mb-2">
                    <SegmentedTabs
                        items={[
                            { value: 'overview', label: 'Ringkasan' },
                            ...(order.order_type === 'convection'
                                ? [
                                      {
                                          value: 'production',
                                          label: 'Produksi & File',
                                      } as const,
                                  ]
                                : []),
                            { value: 'payments', label: 'Pembayaran' },
                            { value: 'activity', label: 'Aktivitas' },
                        ]}
                        value={activeTab}
                        onChange={(tabId) =>
                            setActiveTab(
                                tabId as
                                    | 'overview'
                                    | 'production'
                                    | 'payments'
                                    | 'activity',
                            )
                        }
                    />
                </div>

                {activeTab === 'overview' && (
                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="grid gap-6">
                            <SectionShell title="Informasi Umum">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <InfoBlock
                                        label="Pelanggan"
                                        value={order.customer.name ?? '-'}
                                        helper={
                                            order.customer.phone ?? undefined
                                        }
                                    />
                                    <InfoBlock
                                        label={
                                            order.order_type === 'convection'
                                                ? 'Perusahaan'
                                                : 'Model'
                                        }
                                        value={
                                            order.order_type === 'convection'
                                                ? (order.company_name ?? '-')
                                                : (order.garment_model?.name ??
                                                  '-')
                                        }
                                    />
                                    <InfoBlock
                                        label="Bahan"
                                        value={order.fabric?.name ?? '-'}
                                    />
                                    <InfoBlock
                                        label="Ukuran"
                                        value={order.measurement?.label ?? '-'}
                                    />
                                    <InfoBlock
                                        label="Due date"
                                        value={order.due_date ?? '-'}
                                    />
                                    <InfoBlock
                                        label="Tahap produksi"
                                        value={
                                            order.production_stage
                                                ? formatLabel(order.production_stage)
                                                : 'Belum diatur'
                                        }
                                    />
                                    <div className="md:col-span-2">
                                        <InfoBlock
                                            label="Catatan Spesifikasi"
                                            value={
                                                order.spec_notes ??
                                                'Tidak ada catatan'
                                            }
                                        />
                                    </div>
                                </div>
                            </SectionShell>

                            <SectionShell title="Item Pesanan">
                                <div className="grid gap-3">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-2xl border border-border/70 bg-brand-mist/30 p-4 text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-brand-ink">
                                                    {item.item_name}
                                                </p>
                                                <span className="font-medium">{item.qty} pcs</span>
                                            </div>
                                            <p className="mt-1 text-muted-foreground">
                                                {`${formatCurrency(item.unit_price)} per item`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </SectionShell>
                        </div>

                        <div className="grid gap-6">
                            <PremiumCard className="sticky top-6">
                                <h3 className="text-lg font-semibold text-brand-ink mb-4">Ringkasan Biaya</h3>
                                <div className="rounded-2xl bg-brand-mist/50 p-4 mb-4">
                                    <div className="grid gap-3 text-sm">
                                        <PriceRow
                                            label="Subtotal"
                                            value={order.subtotal}
                                        />
                                        <PriceRow
                                            label="Diskon"
                                            value={order.discount_amount}
                                        />
                                        <div className="border-t border-border/70 my-2 pt-2">
                                            <PriceRow
                                                label="Total Akhir"
                                                value={order.total_amount}
                                                highlight
                                            />
                                        </div>
                                        <PriceRow
                                            label="Sudah dibayar"
                                            value={order.paid_amount}
                                        />
                                        <PriceRow
                                            label="Sisa tagihan"
                                            value={order.outstanding_amount}
                                            highlight={order.outstanding_amount > 0}
                                        />
                                    </div>
                                </div>

                                {order.shipment && (
                                    <div className="rounded-2xl border border-border/70 bg-brand-mist/30 p-4 text-sm mb-4">
                                        <p className="font-semibold text-brand-ink">
                                            Informasi Pengiriman
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <StatusBadge value={order.shipment.status} domain="shipment" />
                                            <span className="text-muted-foreground">•</span>
                                            <span className="font-medium text-brand-ink">
                                                {order.shipment.courier_name ??
                                                    'Kurir belum diatur'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-muted-foreground">
                                            Penerima: {order.shipment.recipient_name}
                                        </p>
                                        {order.shipment.tracking_number && (
                                            <p className="mt-1 text-xs font-mono bg-white/80 w-fit px-2 py-1 rounded border border-border/50 text-brand-ink">
                                                No. Resi: {order.shipment.tracking_number}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {can.update_status && (
                                    <div className="border-t border-border/70 pt-4 mt-4">
                                        <h4 className="text-sm font-semibold text-brand-ink mb-2">Update Status Pesanan</h4>
                                        <Form
                                            {...updateOrderStatus.form(
                                                order.id,
                                            )}
                                            className="grid gap-3"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <select
                                                        name="status"
                                                        defaultValue={
                                                            order.status
                                                        }
                                                        className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                                                    >
                                                        {statuses.map(
                                                            (status) => (
                                                                <option
                                                                    key={
                                                                        status.value
                                                                    }
                                                                    value={
                                                                        status.value
                                                                    }
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <InputError
                                                        message={errors.status}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer"
                                                        disabled={processing}
                                                    >
                                                        Simpan Status
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    </div>
                                )}
                            </PremiumCard>
                        </div>
                    </div>
                )}

                {activeTab === 'production' &&
                    order.order_type === 'convection' && (
                        <div className="grid gap-6">
                            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                <SectionShell title="Ringkasan Item">
                                    <div className="grid gap-3">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-2xl border border-border/70 bg-brand-mist/30 p-4 text-sm"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="font-semibold text-brand-ink">
                                                            {item.item_name}
                                                        </p>
                                                        <p className="text-muted-foreground mt-1">
                                                            {item.qty} pcs
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-brand-ink">
                                                            {formatCurrency(
                                                                item.unit_price,
                                                            )}
                                                        </p>
                                                        <p className="text-muted-foreground mt-1">
                                                            {formatCurrency(
                                                                item.subtotal,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </SectionShell>

                                <SectionShell title="Dokumen & Produksi">
                                    <div className="grid gap-4">
                                        {can.print_nota ? (
                                            <Button asChild variant="outline" className="rounded-xl cursor-pointer">
                                                <a
                                                    href={
                                                        printNotaRoute(order.id)
                                                            .url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Cetak Nota
                                                </a>
                                            </Button>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Nota tersedia setelah ada pembayaran verified.
                                            </p>
                                        )}

                                        {can.update_production_stage && (
                                            <Form
                                                {...updateProductionStageRoute.form(
                                                    order.id,
                                                )}
                                                className="grid gap-3"
                                            >
                                                {({ processing }) => (
                                                    <>
                                                        <select
                                                            name="production_stage"
                                                            defaultValue={
                                                                order.production_stage ??
                                                                'design'
                                                            }
                                                            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                                                        >
                                                            {productionStages.map(
                                                                (stage) => (
                                                                    <option
                                                                        key={
                                                                            stage.value
                                                                        }
                                                                        value={
                                                                            stage.value
                                                                        }
                                                                    >
                                                                        {
                                                                            stage.label
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                        <Button
                                                            type="submit"
                                                            className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            Update Tahap Produksi
                                                        </Button>
                                                    </>
                                                )}
                                            </Form>
                                        )}
                                    </div>
                                </SectionShell>
                            </div>

                            <PremiumCard>
                                <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold tracking-wider text-brand-blue uppercase">
                                                Collaboration Desk
                                            </p>
                                            <h4 className="mt-1 text-lg font-bold text-brand-ink">
                                                Semua file desain dan keputusan customer terkumpul di sini
                                            </h4>
                                        </div>
                                        <div className="rounded-xl bg-white p-3 text-sm text-muted-foreground shadow-sm">
                                            <p className="font-semibold text-brand-ink">
                                                {order.attachments.length} file kolaborasi
                                            </p>
                                            <p className="mt-1 text-xs">
                                                Referensi customer, revisi, dan final artwork.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {order.attachments.length === 0 ? (
                                    <EmptyState
                                        icon={Inbox}
                                        title="Belum ada file kolaborasi"
                                        description="Belum ada file kolaborasi pada order ini."
                                    />
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-6">
                                        {order.attachments.map(
                                            (attachment) => (
                                                <SimpleAttachmentCard
                                                    key={attachment.id}
                                                    attachment={attachment}
                                                    onClick={() =>
                                                        setSelectedAttachment(
                                                            attachment,
                                                        )
                                                    }
                                                />
                                            ),
                                        )}
                                    </div>
                                )}

                                {can.upload_attachment && (
                                    <div className="border-t border-border/70 pt-6 mt-6">
                                        <OfficeAttachmentUploader
                                            orderId={order.id}
                                        />
                                    </div>
                                )}
                            </PremiumCard>
                        </div>
                    )}

                {activeTab === 'payments' && (
                    <div className="grid gap-6">
                        {can.record_payment && (
                            <SectionShell
                                title="Catat Pembayaran"
                                description="Cash akan langsung verified, transfer masuk antrean verifikasi."
                            >
                                <Form
                                    {...storePayment.form(order.id)}
                                    className="grid gap-4 md:grid-cols-2"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="method">
                                                    Metode
                                                </Label>
                                                <select
                                                    id="method"
                                                    name="method"
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                                                    defaultValue="cash"
                                                >
                                                    <option value="cash">
                                                        Cash
                                                    </option>
                                                    <option value="transfer">
                                                        Transfer
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={errors.method}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="amount">
                                                    Nominal
                                                </Label>
                                                <Input
                                                    id="amount"
                                                    name="amount"
                                                    type="number"
                                                    min="1"
                                                    className="rounded-xl border border-border"
                                                />
                                                <InputError
                                                    message={errors.amount}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="reference_number">
                                                    Referensi transfer
                                                </Label>
                                                <Input
                                                    id="reference_number"
                                                    name="reference_number"
                                                    className="rounded-xl border border-border"
                                                />
                                                <InputError
                                                    message={
                                                        errors.reference_number
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2 md:col-span-2">
                                                <Label htmlFor="notes">
                                                    Catatan
                                                </Label>
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    className="min-h-20 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                                />
                                            </div>
                                            <div className="grid gap-2 md:col-span-2">
                                                <Label htmlFor="proof">
                                                    Bukti pembayaran
                                                </Label>
                                                <Input
                                                    id="proof"
                                                    name="proof"
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    className="rounded-xl border border-border cursor-pointer"
                                                />
                                                <InputError
                                                    message={errors.proof}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Button
                                                    type="submit"
                                                    className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer"
                                                    disabled={processing}
                                                >
                                                    Simpan Pembayaran
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </SectionShell>
                        )}

                        <SectionShell title="Riwayat Pembayaran">
                            {order.payments.length === 0 ? (
                                <EmptyState
                                    icon={Inbox}
                                    title="Belum ada pembayaran"
                                    description="Belum ada pembayaran pada order ini."
                                />
                            ) : (
                                <div className="grid gap-4">
                                    {order.payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="grid gap-4 rounded-2xl border border-border/70 bg-brand-mist/30 p-4 xl:grid-cols-[1fr_220px]"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-brand-ink">
                                                        {payment.payment_number}
                                                    </p>
                                                    <StatusBadge value={payment.status} domain="payment" />
                                                    <Badge variant="outline" className="rounded-full">
                                                        {formatLabel(payment.method)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-semibold text-brand-ink">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </p>
                                                {payment.reference_number && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Ref: {payment.reference_number}
                                                    </p>
                                                )}
                                                {payment.can_print_receipt && (
                                                    <a
                                                        href={
                                                            printReceiptRoute(
                                                                payment.id,
                                                            ).url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex text-xs font-semibold text-brand-blue hover:underline"
                                                    >
                                                        Cetak Kwitansi
                                                    </a>
                                                )}
                                                {payment.rejection_reason && (
                                                    <p className="text-xs text-destructive font-semibold">
                                                        Alasan penolakan: {payment.rejection_reason}
                                                    </p>
                                                )}
                                                <PaymentProofPreview
                                                    payment={payment}
                                                />
                                            </div>

                                            {(can.verify_payment ||
                                                can.reject_payment) &&
                                                payment.status ===
                                                    'pending_verification' && (
                                                    <div className="grid gap-2 self-start">
                                                        {can.verify_payment && (
                                                            <Form
                                                                {...verifyPayment.form(
                                                                    payment.id,
                                                                )}
                                                            >
                                                                {({
                                                                    processing,
                                                                }) => (
                                                                    <Button
                                                                        type="submit"
                                                                        className="w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer"
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                    >
                                                                        Verifikasi
                                                                    </Button>
                                                                )}
                                                            </Form>
                                                        )}
                                                        {can.reject_payment && (
                                                            <Form
                                                                {...rejectPayment.form(
                                                                    payment.id,
                                                                )}
                                                                className="grid gap-2"
                                                            >
                                                                {({
                                                                    errors,
                                                                    processing,
                                                                }) => (
                                                                    <>
                                                                        <textarea
                                                                            name="rejection_reason"
                                                                            placeholder="Alasan penolakan"
                                                                            className="min-h-16 rounded-xl border border-border bg-white px-3 py-2 text-xs text-brand-ink"
                                                                        />
                                                                        <InputError
                                                                            message={
                                                                                errors.rejection_reason
                                                                            }
                                                                        />
                                                                        <Button
                                                                            type="submit"
                                                                            variant="destructive"
                                                                            className="w-full rounded-xl cursor-pointer"
                                                                            disabled={
                                                                                processing
                                                                            }
                                                                        >
                                                                            Tolak Transfer
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </Form>
                                                        )}
                                                    </div>
                                                )}
                                            {can.refund_payment &&
                                                payment.status ===
                                                    'verified' && (
                                                    <RefundPaymentDialog
                                                        payment={payment}
                                                    />
                                                )}
                                            {payment.status === 'refunded' && (
                                                <RefundSummary
                                                    payment={payment}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionShell>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <SectionShell title="Log Aktivitas">
                        {order.activity.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                title="Belum ada aktivitas"
                                description="Belum ada aktivitas tercatat pada order ini."
                            />
                        ) : (
                            <div className="grid gap-3">
                                {order.activity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="rounded-2xl border border-border/70 bg-brand-mist/30 p-4 text-sm"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-brand-ink">
                                                    {activity.action}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {activity.notes ?? '-'}
                                                </p>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                <p className="font-medium text-brand-ink">
                                                    {activity.user_name ??
                                                        'Sistem'}
                                                </p>
                                                <p className="mt-0.5">
                                                    {activity.created_at ?? '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionShell>
                )}
        </div>

        <DesignAttachmentDetailDialog
            attachment={selectedAttachment}
            open={selectedAttachment !== null}
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedAttachment(null);
                }
            }}
        />
    </OfficeLayout>
    );
}

function InfoBlock({
    label,
    value,
    helper,
}: {
    label: string;
    value: string;
    helper?: string;
}) {
    return (
        <div className="rounded-2xl border border-border/70 bg-brand-mist/30 p-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-2 font-semibold text-brand-ink">{value}</p>
            {helper && (
                <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            )}
        </div>
    );
}

function PriceRow({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: number;
    highlight?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span
                className={highlight ? 'font-semibold text-brand-ink' : 'text-muted-foreground'}
            >
                {label}
            </span>
            <span className={highlight ? 'font-bold text-lg text-brand-ink' : 'font-medium text-brand-ink'}>
                {formatCurrency(value)}
            </span>
        </div>
    );
}

function OfficeAttachmentUploader({ orderId }: { orderId: number }) {
    const form = useForm({
        file: null as File | null,
        title: '',
        notes: '',
        attachment_type: 'design_proposal',
    });

    return (
        <div className="grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/20 p-5">
            <div>
                <p className="font-semibold text-brand-ink text-base">
                    Kirim file ke customer
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Upload file desain, revisi, atau final artwork. Semua file
                    akan muncul di portal customer sebagai daftar lampiran.
                </p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`office-attachment-title-${orderId}`}>
                    Judul file
                </Label>
                <Input
                    id={`office-attachment-title-${orderId}`}
                    value={form.data.title}
                    onChange={(event) =>
                        form.setData('title', event.target.value)
                    }
                    placeholder="Contoh: Mockup seragam event v1"
                    className="rounded-xl border border-border bg-white"
                />
                <InputError message={form.errors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`office-attachment-type-${orderId}`}>
                    Tipe file
                </Label>
                <select
                    id={`office-attachment-type-${orderId}`}
                    value={form.data.attachment_type}
                    onChange={(event) =>
                        form.setData('attachment_type', event.target.value)
                    }
                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                >
                    <option value="design_proposal">Proposal Desain</option>
                    <option value="final_artwork">Final Artwork</option>
                    <option value="revision">Revisi</option>
                    <option value="other">Lainnya</option>
                </select>
                <InputError message={form.errors.attachment_type} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`office-attachment-notes-${orderId}`}>
                    Catatan untuk customer
                </Label>
                <textarea
                    id={`office-attachment-notes-${orderId}`}
                    value={form.data.notes}
                    onChange={(event) =>
                        form.setData('notes', event.target.value)
                    }
                    className="min-h-24 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                    placeholder="Jelaskan poin desain, warna, atau bagian yang perlu dicek customer."
                />
                <InputError message={form.errors.notes} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`office-attachment-file-${orderId}`}>
                    File desain
                </Label>
                <Input
                    id={`office-attachment-file-${orderId}`}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) =>
                        form.setData('file', event.target.files?.[0] ?? null)
                    }
                    className="rounded-xl border border-border bg-white cursor-pointer"
                />
                <InputError message={form.errors.file} />
            </div>

            <Button
                type="button"
                disabled={form.processing}
                onClick={() =>
                    form.post(uploadOrderAttachment(orderId).url, {
                        forceFormData: true,
                        preserveScroll: true,
                    })
                }
                className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer"
            >
                Kirim File Kolaborasi
            </Button>
        </div>
    );
}

function SimpleAttachmentCard({
    attachment,
    onClick,
}: {
    attachment: Props['order']['attachments'][number];
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="grid gap-3 rounded-2xl border border-border/70 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-brand-blue/30 cursor-pointer"
        >
            <div className="flex flex-wrap gap-2">
                <OfficeBadge tone="blue">
                    {attachment.attachment_type_label}
                </OfficeBadge>
                <OfficeBadge tone="slate">
                    {attachment.uploaded_by_role === 'customer'
                        ? 'Dari Customer'
                        : 'Dari Office'}
                </OfficeBadge>
            </div>
            <div>
                <p className="font-semibold text-brand-ink">
                    {attachment.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {attachment.uploaded_by_role === 'customer'
                        ? 'Dari customer'
                        : 'Dari office'}
                    {' • '}
                    {attachment.uploaded_by ?? 'User'}
                </p>
            </div>
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                {attachment.notes ?? attachment.file_name}
            </p>
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{attachment.uploaded_at ?? '-'}</span>
                <span className="font-medium text-brand-blue">Detail</span>
            </div>
        </button>
    );
}

function DesignAttachmentDetailDialog({
    attachment,
    open,
    onOpenChange,
}: {
    attachment: Props['order']['attachments'][number] | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (attachment === null) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border bg-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-brand-ink">{attachment.title}</DialogTitle>
                    <DialogDescription>
                        Detail file, sumber upload, dan catatan yang dikirim.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="flex flex-wrap gap-2">
                        <OfficeBadge tone="blue">
                            {attachment.attachment_type_label}
                        </OfficeBadge>
                        <OfficeBadge tone="slate">
                            {attachment.uploaded_by_role === 'customer'
                                ? 'Dari Customer'
                                : 'Dari Office'}
                        </OfficeBadge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-brand-mist/30 border border-border/50 p-4 text-sm leading-6 text-muted-foreground">
                            <p className="text-xs font-semibold tracking-wider text-brand-blue uppercase">
                                File
                            </p>
                            <p className="mt-2 font-semibold text-brand-ink">
                                {attachment.file_name}
                            </p>
                            <p className="mt-1">{attachment.file_type}</p>
                        </div>
                        <div className="rounded-2xl bg-brand-mist/30 border border-border/50 p-4 text-sm leading-6 text-muted-foreground">
                            <p className="text-xs font-semibold tracking-wider text-brand-blue uppercase">
                                Upload
                            </p>
                            <p className="mt-2 font-semibold text-brand-ink">
                                {attachment.uploaded_by ?? 'User'}
                            </p>
                            <p className="mt-1">
                                {attachment.uploaded_at ?? '-'}
                            </p>
                        </div>
                    </div>

                    {attachment.notes && (
                        <div className="rounded-2xl bg-brand-mist/30 border border-border/50 p-4 text-sm leading-7 text-brand-ink">
                            <p className="mb-2 text-xs font-semibold tracking-wider text-brand-blue uppercase">
                                Catatan file
                            </p>
                            {attachment.notes}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button asChild variant="outline" className="rounded-xl cursor-pointer">
                        <a
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Buka File
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function OfficeBadge({
    children,
    tone,
}: {
    children: string;
    tone: 'blue' | 'green' | 'amber' | 'slate';
}) {
    const toneClass =
        tone === 'green'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : tone === 'amber'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : tone === 'slate'
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-[#EFF4FF] text-brand-blue border-blue-200';

    return (
        <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wider uppercase ${toneClass}`}
        >
            {children}
        </span>
    );
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatLabel(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function PaymentProofPreview({ payment }: { payment: Payment }) {
    if (!payment.proof_image_url) {
        return (
            <div className="rounded-xl border border-dashed bg-brand-mist/20 px-3 py-2 text-xs text-muted-foreground">
                Customer belum mengunggah bukti transfer.
            </div>
        );
    }

    const isPdf = payment.proof_image_path?.toLowerCase().endsWith('.pdf');

    return (
        <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Bukti transfer
            </p>
            {isPdf ? (
                <a
                    href={payment.proof_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border bg-white/80 px-3 py-2 text-xs font-semibold text-brand-blue hover:bg-white cursor-pointer"
                >
                    Buka bukti (PDF)
                </a>
            ) : (
                <a
                    href={payment.proof_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-fit overflow-hidden rounded-2xl border border-border/70 hover:opacity-90 cursor-pointer"
                    title="Klik untuk perbesar"
                >
                    <img
                        src={payment.proof_image_url}
                        alt={`Bukti transfer ${payment.payment_number}`}
                        className="h-40 w-auto max-w-xs object-cover rounded-2xl"
                        loading="lazy"
                    />
                </a>
            )}
        </div>
    );
}

function RefundPaymentDialog({ payment }: { payment: Payment }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="destructive" className="w-full rounded-xl cursor-pointer">
                    Refund pembayaran
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
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                    <p className="mt-1 text-xs text-red-700">
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
                                    className="min-h-24 rounded-xl border bg-white px-3 py-2 text-sm text-brand-ink"
                                />
                                <InputError message={errors.reason} />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                    className="rounded-xl cursor-pointer"
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
            <p className="text-xs">{payment.refund_reason ?? 'Alasan refund tidak tersedia.'}</p>
            <p className="mt-1 text-[11px] text-red-700 font-medium">
                {payment.refunded_at ?? '-'} ·{' '}
                {payment.refunded_by_name ?? 'Admin'}
            </p>
        </div>
    );
}
