import { Form, Head, Link } from '@inertiajs/react';
import { Ruler, ShoppingBag, History, User } from 'lucide-react';
import {
    index as customersIndex,
    show as showCustomer,
    update as updateCustomer,
} from '@/actions/App/Http/Controllers/Office/CustomerController';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
    store as storeMeasurement,
    update as updateMeasurement,
} from '@/actions/App/Http/Controllers/Office/MeasurementController';
import { show as showOrder } from '@/actions/App/Http/Controllers/Office/OrderController';
import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { EmptyState } from '@/components/office/empty-state';
import { PageHeader } from '@/components/office/page-header';
import { PremiumCard } from '@/components/office/premium-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

                <PageHeader
                    eyebrow="Detail Pelanggan"
                    title={customer.name}
                    description="Kelola data profil kontak, riwayat ukuran garmen, dan daftar pesanan pelanggan."
                    actions={
                        customer.is_loyalty_eligible && (
                            <Badge className="bg-brand-gold hover:bg-brand-gold/90 text-brand-ink rounded-full px-2.5 font-semibold text-xs border-0">
                                Loyalty Aktif
                            </Badge>
                        )
                    }
                />

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <PremiumCard>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-brand-ink">Profil Pelanggan</h3>
                            <p className="text-xs text-muted-foreground mt-1">Data kontak dan catatan operasional pelanggan.</p>
                        </div>
                        {can.update ? (
                            <Form
                                {...updateCustomer.form(customer.id)}
                                className="grid gap-4"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nama Lengkap</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                defaultValue={customer.name}
                                                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Nomor Telepon</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                defaultValue={customer.phone ?? ''}
                                                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                            />
                                            <InputError message={errors.phone} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="address">Alamat Lengkap</Label>
                                            <textarea
                                                id="address"
                                                name="address"
                                                defaultValue={customer.address ?? ''}
                                                className="min-h-24 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                            />
                                            <InputError message={errors.address} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Catatan Internal</Label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                defaultValue={customer.notes ?? ''}
                                                className="min-h-24 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                            />
                                            <InputError message={errors.notes} />
                                        </div>
                                        <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                                            <span className="text-xs text-brand-blue-deep font-semibold">
                                                Total Order Loyalitas: {customer.loyalty_order_count}
                                            </span>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-xl cursor-pointer bg-brand-blue text-white hover:bg-brand-blue-deep"
                                            >
                                                Simpan Perubahan
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        ) : (
                            <div className="space-y-4 text-sm text-brand-ink border-t border-border/40 pt-4 mt-2">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telepon</p>
                                    <p className="mt-1 font-medium">{customer.phone ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alamat</p>
                                    <p className="mt-1">{customer.address ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catatan</p>
                                    <p className="mt-1 text-muted-foreground">{customer.notes ?? 'Tidak ada catatan tambahan.'}</p>
                                </div>
                            </div>
                        )}
                    </PremiumCard>

                    <PremiumCard>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-brand-ink">Tambah Ukuran Baru</h3>
                            <p className="text-xs text-muted-foreground mt-1">Simpan snapshot ukuran badan pelanggan untuk order berikutnya.</p>
                        </div>
                        {can.manage_measurements ? (
                            <Form
                                {...storeMeasurement.form(customer.id)}
                                className="grid gap-4"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="label">Label Ukuran</Label>
                                            <Input
                                                id="label"
                                                name="label"
                                                placeholder="Contoh: Kemeja Kerja, Celana Jeans"
                                                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                            />
                                            <InputError message={errors.label} />
                                        </div>
                                        <MeasurementFields errors={errors} />
                                        <div className="flex justify-end border-t border-border/40 pt-4 mt-2">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-xl cursor-pointer bg-brand-blue text-white hover:bg-brand-blue-deep"
                                            >
                                                Simpan Ukuran
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-6 border-t border-border/40 mt-2">
                                Role Anda hanya diizinkan untuk melihat data ukuran.
                            </p>
                        )}
                    </PremiumCard>
                </div>

                <PremiumCard>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-brand-ink">Riwayat Ukuran</h3>
                        <p className="text-xs text-muted-foreground mt-1">Daftar ukuran garmen yang pernah disimpan untuk pelanggan ini.</p>
                    </div>
                    <div className="grid gap-4 border-t border-border/40 pt-4">
                        {customer.measurements.length === 0 ? (
                            <EmptyState
                                icon={Ruler}
                                title="Belum ada data ukuran"
                                description="Data ukuran badan pelanggan akan tersimpan di sini."
                            />
                        ) : (
                            customer.measurements.map((measurement) => (
                                <Form
                                    key={measurement.id}
                                    {...updateMeasurement.form([
                                        customer.id,
                                        measurement.id,
                                    ])}
                                    className="rounded-2xl border border-border/70 bg-brand-mist/30 p-5"
                                >
                                    {({ errors, processing }) => (
                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between border-b border-border/40 pb-3">
                                                <div>
                                                    <p className="font-semibold text-brand-ink">
                                                        {measurement.label ?? 'Ukuran tanpa label'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Dicatat pada {measurement.created_at ?? '-'}
                                                    </p>
                                                </div>
                                                {can.manage_measurements && (
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        disabled={processing}
                                                        className="rounded-xl cursor-pointer border-brand-blue text-brand-blue hover:bg-brand-blue/5"
                                                    >
                                                        Update
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                                <MeasurementInput
                                                    label="Chest"
                                                    name="chest"
                                                    defaultValue={measurement.chest}
                                                />
                                                <MeasurementInput
                                                    label="Waist"
                                                    name="waist"
                                                    defaultValue={measurement.waist}
                                                />
                                                <MeasurementInput
                                                    label="Hips"
                                                    name="hips"
                                                    defaultValue={measurement.hips}
                                                />
                                                <MeasurementInput
                                                    label="Shoulder"
                                                    name="shoulder"
                                                    defaultValue={measurement.shoulder}
                                                />
                                                <MeasurementInput
                                                    label="Sleeve"
                                                    name="sleeve_length"
                                                    defaultValue={measurement.sleeve_length}
                                                />
                                            </div>
                                            <div className="grid gap-2 mt-2">
                                                <Label htmlFor={`notes-${measurement.id}`}>
                                                    Catatan Ukuran
                                                </Label>
                                                <textarea
                                                    id={`notes-${measurement.id}`}
                                                    name="notes"
                                                    defaultValue={measurement.notes ?? ''}
                                                    className="min-h-20 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
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
                    </div>
                </PremiumCard>

                <PremiumCard>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-brand-ink">Riwayat Order</h3>
                        <p className="text-xs text-muted-foreground mt-1">Daftar semua transaksi dan pesanan yang dilakukan oleh pelanggan.</p>
                    </div>
                    <div className="grid gap-3 border-t border-border/40 pt-4">
                        {customer.orders.length === 0 ? (
                            <EmptyState
                                icon={ShoppingBag}
                                title="Belum ada transaksi"
                                description="Pelanggan ini belum memiliki riwayat order."
                            />
                        ) : (
                            customer.orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={showOrder(order.id)}
                                    className="flex items-center justify-between rounded-2xl border border-border bg-brand-mist/10 p-4 transition hover:border-brand-blue/40 hover:bg-brand-blue/5 cursor-pointer"
                                >
                                    <div>
                                        <p className="font-semibold text-brand-ink">
                                            {order.order_number}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Dibuat pada {order.created_at}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="secondary" className="rounded-full font-semibold">
                                            {order.status}
                                        </Badge>
                                        <p className="mt-1 text-sm font-semibold text-brand-ink">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </PremiumCard>
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
                    className="mt-2 min-h-24 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
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
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
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
