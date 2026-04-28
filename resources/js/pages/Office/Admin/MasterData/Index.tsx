import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

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
                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            Master data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                asChild
                                variant={
                                    activeTab === 'garment-models'
                                        ? 'default'
                                        : 'outline'
                                }
                            >
                                <Link href={office.admin.garmentModels.index()}>
                                    Model Pakaian
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant={
                                    activeTab === 'fabrics'
                                        ? 'default'
                                        : 'outline'
                                }
                            >
                                <Link href={office.admin.fabrics.index()}>
                                    Bahan
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant={
                                    activeTab === 'couriers'
                                        ? 'default'
                                        : 'outline'
                                }
                            >
                                <Link href={office.admin.couriers.index()}>
                                    Kurir
                                </Link>
                            </Button>
                        </div>

                        {activeTab === 'garment-models' && (
                            <TableShell
                                title="Model pakaian"
                                headers={[
                                    'Nama',
                                    'Base price',
                                    'Deskripsi',
                                    'Status',
                                    'Aksi',
                                ]}
                                createRow={
                                    can.manage ? (
                                        <tr className="bg-[#F8FAFF]">
                                            <td className="px-4 py-4">
                                                <form
                                                    {...office.admin.garmentModels.store.form()}
                                                    className="grid gap-3 md:grid-cols-[1.1fr_160px_1.2fr_auto_auto]"
                                                >
                                                    <input
                                                        name="name"
                                                        placeholder="Nama model"
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <input
                                                        name="base_price"
                                                        type="number"
                                                        placeholder="Base price"
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <textarea
                                                        name="description"
                                                        placeholder="Deskripsi"
                                                        className="min-h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                                                    />
                                                    <div className="rounded-md border border-slate-200 bg-white px-3">
                                                        <input
                                                            type="hidden"
                                                            name="is_active"
                                                            value="0"
                                                        />
                                                        <label className="flex h-10 items-center gap-2 text-sm text-slate-600">
                                                            <input
                                                                type="checkbox"
                                                                name="is_active"
                                                                value="1"
                                                                defaultChecked
                                                            />
                                                            Aktif
                                                        </label>
                                                    </div>
                                                    <Button type="submit">
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
                                            <div className="grid gap-2">
                                                <form
                                                    {...office.admin.garmentModels.update.form(
                                                        item.id,
                                                    )}
                                                    className="grid gap-3 md:grid-cols-[1.1fr_160px_1.2fr_auto_auto]"
                                                >
                                                    <input
                                                        name="name"
                                                        defaultValue={item.name}
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <input
                                                        name="base_price"
                                                        type="number"
                                                        defaultValue={item.base_price}
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <textarea
                                                        name="description"
                                                        defaultValue={
                                                            item.description ??
                                                            ''
                                                        }
                                                        className="min-h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                                                    />
                                                    <div className="rounded-md border border-slate-200 bg-white px-3">
                                                        <input
                                                            type="hidden"
                                                            name="is_active"
                                                            value="0"
                                                        />
                                                        <label className="flex h-10 items-center gap-2 text-sm text-slate-600">
                                                            <input
                                                                type="checkbox"
                                                                name="is_active"
                                                                value="1"
                                                                defaultChecked={
                                                                    item.is_active
                                                                }
                                                            />
                                                            Aktif
                                                        </label>
                                                    </div>
                                                    <Button type="submit">
                                                        Update
                                                    </Button>
                                                </form>
                                                <form
                                                    {...office.admin.garmentModels.destroy.form(
                                                        item.id,
                                                    )}
                                                >
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        className="border-red-200 text-red-700"
                                                    >
                                                        Nonaktifkan
                                                    </Button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            />
                        )}

                        {activeTab === 'fabrics' && (
                            <TableShell
                                title="Bahan"
                                headers={[
                                    'Nama',
                                    'Adjustment',
                                    'Deskripsi',
                                    'Status',
                                    'Aksi',
                                ]}
                                createRow={
                                    can.manage ? (
                                        <tr className="bg-[#F8FAFF]">
                                            <td className="px-4 py-4" colSpan={5}>
                                                <form
                                                    {...office.admin.fabrics.store.form()}
                                                    className="grid gap-3 md:grid-cols-[1.1fr_160px_1.2fr_auto_auto]"
                                                >
                                                    <input
                                                        name="name"
                                                        placeholder="Nama bahan"
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <input
                                                        name="price_adjustment"
                                                        type="number"
                                                        placeholder="Adjustment"
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <textarea
                                                        name="description"
                                                        placeholder="Deskripsi"
                                                        className="min-h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                                                    />
                                                    <div className="rounded-md border border-slate-200 bg-white px-3">
                                                        <input
                                                            type="hidden"
                                                            name="is_active"
                                                            value="0"
                                                        />
                                                        <label className="flex h-10 items-center gap-2 text-sm text-slate-600">
                                                            <input
                                                                type="checkbox"
                                                                name="is_active"
                                                                value="1"
                                                                defaultChecked
                                                            />
                                                            Aktif
                                                        </label>
                                                    </div>
                                                    <Button type="submit">
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
                                            <div className="grid gap-2">
                                                <form
                                                    {...office.admin.fabrics.update.form(
                                                        item.id,
                                                    )}
                                                    className="grid gap-3 md:grid-cols-[1.1fr_160px_1.2fr_auto_auto]"
                                                >
                                                    <input
                                                        name="name"
                                                        defaultValue={item.name}
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <input
                                                        name="price_adjustment"
                                                        type="number"
                                                        defaultValue={
                                                            item.price_adjustment
                                                        }
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <textarea
                                                        name="description"
                                                        defaultValue={
                                                            item.description ??
                                                            ''
                                                        }
                                                        className="min-h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                                                    />
                                                    <div className="rounded-md border border-slate-200 bg-white px-3">
                                                        <input
                                                            type="hidden"
                                                            name="is_active"
                                                            value="0"
                                                        />
                                                        <label className="flex h-10 items-center gap-2 text-sm text-slate-600">
                                                            <input
                                                                type="checkbox"
                                                                name="is_active"
                                                                value="1"
                                                                defaultChecked={
                                                                    item.is_active
                                                                }
                                                            />
                                                            Aktif
                                                        </label>
                                                    </div>
                                                    <Button type="submit">
                                                        Update
                                                    </Button>
                                                </form>
                                                <form
                                                    {...office.admin.fabrics.destroy.form(
                                                        item.id,
                                                    )}
                                                >
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        className="border-red-200 text-red-700"
                                                    >
                                                        Nonaktifkan
                                                    </Button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            />
                        )}

                        {activeTab === 'couriers' && (
                            <TableShell
                                title="Kurir"
                                headers={['Nama', 'Biaya jasa', 'Status', 'Aksi']}
                                createRow={
                                    can.manage ? (
                                        <tr className="bg-[#F8FAFF]">
                                            <td className="px-4 py-4" colSpan={4}>
                                                <form
                                                    {...office.admin.couriers.store.form()}
                                                    className="grid gap-3 md:grid-cols-[1.2fr_180px_auto_auto]"
                                                >
                                                    <input
                                                        name="name"
                                                        placeholder="Nama kurir"
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <input
                                                        name="base_fee"
                                                        type="number"
                                                        min="0"
                                                        placeholder="Biaya jasa"
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <div className="rounded-md border border-slate-200 bg-white px-3">
                                                        <input
                                                            type="hidden"
                                                            name="is_active"
                                                            value="0"
                                                        />
                                                        <label className="flex h-10 items-center gap-2 text-sm text-slate-600">
                                                            <input
                                                                type="checkbox"
                                                                name="is_active"
                                                                value="1"
                                                                defaultChecked
                                                            />
                                                            Aktif
                                                        </label>
                                                    </div>
                                                    <Button type="submit">
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
                                            <div className="grid gap-2">
                                                <form
                                                    {...office.admin.couriers.update.form(
                                                        item.id,
                                                    )}
                                                    className="grid gap-3 md:grid-cols-[1.2fr_180px_auto_auto]"
                                                >
                                                    <input
                                                        name="name"
                                                        defaultValue={item.name}
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <input
                                                        name="base_fee"
                                                        type="number"
                                                        min="0"
                                                        defaultValue={item.base_fee}
                                                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                                    />
                                                    <div className="rounded-md border border-slate-200 bg-white px-3">
                                                        <input
                                                            type="hidden"
                                                            name="is_active"
                                                            value="0"
                                                        />
                                                        <label className="flex h-10 items-center gap-2 text-sm text-slate-600">
                                                            <input
                                                                type="checkbox"
                                                                name="is_active"
                                                                value="1"
                                                                defaultChecked={
                                                                    item.is_active
                                                                }
                                                            />
                                                            Aktif
                                                        </label>
                                                    </div>
                                                    <Button type="submit">
                                                        Update
                                                    </Button>
                                                </form>
                                                <form
                                                    {...office.admin.couriers.destroy.form(
                                                        item.id,
                                                    )}
                                                >
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        className="border-red-200 text-red-700"
                                                    >
                                                        Nonaktifkan
                                                    </Button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            />
                        )}
                    </CardContent>
                </Card>
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
                <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
                <Badge variant="secondary">Inline editable</Badge>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                {headers.map((header) => (
                                    <th
                                        key={header}
                                        className="px-4 py-3 text-left font-semibold text-slate-600"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {createRow}
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
