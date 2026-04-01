import { Head, router } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

type Props = {
    filters: {
        status: string;
    };
    shipments: {
        data: Array<{
            id: number;
            status: string;
            tracking_number: string | null;
            recipient_name: string;
            recipient_phone: string | null;
            recipient_address: string;
            courier_id: number | null;
            courier_name: string | null;
            notes: string | null;
            shipped_at: string | null;
            delivered_at: string | null;
            order: {
                id: number | null;
                order_number: string | null;
                customer_name: string | null;
                status: string | null;
            };
        }>;
    };
    couriers: Array<{ id: number; name: string }>;
    statuses: Array<{ value: string; label: string }>;
    can: {
        update: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Pengiriman', href: office.shipping.index() },
];

export default function ShippingIndex({
    filters,
    shipments,
    couriers,
    statuses,
    can,
}: Props) {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Shipping" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            Shipping management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            className="flex gap-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const formData = new FormData(
                                    event.currentTarget,
                                );
                                router.get(
                                    office.shipping.index.url({
                                        query: {
                                            status:
                                                String(
                                                    formData.get('status') || '',
                                                ) || null,
                                        },
                                    }),
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            <select
                                name="status"
                                defaultValue={filters.status}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                            >
                                <option value="">Semua status</option>
                                {statuses.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                            <Button type="submit">Filter</Button>
                        </form>

                        <div className="space-y-3">
                            {shipments.data.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                                    Belum ada data shipment.
                                </div>
                            ) : (
                                shipments.data.map((shipment) => (
                                    <div
                                        key={shipment.id}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-4"
                                    >
                                        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold text-[#0F172A]">
                                                        {shipment.order
                                                            .order_number ??
                                                            'Shipment'}
                                                    </p>
                                                    <Badge variant="secondary">
                                                        {formatLabel(
                                                            shipment.status,
                                                        )}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    {shipment.order
                                                        .customer_name ??
                                                        'Tanpa pelanggan'}{' '}
                                                    • {shipment.recipient_name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {shipment.recipient_phone ??
                                                        '-'}{' '}
                                                    •{' '}
                                                    {shipment.tracking_number ??
                                                        'Belum ada resi'}
                                                </p>
                                                <p className="text-sm leading-6 text-slate-500">
                                                    {shipment.recipient_address}
                                                </p>
                                            </div>

                                            {can.update ? (
                                                <form
                                                    {...office.shipments.update.form(
                                                        shipment.id,
                                                    )}
                                                    className="grid gap-2"
                                                >
                                                    <select
                                                        name="courier_id"
                                                        defaultValue={
                                                            shipment.courier_id ??
                                                            ''
                                                        }
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                                                    >
                                                        <option value="">
                                                            Pilih kurir
                                                        </option>
                                                        {couriers.map(
                                                            (courier) => (
                                                                <option
                                                                    key={
                                                                        courier.id
                                                                    }
                                                                    value={
                                                                        courier.id
                                                                    }
                                                                >
                                                                    {
                                                                        courier.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <select
                                                        name="status"
                                                        defaultValue={
                                                            shipment.status
                                                        }
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
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
                                                    <input
                                                        name="tracking_number"
                                                        defaultValue={
                                                            shipment.tracking_number ??
                                                            ''
                                                        }
                                                        placeholder="Nomor resi"
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                                                    />
                                                    <textarea
                                                        name="notes"
                                                        defaultValue={
                                                            shipment.notes ?? ''
                                                        }
                                                        placeholder="Catatan pengiriman"
                                                        className="min-h-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                                    />
                                                    <Button type="submit">
                                                        Simpan update
                                                    </Button>
                                                </form>
                                            ) : (
                                                <div className="space-y-2 text-sm text-slate-500">
                                                    <p>
                                                        Kurir:{' '}
                                                        {shipment.courier_name ??
                                                            '-'}
                                                    </p>
                                                    <p>
                                                        Dikirim:{' '}
                                                        {shipment.shipped_at ??
                                                            '-'}
                                                    </p>
                                                    <p>
                                                        Diterima:{' '}
                                                        {shipment.delivered_at ??
                                                            '-'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}

function formatLabel(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
