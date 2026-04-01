import { Head, useForm } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
    createTailor,
    index as ordersIndex,
    storeTailor,
} from '@/actions/App/Http/Controllers/Office/OrderController';
import InputError from '@/components/input-error';
import { FlashMessage } from '@/components/flash-message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import OfficeLayout from '@/layouts/office-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    customers: Array<{
        id: number;
        name: string;
        phone: string | null;
        is_loyalty_eligible: boolean;
        loyalty_order_count: number;
        measurements: Array<{
            id: number;
            label: string;
        }>;
    }>;
    garmentModels: Array<{
        id: number;
        name: string;
        description: string | null;
    }>;
    fabrics: Array<{
        id: number;
        name: string;
        description: string | null;
    }>;
    discountPolicy: {
        percent: number;
        threshold: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Orders', href: ordersIndex() },
    { title: 'Tailor Wizard', href: createTailor() },
];

export default function TailorWizard({
    customers,
    garmentModels,
    fabrics,
    discountPolicy,
}: Props) {
    const form = useForm({
        customer_id: customers[0]?.id?.toString() ?? '',
        garment_model_id: garmentModels[0]?.id?.toString() ?? '',
        fabric_id: fabrics[0]?.id?.toString() ?? '',
        measurement_id: '',
        qty: '1',
        unit_price: '250000',
        due_date: '',
        spec_notes: '',
        payment_method: 'cash',
        payment_amount: '125000',
        payment_reference_number: '',
        payment_notes: '',
    });

    const selectedCustomer = customers.find(
        (customer) => customer.id.toString() === form.data.customer_id,
    );

    const selectedMeasurements = selectedCustomer?.measurements ?? [];
    const qty = Number(form.data.qty || 0);
    const unitPrice = Number(form.data.unit_price || 0);
    const subtotal = qty * unitPrice;
    const discount = selectedCustomer?.is_loyalty_eligible
        ? subtotal * (discountPolicy.percent / 100)
        : 0;
    const total = Math.max(subtotal - discount, 0);
    const dpRatio =
        total > 0 ? Number(form.data.payment_amount || 0) / total : 0;
    const errorMap = form.errors as Record<string, string | undefined>;

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            customer_id: Number(data.customer_id),
            garment_model_id: Number(data.garment_model_id),
            fabric_id: Number(data.fabric_id),
            measurement_id: data.measurement_id
                ? Number(data.measurement_id)
                : null,
            qty: Number(data.qty),
            unit_price: Number(data.unit_price),
            due_date: data.due_date || null,
            spec_notes: data.spec_notes || null,
            payment: {
                method: data.payment_method,
                amount: Number(data.payment_amount),
                reference_number: data.payment_reference_number || null,
                notes: data.payment_notes || null,
            },
        }));

        form.submit(storeTailor(), {
            preserveScroll: true,
        });
    };

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Tailor Wizard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                {selectedCustomer?.is_loyalty_eligible && (
                    <Alert className="border-primary/20 bg-primary/5">
                        <AlertTitle>Diskon loyalitas aktif</AlertTitle>
                        <AlertDescription>
                            Pelanggan ini memenuhi syarat loyalitas karena telah
                            menutup lebih dari {discountPolicy.threshold} order
                            tailor. Diskon {discountPolicy.percent}% akan
                            diterapkan otomatis.
                        </AlertDescription>
                    </Alert>
                )}

                <form
                    onSubmit={submit}
                    className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Form order tailor
                            </CardTitle>
                            <CardDescription>
                                Lengkapi pelanggan, model, bahan, dan DP awal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="customer_id">Pelanggan</Label>
                                <select
                                    id="customer_id"
                                    value={form.data.customer_id}
                                    onChange={(event) => {
                                        form.setData(
                                            'customer_id',
                                            event.target.value,
                                        );
                                        form.setData('measurement_id', '');
                                    }}
                                    className="h-10 rounded-md border bg-transparent px-3 text-sm"
                                >
                                    {customers.map((customer) => (
                                        <option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.customer_id} />
                            </div>

                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="garment_model_id">
                                        Model garmen
                                    </Label>
                                    <select
                                        id="garment_model_id"
                                        value={form.data.garment_model_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'garment_model_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
                                    >
                                        {garmentModels.map((garmentModel) => (
                                            <option
                                                key={garmentModel.id}
                                                value={garmentModel.id}
                                            >
                                                {garmentModel.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={form.errors.garment_model_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fabric_id">Bahan</Label>
                                    <select
                                        id="fabric_id"
                                        value={form.data.fabric_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'fabric_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
                                    >
                                        {fabrics.map((fabric) => (
                                            <option
                                                key={fabric.id}
                                                value={fabric.id}
                                            >
                                                {fabric.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={form.errors.fabric_id}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="measurement_id">
                                        Ukuran
                                    </Label>
                                    <select
                                        id="measurement_id"
                                        value={form.data.measurement_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'measurement_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
                                    >
                                        <option value="">Pilih ukuran</option>
                                        {selectedMeasurements.map(
                                            (measurement) => (
                                                <option
                                                    key={measurement.id}
                                                    value={measurement.id}
                                                >
                                                    {measurement.label}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <InputError
                                        message={form.errors.measurement_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qty">Qty</Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        min="1"
                                        value={form.data.qty}
                                        onChange={(event) =>
                                            form.setData(
                                                'qty',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.qty} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="unit_price">
                                        Harga satuan
                                    </Label>
                                    <Input
                                        id="unit_price"
                                        type="number"
                                        min="1"
                                        value={form.data.unit_price}
                                        onChange={(event) =>
                                            form.setData(
                                                'unit_price',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.unit_price}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="due_date">Target selesai</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={form.data.due_date}
                                    onChange={(event) =>
                                        form.setData(
                                            'due_date',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.due_date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="spec_notes">
                                    Catatan order
                                </Label>
                                <textarea
                                    id="spec_notes"
                                    value={form.data.spec_notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'spec_notes',
                                            event.target.value,
                                        )
                                    }
                                    className="min-h-28 rounded-md border bg-transparent px-3 py-2 text-sm"
                                />
                                <InputError message={form.errors.spec_notes} />
                            </div>

                            <div className="grid gap-2 border-t pt-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_method">
                                        Metode pembayaran
                                    </Label>
                                    <select
                                        id="payment_method"
                                        value={form.data.payment_method}
                                        onChange={(event) =>
                                            form.setData(
                                                'payment_method',
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="transfer">
                                            Transfer
                                        </option>
                                    </select>
                                    <InputError
                                        message={errorMap['payment.method']}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_amount">
                                        Nominal DP
                                    </Label>
                                    <Input
                                        id="payment_amount"
                                        type="number"
                                        min="1"
                                        value={form.data.payment_amount}
                                        onChange={(event) =>
                                            form.setData(
                                                'payment_amount',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errorMap['payment.amount']}
                                    />
                                </div>
                            </div>

                            {form.data.payment_method === 'transfer' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_reference_number">
                                        Nomor referensi transfer
                                    </Label>
                                    <Input
                                        id="payment_reference_number"
                                        value={
                                            form.data.payment_reference_number
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'payment_reference_number',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            errorMap['payment.reference_number']
                                        }
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan biaya</CardTitle>
                            <CardDescription>
                                Validasi DP minimal 50% akan berlaku saat order
                                dipindah ke status in progress.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <SummaryRow label="Subtotal" value={subtotal} />
                            <SummaryRow
                                label="Diskon loyalitas"
                                value={discount}
                            />
                            <SummaryRow label="Total" value={total} highlight />

                            <div className="rounded-xl bg-muted/60 p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Progress DP</span>
                                    <span>{Math.round(dpRatio * 100)}%</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-background">
                                    <div
                                        className="h-2 rounded-full bg-primary"
                                        style={{
                                            width: `${Math.min(
                                                Math.max(dpRatio * 100, 0),
                                                100,
                                            )}%`,
                                        }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {dpRatio >= 0.5
                                        ? 'DP sudah memenuhi threshold 50%.'
                                        : 'DP belum mencapai threshold 50% untuk memulai produksi.'}
                                </p>
                            </div>

                            {selectedCustomer && (
                                <div className="rounded-xl border p-4 text-sm">
                                    <p className="font-medium">
                                        {selectedCustomer.name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {selectedCustomer.phone ??
                                            'Telepon belum diisi'}
                                    </p>
                                    {selectedCustomer.is_loyalty_eligible && (
                                        <Badge className="mt-3">
                                            Loyalty aktif
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing || total <= 0}
                            >
                                Simpan order tailor
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </OfficeLayout>
    );
}

function SummaryRow({
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
            <span
                className={highlight ? 'text-lg font-semibold' : 'font-medium'}
            >
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
