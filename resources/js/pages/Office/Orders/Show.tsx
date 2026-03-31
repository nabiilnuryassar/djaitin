import { Form, Head, Link } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
    index as ordersIndex,
    show as showOrder,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OfficeLayout from '@/layouts/office-layout';
import type { BreadcrumbItem } from '@/types';

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
};

type Props = {
    order: {
        id: number;
        order_number: string;
        status: string;
        order_type: string;
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
        payments: Payment[];
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
    can: {
        update_status: boolean;
        record_payment: boolean;
        verify_payment: boolean;
        reject_payment: boolean;
    };
};

export default function OrdersShow({ order, statuses, can }: Props) {
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

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <CardTitle>{order.order_number}</CardTitle>
                                <Badge variant="secondary">{order.status}</Badge>
                                {order.is_loyalty_applied && <Badge>Loyalty</Badge>}
                            </div>
                            <CardDescription>
                                Detail order tailor, pembayaran, dan activity log.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-3 md:grid-cols-2">
                                <InfoBlock
                                    label="Pelanggan"
                                    value={order.customer.name ?? '-'}
                                    helper={order.customer.phone ?? undefined}
                                />
                                <InfoBlock
                                    label="Model"
                                    value={order.garment_model?.name ?? '-'}
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
                                    label="Catatan"
                                    value={order.spec_notes ?? 'Tidak ada catatan'}
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
                                            {formatCurrency(item.unit_price)} per item
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
                                        {...updateOrderStatus.form(order.id)}
                                        className="grid gap-4"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <select
                                                    name="status"
                                                    defaultValue={order.status}
                                                    className="h-10 rounded-md border bg-transparent px-3 text-sm"
                                                >
                                                    {statuses.map((status) => (
                                                        <option
                                                            key={status.value}
                                                            value={status.value}
                                                        >
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.status} />
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

                        {can.record_payment && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Catat pembayaran</CardTitle>
                                    <CardDescription>
                                        Cash akan langsung verified, transfer masuk antrean verifikasi.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form
                                        {...storePayment.form(order.id)}
                                        className="grid gap-4"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="method">Metode</Label>
                                                    <select
                                                        id="method"
                                                        name="method"
                                                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
                                                        defaultValue="cash"
                                                    >
                                                        <option value="cash">Cash</option>
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
                                                <div className="grid gap-2">
                                                    <Label htmlFor="notes">
                                                        Catatan
                                                    </Label>
                                                    <textarea
                                                        id="notes"
                                                        name="notes"
                                                        className="min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    Simpan pembayaran
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

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
                                                {payment.status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {payment.method}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                        {payment.reference_number && (
                                            <p className="text-sm text-muted-foreground">
                                                Ref: {payment.reference_number}
                                            </p>
                                        )}
                                        {payment.rejection_reason && (
                                            <p className="text-sm text-destructive">
                                                Alasan reject: {payment.rejection_reason}
                                            </p>
                                        )}
                                    </div>

                                    {(can.verify_payment ||
                                        can.reject_payment) &&
                                        payment.status === 'pending_verification' && (
                                            <div className="grid gap-3">
                                                {can.verify_payment && (
                                                    <Form
                                                        {...verifyPayment.form(
                                                            payment.id,
                                                        )}
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                type="submit"
                                                                className="w-full"
                                                                disabled={processing}
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
                                                        {({ errors, processing }) => (
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
                                                                    disabled={processing}
                                                                >
                                                                    Tolak transfer
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
                                            <p>{activity.user_name ?? 'System'}</p>
                                            <p>{activity.created_at ?? '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-2 font-medium">{value}</p>
            {helper && <p className="mt-1 text-sm text-muted-foreground">{helper}</p>}
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
            <span className={highlight ? 'font-medium' : 'text-muted-foreground'}>
                {label}
            </span>
            <span className={highlight ? 'font-semibold' : ''}>
                {formatCurrency(value)}
            </span>
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
