import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

// Office Primitives
import { PageHeader } from '@/components/office/page-header';
import { SegmentedTabs } from '@/components/office/segmented-tabs';
import { PremiumCard } from '@/components/office/premium-card';
import { DataTable, DataTableHead, DataTableBody, DataTableCell, DataTableHeaderCell } from '@/components/office/data-table';
import { StatusBadge } from '@/components/office/status-badge';

type BaseItem = {
    id: number;
    name: string;
    is_active: boolean;
};

type GarmentModel = BaseItem & {
    description: string | null;
    image_path: string | null;
    base_price: number;
};

type Fabric = BaseItem & {
    description: string | null;
    price_adjustment: number;
};

type Courier = BaseItem & {
    base_fee: number;
};

type Props = {
    activeTab: 'garment-models' | 'fabrics' | 'couriers';
    garmentModels: GarmentModel[];
    fabrics: Fabric[];
    couriers: Courier[];
    can: {
        manage: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Master Data', href: office.admin.garmentModels.index() },
];

export default function MasterDataIndex({
    activeTab,
    garmentModels,
    fabrics,
    couriers,
    can,
}: Props) {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Data" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Admin"
                    title="Master Data"
                    description="Kelola data referensi seperti model pakaian, pilihan bahan kain, dan tarif kurir pengiriman secara inline."
                />

                <div className="mb-2">
                    <SegmentedTabs
                        items={[
                            { value: 'garment-models', label: 'Model Pakaian' },
                            { value: 'fabrics', label: 'Bahan Kain' },
                            { value: 'couriers', label: 'Kurir Pengiriman' },
                        ]}
                        value={activeTab}
                        onChange={(val) => {
                            if (val === 'garment-models') {
                                router.get(office.admin.garmentModels.index());
                            } else if (val === 'fabrics') {
                                router.get(office.admin.fabrics.index());
                            } else if (val === 'couriers') {
                                router.get(office.admin.couriers.index());
                            }
                        }}
                    />
                </div>

                <PremiumCard>
                    {activeTab === 'garment-models' && (
                        <TableShell
                            title="Daftar Model Pakaian"
                            headers={[
                                'Model Pakaian',
                                'Harga Dasar',
                                'Deskripsi',
                                'Status',
                                'Aksi',
                            ]}
                            createRow={
                                can.manage ? (
                                    <tr className="bg-brand-mist/20">
                                        <td className="px-4 py-4" colSpan={5}>
                                            <form
                                                {...office.admin.garmentModels.store.form()}
                                                className="grid gap-3 md:grid-cols-[1.1fr_160px_1.2fr_auto_auto]"
                                            >
                                                <input
                                                    name="name"
                                                    placeholder="Nama model baru"
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <input
                                                    name="base_price"
                                                    type="number"
                                                    placeholder="Harga dasar"
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <textarea
                                                    name="description"
                                                    placeholder="Deskripsi model..."
                                                    className="min-h-10 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                                />
                                                <div className="rounded-xl border border-border bg-white px-3 flex items-center h-10 select-none">
                                                    <input
                                                        type="hidden"
                                                        name="is_active"
                                                        value="0"
                                                    />
                                                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="is_active"
                                                            value="1"
                                                            defaultChecked
                                                            className="rounded border-border text-brand-blue cursor-pointer"
                                                        />
                                                        Aktif
                                                    </label>
                                                </div>
                                                <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                                                    Simpan
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ) : null
                            }
                            rows={garmentModels.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-4" colSpan={5}>
                                        <div className="flex flex-col gap-3">
                                            <form
                                                {...office.admin.garmentModels.update.form(
                                                    item.id,
                                                )}
                                                className="grid gap-3 md:grid-cols-[1.1fr_160px_1.2fr_auto_auto] items-start"
                                            >
                                                <input
                                                    name="name"
                                                    defaultValue={item.name}
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <input
                                                    name="base_price"
                                                    type="number"
                                                    defaultValue={
                                                        item.base_price
                                                    }
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <textarea
                                                    name="description"
                                                    defaultValue={
                                                        item.description ??
                                                        ''
                                                    }
                                                    className="min-h-10 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                                />
                                                <div className="rounded-xl border border-border bg-white px-3 flex items-center h-10 select-none">
                                                    <input
                                                        type="hidden"
                                                        name="is_active"
                                                        value="0"
                                                    />
                                                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="is_active"
                                                            value="1"
                                                            defaultChecked={
                                                                item.is_active
                                                            }
                                                            className="rounded border-border text-brand-blue cursor-pointer"
                                                        />
                                                        Aktif
                                                    </label>
                                                </div>
                                                <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                                                    Update
                                                </Button>
                                            </form>
                                            {can.manage && (
                                                <div className="flex justify-end pr-1">
                                                    <form
                                                        {...office.admin.garmentModels.destroy.form(
                                                            item.id,
                                                        )}
                                                    >
                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            className="border-red-200 text-red-700 rounded-xl hover:bg-red-50 cursor-pointer text-xs h-8"
                                                        >
                                                            Nonaktifkan
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        />
                    )}

                    {activeTab === 'fabrics' && (
                        <TableShell
                            title="Daftar Bahan Kain"
                            headers={[
                                'Nama Bahan',
                                'Penyesuaian Harga',
                                'Deskripsi',
                                'Status',
                                'Aksi',
                            ]}
                            createRow={
                                can.manage ? (
                                    <tr className="bg-brand-mist/20">
                                        <td
                                            className="px-4 py-4"
                                            colSpan={5}
                                        >
                                            <form
                                                {...office.admin.fabrics.store.form()}
                                                className="grid gap-3 md:grid-cols-[1.1fr_160px_1.2fr_auto_auto]"
                                            >
                                                <input
                                                    name="name"
                                                    placeholder="Nama bahan baru"
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <input
                                                    name="price_adjustment"
                                                    type="number"
                                                    placeholder="Penyesuaian harga"
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <textarea
                                                    name="description"
                                                    placeholder="Deskripsi bahan..."
                                                    className="min-h-10 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                                />
                                                <div className="rounded-xl border border-border bg-white px-3 flex items-center h-10 select-none">
                                                    <input
                                                        type="hidden"
                                                        name="is_active"
                                                        value="0"
                                                    />
                                                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="is_active"
                                                            value="1"
                                                            defaultChecked
                                                            className="rounded border-border text-brand-blue cursor-pointer"
                                                        />
                                                        Aktif
                                                    </label>
                                                </div>
                                                <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                                                    Simpan
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ) : null
                            }
                            rows={fabrics.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-4" colSpan={5}>
                                        <div className="flex flex-col gap-3">
                                            <form
                                                {...office.admin.fabrics.update.form(
                                                    item.id,
                                                )}
                                                className="grid gap-3 md:grid-cols-[1.1fr_160px_1.2fr_auto_auto] items-start"
                                            >
                                                <input
                                                    name="name"
                                                    defaultValue={item.name}
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <input
                                                    name="price_adjustment"
                                                    type="number"
                                                    defaultValue={
                                                        item.price_adjustment
                                                    }
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <textarea
                                                    name="description"
                                                    defaultValue={
                                                        item.description ??
                                                        ''
                                                    }
                                                    className="min-h-10 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                                />
                                                <div className="rounded-xl border border-border bg-white px-3 flex items-center h-10 select-none">
                                                    <input
                                                        type="hidden"
                                                        name="is_active"
                                                        value="0"
                                                    />
                                                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="is_active"
                                                            value="1"
                                                            defaultChecked={
                                                                item.is_active
                                                            }
                                                            className="rounded border-border text-brand-blue cursor-pointer"
                                                        />
                                                        Aktif
                                                    </label>
                                                </div>
                                                <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                                                    Update
                                                </Button>
                                            </form>
                                            {can.manage && (
                                                <div className="flex justify-end pr-1">
                                                    <form
                                                        {...office.admin.fabrics.destroy.form(
                                                            item.id,
                                                        )}
                                                    >
                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            className="border-red-200 text-red-700 rounded-xl hover:bg-red-50 cursor-pointer text-xs h-8"
                                                        >
                                                            Nonaktifkan
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        />
                    )}

                    {activeTab === 'couriers' && (
                        <TableShell
                            title="Daftar Kurir Pengiriman"
                            headers={[
                                'Nama Kurir',
                                'Biaya Jasa Dasar',
                                'Status',
                                'Aksi',
                            ]}
                            createRow={
                                can.manage ? (
                                    <tr className="bg-brand-mist/20">
                                        <td
                                            className="px-4 py-4"
                                            colSpan={4}
                                        >
                                            <form
                                                {...office.admin.couriers.store.form()}
                                                className="grid gap-3 md:grid-cols-[1.2fr_180px_auto_auto]"
                                            >
                                                <input
                                                    name="name"
                                                    placeholder="Nama kurir baru"
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <input
                                                    name="base_fee"
                                                    type="number"
                                                    min="0"
                                                    placeholder="Biaya jasa dasar"
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <div className="rounded-xl border border-border bg-white px-3 flex items-center h-10 select-none">
                                                    <input
                                                        type="hidden"
                                                        name="is_active"
                                                        value="0"
                                                    />
                                                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="is_active"
                                                            value="1"
                                                            defaultChecked
                                                            className="rounded border-border text-brand-blue cursor-pointer"
                                                        />
                                                        Aktif
                                                    </label>
                                                </div>
                                                <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                                                    Simpan
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ) : null
                            }
                            rows={couriers.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-4" colSpan={4}>
                                        <div className="flex flex-col gap-3">
                                            <form
                                                {...office.admin.couriers.update.form(
                                                    item.id,
                                                )}
                                                className="grid gap-3 md:grid-cols-[1.2fr_180px_auto_auto] items-start"
                                            >
                                                <input
                                                    name="name"
                                                    defaultValue={item.name}
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <input
                                                    name="base_fee"
                                                    type="number"
                                                    min="0"
                                                    defaultValue={
                                                        item.base_fee
                                                    }
                                                    className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                                                />
                                                <div className="rounded-xl border border-border bg-white px-3 flex items-center h-10 select-none">
                                                    <input
                                                        type="hidden"
                                                        name="is_active"
                                                        value="0"
                                                    />
                                                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="is_active"
                                                            value="1"
                                                            defaultChecked={
                                                                item.is_active
                                                            }
                                                            className="rounded border-border text-brand-blue cursor-pointer"
                                                        />
                                                        Aktif
                                                    </label>
                                                </div>
                                                <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                                                    Update
                                                </Button>
                                            </form>
                                            {can.manage && (
                                                <div className="flex justify-end pr-1">
                                                    <form
                                                        {...office.admin.couriers.destroy.form(
                                                            item.id,
                                                        )}
                                                    >
                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            className="border-red-200 text-red-700 rounded-xl hover:bg-red-50 cursor-pointer text-xs h-8"
                                                        >
                                                            Nonaktifkan
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        />
                    )}
                </PremiumCard>
            </div>
        </OfficeLayout>
    );
}

function TableShell({
    title,
    headers,
    createRow,
    rows,
}: {
    title: string;
    headers: string[];
    createRow: ReactNode;
    rows: ReactNode[];
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-base font-bold text-brand-ink">{title}</p>
                <Badge variant="outline" className="rounded-full bg-brand-mist/50 border-border text-brand-ink">
                    Edit Inline
                </Badge>
            </div>
            <DataTable>
                <DataTableHead>
                    <tr>
                        {headers.map((header) => (
                            <DataTableHeaderCell key={header}>
                                {header}
                            </DataTableHeaderCell>
                        ))}
                    </tr>
                </DataTableHead>
                <DataTableBody>
                    {createRow}
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={headers.length} className="px-4 py-8 text-center text-muted-foreground">
                                Belum ada data referensi.
                            </td>
                        </tr>
                    ) : (
                        rows
                    )}
                </DataTableBody>
            </DataTable>
        </div>
    );
}
