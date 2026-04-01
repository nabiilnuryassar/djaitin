import { Form, Head, Link } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { show as showOrder } from '@/actions/App/Http/Controllers/Office/OrderController';
import {
    index as customersIndex,
    show as showCustomer,
    update as updateCustomer,
} from '@/actions/App/Http/Controllers/Office/CustomerController';
import {
    store as storeMeasurement,
    update as updateMeasurement,
} from '@/actions/App/Http/Controllers/Office/MeasurementController';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OfficeLayout from '@/layouts/office-layout';
import type { BreadcrumbItem } from '@/types';

type Measurement = {
    id: number;
    label: string | null;
    chest: string | null;
    waist: string | null;
    hips: string | null;
    shoulder: string | null;
    sleeve_length: string | null;
    shirt_length: string | null;
    inseam: string | null;
    trouser_waist: string | null;
    notes: string | null;
    created_at: string | null;
};

type Props = {
    customer: {
        id: number;
        name: string;
        phone: string | null;
        address: string | null;
        notes: string | null;
        is_loyalty_eligible: boolean;
        loyalty_order_count: number;
        measurements: Measurement[];
        orders: Array<{
            id: number;
            order_number: string;
            status: string;
            total_amount: number;
            created_at: string;
        }>;
    };
    can: {
        update: boolean;
        manage_measurements: boolean;
    };
};

export default function CustomersShow({ customer, can }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: DashboardController() },
        { title: 'Pelanggan', href: customersIndex() },
        { title: customer.name, href: showCustomer(customer.id) },
    ];

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title={customer.name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                    {customer.name}
                                </CardTitle>
                                {customer.is_loyalty_eligible && (
                                    <Badge>Loyal</Badge>
                                )}
                            </div>
                            <CardDescription>
                                Kelola profil pelanggan dan data kontak.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {can.update ? (
                                <Form
                                    {...updateCustomer.form(customer.id)}
                                    className="grid gap-4"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">
                                                    Nama
                                                </Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    defaultValue={customer.name}
                                                />
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="phone">
                                                    Telepon
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    defaultValue={
                                                        customer.phone ?? ''
                                                    }
                                                />
                                                <InputError
                                                    message={errors.phone}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="address">
                                                    Alamat
                                                </Label>
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    defaultValue={
                                                        customer.address ?? ''
                                                    }
                                                    className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm"
                                                />
                                                <InputError
                                                    message={errors.address}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="notes">
                                                    Catatan
                                                </Label>
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    defaultValue={
                                                        customer.notes ?? ''
                                                    }
                                                    className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm"
                                                />
                                                <InputError
                                                    message={errors.notes}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>
                                                    Loyalty count:{' '}
                                                    {
                                                        customer.loyalty_order_count
                                                    }
                                                </span>
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    Simpan perubahan
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            ) : (
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>
                                        {customer.phone ??
                                            'Telepon belum diisi'}
                                    </p>
                                    <p>
                                        {customer.address ??
                                            'Alamat belum diisi'}
                                    </p>
                                    <p>
                                        {customer.notes ??
                                            'Tidak ada catatan tambahan.'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah ukuran baru</CardTitle>
                            <CardDescription>
                                Simpan snapshot ukuran pelanggan untuk order
                                berikutnya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {can.manage_measurements ? (
                                <Form
                                    {...storeMeasurement.form(customer.id)}
                                    className="grid gap-4"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="label">
                                                    Label ukuran
                                                </Label>
                                                <Input
                                                    id="label"
                                                    name="label"
                                                />
                                                <InputError
                                                    message={errors.label}
                                                />
                                            </div>
                                            <MeasurementFields
                                                errors={errors}
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    Simpan ukuran
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Role Anda hanya bisa melihat data ukuran.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat ukuran</CardTitle>
                        <CardDescription>
                            Update snapshot ukuran bila ada revisi fitting
                            terbaru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {customer.measurements.length === 0 ? (
                            <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                Belum ada data ukuran.
                            </div>
                        ) : (
                            customer.measurements.map((measurement) => (
                                <Form
                                    key={measurement.id}
                                    {...updateMeasurement.form([
                                        customer.id,
                                        measurement.id,
                                    ])}
                                    className="rounded-xl border p-4"
                                >
                                    {({ errors, processing }) => (
                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {measurement.label ??
                                                            'Ukuran tanpa label'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Dicatat{' '}
                                                        {measurement.created_at ??
                                                            '-'}
                                                    </p>
                                                </div>
                                                {can.manage_measurements && (
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        disabled={processing}
                                                    >
                                                        Update
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                                <MeasurementInput
                                                    label="Chest"
                                                    name="chest"
                                                    defaultValue={
                                                        measurement.chest
                                                    }
                                                />
                                                <MeasurementInput
                                                    label="Waist"
                                                    name="waist"
                                                    defaultValue={
                                                        measurement.waist
                                                    }
                                                />
                                                <MeasurementInput
                                                    label="Hips"
                                                    name="hips"
                                                    defaultValue={
                                                        measurement.hips
                                                    }
                                                />
                                                <MeasurementInput
                                                    label="Shoulder"
                                                    name="shoulder"
                                                    defaultValue={
                                                        measurement.shoulder
                                                    }
                                                />
                                                <MeasurementInput
                                                    label="Sleeve"
                                                    name="sleeve_length"
                                                    defaultValue={
                                                        measurement.sleeve_length
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`notes-${measurement.id}`}
                                                >
                                                    Catatan
                                                </Label>
                                                <textarea
                                                    id={`notes-${measurement.id}`}
                                                    name="notes"
                                                    defaultValue={
                                                        measurement.notes ?? ''
                                                    }
                                                    className="min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm"
                                                />
                                                <InputError
                                                    message={
                                                        errors.notes ??
                                                        errors.label ??
                                                        errors.chest
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Form>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat order</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {customer.orders.length === 0 ? (
                            <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                Pelanggan ini belum memiliki order.
                            </div>
                        ) : (
                            customer.orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={showOrder(order.id)}
                                    className="flex items-center justify-between rounded-xl border p-4 transition hover:border-primary/40"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {order.order_number}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.created_at}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="secondary">
                                            {order.status}
                                        </Badge>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}

function MeasurementFields({ errors }: { errors: Record<string, string> }) {
    return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <MeasurementInput label="Chest" name="chest" />
            <MeasurementInput label="Waist" name="waist" />
            <MeasurementInput label="Hips" name="hips" />
            <MeasurementInput label="Shoulder" name="shoulder" />
            <MeasurementInput label="Sleeve" name="sleeve_length" />
            <MeasurementInput label="Shirt" name="shirt_length" />
            <MeasurementInput label="Inseam" name="inseam" />
            <MeasurementInput label="Trouser Waist" name="trouser_waist" />
            <div className="md:col-span-2 xl:col-span-2">
                <Label htmlFor="notes">Catatan ukuran</Label>
                <textarea
                    id="notes"
                    name="notes"
                    className="mt-2 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                />
                <InputError message={errors.notes} />
            </div>
        </div>
    );
}

function MeasurementInput({
    label,
    name,
    defaultValue,
}: {
    label: string;
    name: string;
    defaultValue?: string | null;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type="number"
                step="0.01"
                defaultValue={defaultValue ?? ''}
            />
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
