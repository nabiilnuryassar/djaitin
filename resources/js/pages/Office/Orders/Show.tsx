import { Form, Head, Link, useForm } from '@inertiajs/react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { useState } from 'react';

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
    can_print_receipt: boolean;
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
        { title: 'Orders', href: ordersIndex() },
        { title: order.order_number, href: showOrder(order.id) },
    ];

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title={order.order_number} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <SectionTabs
                    tabs={[
                        { id: 'overview', label: 'Overview' },
                        ...(order.order_type === 'convection'
                            ? [
                                  {
                                      id: 'production',
                                      label: 'Produksi & File',
                                  } as const,
                              ]
                            : []),
                        { id: 'payments', label: 'Pembayaran' },
                        { id: 'activity', label: 'Activity' },
                    ]}
                    activeTab={activeTab}
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

                {activeTab === 'overview' && (
                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                        {order.order_number}
                                    </CardTitle>
                                    <Badge variant="secondary">
                                        {formatLabel(order.status)}
                                    </Badge>
                                    <Badge variant="outline">
                                        {formatLabel(order.order_type)}
                                    </Badge>
                                    {order.is_loyalty_applied && (
                                        <Badge>Loyalty</Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    Detail order, pembayaran, dokumen, dan
                                    activity log.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid gap-3 md:grid-cols-2">
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
                                        value={formatLabel(
                                            order.production_stage ??
                                                'belum_diatur',
                                        )}
                                    />
                                    <InfoBlock
                                        label="Catatan"
                                        value={
                                            order.spec_notes ??
                                            'Tidak ada catatan'
                                        }
                                    />
                                </div>

                                <div className="rounded-xl bg-muted/50 p-4">
                                    <div className="grid gap-2 text-sm">
                                        <PriceRow
                                            label="Subtotal"
                                            value={order.subtotal}
                                        />
                                        <PriceRow
                                            label="Diskon"
                                            value={order.discount_amount}
                                        />
                                        <PriceRow
                                            label="Total"
                                            value={order.total_amount}
                                            highlight
                                        />
                                        <PriceRow
                                            label="Sudah dibayar"
                                            value={order.paid_amount}
                                        />
                                        <PriceRow
                                            label="Sisa tagihan"
                                            value={order.outstanding_amount}
                                        />
                                    </div>
                                </div>

                                {order.shipment && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm">
                                        <p className="font-medium text-[#0F172A]">
                                            Informasi pengiriman
                                        </p>
                                        <p className="mt-2 text-slate-600">
                                            {formatLabel(order.shipment.status)}{' '}
                                            •{' '}
                                            {order.shipment.courier_name ??
                                                'Kurir belum diatur'}
                                        </p>
                                        <p className="text-slate-500">
                                            {order.shipment.recipient_name} •{' '}
                                            {order.shipment.tracking_number ??
                                                'Belum ada resi'}
                                        </p>
                                    </div>
                                )}

                                <div className="grid gap-3">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border p-4 text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">
                                                    {item.item_name}
                                                </p>
                                                <span>{item.qty} pcs</span>
                                            </div>
                                            <p className="mt-1 text-muted-foreground">
                                                {`${formatCurrency(item.unit_price)} per item`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6">
                            {can.update_status && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Update status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Form
                                            {...updateOrderStatus.form(
                                                order.id,
                                            )}
                                            className="grid gap-4"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <select
                                                        name="status"
                                                        defaultValue={
                                                            order.status
                                                        }
                                                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
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
                                                        disabled={processing}
                                                    >
                                                        Simpan status
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan aksi</CardTitle>
                                    <CardDescription>
                                        Gunakan tab di atas untuk membuka
                                        produksi & file, pembayaran, dokumen produksi,
                                        dan activity log tanpa menumpuk semua
                                        panel sekaligus.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3 text-sm text-slate-600">
                                    <div className="rounded-xl border bg-muted/40 p-4">
                                        <p className="font-medium text-[#0F172A]">
                                            Overview
                                        </p>
                                        <p className="mt-1">
                                            Fokus ke identitas order, nilai
                                            tagihan, dan update status utama.
                                        </p>
                                    </div>
                                    <div className="rounded-xl border bg-muted/40 p-4">
                                        <p className="font-medium text-[#0F172A]">
                                            {order.order_type === 'convection'
                                                ? 'Produksi & File'
                                                : 'Pembayaran'}
                                        </p>
                                        <p className="mt-1">
                                            {order.order_type === 'convection'
                                                ? 'Kelola file desain, dokumen, dan tahap produksi tanpa bercampur dengan panel lain.'
                                                : 'Gunakan tab pembayaran untuk pencatatan transaksi dan verifikasi transfer.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'production' &&
                    order.order_type === 'convection' && (
                        <div className="grid gap-6">
                            <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Ringkasan item</CardTitle>
                                        <CardDescription>
                                            Detail item konveksi dan nilai order
                                            yang sedang diproses.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-3">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-xl border p-4 text-sm"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="font-medium">
                                                            {item.item_name}
                                                        </p>
                                                        <p className="text-slate-500">
                                                            {item.qty} pcs
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">
                                                            {formatCurrency(
                                                                item.unit_price,
                                                            )}
                                                        </p>
                                                        <p className="text-slate-500">
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

                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Dokumen & Produksi
                                        </CardTitle>
                                        <CardDescription>
                                            Cetak nota dan update tahap produksi
                                            untuk order konveksi.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        {can.print_nota ? (
                                            <Button asChild variant="outline">
                                                <a
                                                    href={
                                                        printNotaRoute(order.id)
                                                            .url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Print nota
                                                </a>
                                            </Button>
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                Nota tersedia setelah ada
                                                pembayaran verified.
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
                                                            className="h-10 rounded-md border bg-transparent px-3 text-sm"
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
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            Update tahap
                                                            produksi
                                                        </Button>
                                                    </>
                                                )}
                                            </Form>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Kolaborasi desain</CardTitle>
                                    <CardDescription>
                                        Kirim proposal desain, final artwork,
                                        atau file revisi ke customer. Semua
                                        lampiran ditampilkan sebagai daftar file
                                        dan catatan sederhana.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="rounded-2xl border border-[#DBEAFE] bg-[linear-gradient(135deg,#F8FAFF_0%,#EFF4FF_100%)] p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold tracking-[0.18em] text-[#2563EB] uppercase">
                                                    Collaboration Desk
                                                </p>
                                                <p className="mt-1 [font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                                    Semua file desain dan
                                                    keputusan customer terkumpul
                                                    di sini
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
                                                <p className="font-semibold text-[#0F172A]">
                                                    {order.attachments.length}{' '}
                                                    file kolaborasi
                                                </p>
                                                <p className="mt-1 text-xs">
                                                    Referensi customer, revisi,
                                                    dan final artwork
                                                    ditampilkan dalam satu
                                                    daftar sederhana.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {order.attachments.length === 0 ? (
                                        <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                            Belum ada file kolaborasi pada order
                                            ini.
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                                        <OfficeAttachmentUploader
                                            orderId={order.id}
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            <DesignAttachmentDetailDialog
                                attachment={selectedAttachment}
                                open={selectedAttachment !== null}
                                onOpenChange={(open) => {
                                    if (!open) {
                                        setSelectedAttachment(null);
                                    }
                                }}
                            />
                        </div>
                    )}

                {activeTab === 'payments' && (
                    <div className="grid gap-6">
                        {can.record_payment && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Catat pembayaran</CardTitle>
                                    <CardDescription>
                                        Cash akan langsung verified, transfer
                                        masuk antrean verifikasi.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
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
                                                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
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
                                                        className="min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                    >
                                                        Simpan pembayaran
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Riwayat pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {order.payments.length === 0 ? (
                                    <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                        Belum ada pembayaran pada order ini.
                                    </div>
                                ) : (
                                    order.payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="grid gap-4 rounded-xl border p-4 xl:grid-cols-[1fr_220px]"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">
                                                        {payment.payment_number}
                                                    </p>
                                                    <Badge variant="secondary">
                                                        {formatLabel(
                                                            payment.status,
                                                        )}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {formatLabel(
                                                            payment.method,
                                                        )}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </p>
                                                {payment.reference_number && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Ref:{' '}
                                                        {
                                                            payment.reference_number
                                                        }
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
                                                        className="inline-flex text-sm font-medium text-[#2563EB]"
                                                    >
                                                        Print kwitansi
                                                    </a>
                                                )}
                                                {payment.rejection_reason && (
                                                    <p className="text-sm text-destructive">
                                                        Alasan reject:{' '}
                                                        {
                                                            payment.rejection_reason
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {(can.verify_payment ||
                                                can.reject_payment) &&
                                                payment.status ===
                                                    'pending_verification' && (
                                                    <div className="grid gap-3">
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
                                                                        className="w-full"
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
                                                                className="grid gap-3"
                                                            >
                                                                {({
                                                                    errors,
                                                                    processing,
                                                                }) => (
                                                                    <>
                                                                        <textarea
                                                                            name="rejection_reason"
                                                                            placeholder="Alasan penolakan"
                                                                            className="min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm"
                                                                        />
                                                                        <InputError
                                                                            message={
                                                                                errors.rejection_reason
                                                                            }
                                                                        />
                                                                        <Button
                                                                            type="submit"
                                                                            variant="destructive"
                                                                            disabled={
                                                                                processing
                                                                            }
                                                                        >
                                                                            Tolak
                                                                            transfer
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </Form>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity log</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {order.activity.length === 0 ? (
                                <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                    Belum ada activity log.
                                </div>
                            ) : (
                                order.activity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="rounded-xl border p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium">
                                                    {activity.action}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {activity.notes ?? '-'}
                                                </p>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                <p>
                                                    {activity.user_name ??
                                                        'System'}
                                                </p>
                                                <p>
                                                    {activity.created_at ?? '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
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
        <div className="rounded-xl border p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-2 font-medium">{value}</p>
            {helper && (
                <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
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
                className={highlight ? 'font-medium' : 'text-muted-foreground'}
            >
                {label}
            </span>
            <span className={highlight ? 'font-semibold' : ''}>
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
        <div className="grid gap-4 rounded-2xl border border-[#DBEAFE] bg-[#F8FAFF] p-5">
            <div>
                <p className="font-medium text-[#0F172A]">
                    Kirim file ke customer
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
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
                    className="h-10 rounded-md border bg-white px-3 text-sm"
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
                    className="min-h-24 rounded-md border bg-white px-3 py-2 text-sm"
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
            >
                Kirim file kolaborasi
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
            className="grid gap-3 rounded-2xl border border-white/70 bg-white p-4 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.12)]"
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
                <p className="font-semibold text-[#0F172A]">
                    {attachment.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {attachment.uploaded_by_role === 'customer'
                        ? 'Dari customer'
                        : 'Dari office'}
                    {' • '}
                    {attachment.uploaded_by ?? 'User'}
                </p>
            </div>
            <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {attachment.notes ?? attachment.file_name}
            </p>
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{attachment.uploaded_at ?? '-'}</span>
                <span>Klik detail</span>
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
            <DialogContent className="border-[#DBEAFE] bg-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{attachment.title}</DialogTitle>
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
                        <div className="rounded-2xl bg-[#F8FAFF] p-4 text-sm leading-6 text-slate-600">
                            <p className="text-xs font-semibold tracking-[0.16em] text-[#1B5EC5] uppercase">
                                File
                            </p>
                            <p className="mt-2 font-medium text-[#0F172A]">
                                {attachment.file_name}
                            </p>
                            <p className="mt-1">{attachment.file_type}</p>
                        </div>
                        <div className="rounded-2xl bg-[#F8FAFF] p-4 text-sm leading-6 text-slate-600">
                            <p className="text-xs font-semibold tracking-[0.16em] text-[#1B5EC5] uppercase">
                                Upload
                            </p>
                            <p className="mt-2 font-medium text-[#0F172A]">
                                {attachment.uploaded_by ?? 'User'}
                            </p>
                            <p className="mt-1">
                                {attachment.uploaded_at ?? '-'}
                            </p>
                        </div>
                    </div>

                    {attachment.notes && (
                        <div className="rounded-2xl bg-[#F8FAFF] p-4 text-sm leading-7 text-slate-700">
                            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-[#1B5EC5] uppercase">
                                Catatan file
                            </p>
                            {attachment.notes}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button asChild variant="outline">
                        <a
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Buka file
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
            ? 'bg-emerald-50 text-emerald-700'
            : tone === 'amber'
              ? 'bg-amber-50 text-amber-700'
              : tone === 'slate'
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
        <div className="rounded-2xl border bg-card p-2 shadow-sm">
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={
                            activeTab === tab.id
                                ? 'rounded-xl bg-[#1B5EC5] px-4 py-2.5 text-sm font-semibold text-white'
                                : 'rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-muted hover:text-[#1B5EC5]'
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
