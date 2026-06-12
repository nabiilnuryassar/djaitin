import { Head, router } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

// Office Primitives
import { PageHeader } from '@/components/office/page-header';
import { FilterBar } from '@/components/office/filter-bar';
import { StatusBadge } from '@/components/office/status-badge';
import { EmptyState } from '@/components/office/empty-state';
import { PremiumCard } from '@/components/office/premium-card';

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
            shipping_cost: number;
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
    couriers: Array<{ id: number; name: string; base_fee: number }>;
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
            <Head title="Manajemen Pengiriman" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Operasional"
                    title="Manajemen Pengiriman"
                    description="Kelola pengiriman pesanan, atur kurir, input nomor resi, dan lacak status penerimaan."
                />

                <FilterBar>
                    <form
                        className="flex gap-3 w-full max-w-sm"
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
                                                formData.get('status') ||
                                                    '',
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
                            className="h-10 flex-1 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                        >
                            <option value="">Semua Status</option>
                            {statuses.map((status) => (
                                <option
                                    key={status.value}
                                    value={status.value}
                                >
                                    {status.label}
                                </option>
                            ))}
                        </select>
                        <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                            Filter
                        </Button>
                    </form>
                </FilterBar>

                <div className="space-y-4">
                    {shipments.data.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="Belum ada pengiriman"
                            description="Belum ada data pengiriman yang cocok dengan filter saat ini."
                        />
                    ) : (
                        shipments.data.map((shipment) => (
                            <PremiumCard
                                key={shipment.id}
                                className="transition hover:border-brand-blue/30"
                            >
                                <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-bold text-brand-ink text-base">
                                                {shipment.order.order_number ?? 'Pengiriman'}
                                            </p>
                                            <StatusBadge value={shipment.status} domain="shipment" />
                                        </div>
                                        <p className="text-sm font-semibold text-brand-ink">
                                            Pelanggan: {shipment.order.customer_name ?? 'Tanpa pelanggan'} · Penerima: {shipment.recipient_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            No. Telp: {shipment.recipient_phone ?? '-'} · Resi:{' '}
                                            <span className="font-mono font-medium text-brand-ink">
                                                {shipment.tracking_number ?? 'Belum ada resi'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Ongkos Kirim:{' '}
                                            <span className="font-semibold text-brand-ink">
                                                {formatCurrency(shipment.shipping_cost)}
                                            </span>
                                        </p>
                                        <div className="text-sm text-muted-foreground">
                                            <p className="font-semibold text-brand-ink mb-1">Alamat Penerima:</p>
                                            <p className="leading-6 bg-brand-mist/30 p-3 rounded-xl border border-border/50 text-brand-ink">
                                                {shipment.recipient_address}
                                            </p>
                                        </div>
                                    </div>

                                    {can.update ? (
                                        <form
                                            {...office.shipments.update.form(
                                                shipment.id,
                                            )}
                                            className="grid gap-2 border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-4 self-start"
                                        >
                                            <p className="text-sm font-semibold text-brand-ink mb-1">Update Pengiriman</p>
                                            <select
                                                name="courier_id"
                                                defaultValue={
                                                    shipment.courier_id ??
                                                    ''
                                                }
                                                className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink cursor-pointer"
                                            >
                                                <option value="">
                                                    Pilih Kurir
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
                                                            }{' '}
                                                            -{' '}
                                                            {formatCurrency(
                                                                courier.base_fee,
                                                            )}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <select
                                                name="status"
                                                defaultValue={
                                                    shipment.status
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
                                            <input
                                                name="tracking_number"
                                                defaultValue={
                                                    shipment.tracking_number ??
                                                    ''
                                                }
                                                placeholder="Nomor resi"
                                                className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                            />
                                            <textarea
                                                name="notes"
                                                defaultValue={
                                                    shipment.notes ?? ''
                                                }
                                                placeholder="Catatan pengiriman"
                                                className="min-h-20 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                            />
                                            <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                                                Simpan Update
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="space-y-2 text-sm border-t lg:border-t-0 lg:border-l border-border/70 pt-4 lg:pt-0 lg:pl-4 self-start">
                                            <p className="font-semibold text-brand-ink">Status Lacak:</p>
                                            <p className="text-muted-foreground">
                                                Kurir:{' '}
                                                <span className="font-medium text-brand-ink">{shipment.courier_name ?? '-'}</span>
                                            </p>
                                            <p className="text-muted-foreground">
                                                Dikirim:{' '}
                                                <span className="font-medium text-brand-ink">{shipment.shipped_at ?? '-'}</span>
                                            </p>
                                            <p className="text-muted-foreground">
                                                Diterima:{' '}
                                                <span className="font-medium text-brand-ink">{shipment.delivered_at ?? '-'}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </PremiumCard>
                        ))
                    )}
                </div>
            </div>
        </OfficeLayout>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
