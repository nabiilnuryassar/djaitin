import { Head, Link, router } from '@inertiajs/react';
import { ImageIcon, Inbox } from 'lucide-react';
import { useState } from 'react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { DataTable, DataTableHead, DataTableBody, DataTableCell, DataTableHeaderCell } from '@/components/office/data-table';
import { EmptyState } from '@/components/office/empty-state';
import { FilterBar } from '@/components/office/filter-bar';
import { PageHeader } from '@/components/office/page-header';
import { OfficePagination } from '@/components/office/pagination';
import { StatusBadge } from '@/components/office/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import OfficeLayout from '@/layouts/office-layout';
import { cn } from '@/lib/utils';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

// Office Primitives

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ProductRow = {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    category: string;
    size: string;
    stock: number;
    base_price: number;
    selling_price: number;
    discount_amount: number;
    discount_percent: number;
    final_price: number;
    is_clearance: boolean;
    image_path: string | null;
    is_active: boolean;
};

type ProductSheetState =
    | { mode: 'create' }
    | { mode: 'edit'; product: ProductRow }
    | null;

type Props = {
    filters: {
        search: string;
        low_stock: boolean;
        clearance: boolean;
    };
    products: {
        data: ProductRow[];
        links: PaginationLink[];
    };
    can: {
        create: boolean;
        update: boolean;
        delete: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Admin Produk', href: office.admin.products.index() },
];

export default function AdminProductsIndex({ filters, products, can }: Props) {
    const [sheetState, setSheetState] = useState<ProductSheetState>(null);

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Produk" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Admin"
                    title="Manajemen Produk"
                    description="Pantau stok produk, status clearance, dan update harga produk ready-to-wear."
                    actions={
                        can.create ? (
                            <Button
                                type="button"
                                className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer"
                                onClick={() =>
                                    setSheetState({ mode: 'create' })
                                }
                            >
                                Tambah Produk
                            </Button>
                        ) : null
                    }
                />

                <FilterBar>
                    <form
                        className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 w-full"
                        onSubmit={(event) => {
                            event.preventDefault();
                            const formData = new FormData(
                                event.currentTarget,
                            );

                            router.get(
                                office.admin.products.index.url({
                                    query: {
                                        search:
                                            String(
                                                formData.get('search') ||
                                                    '',
                                            ) || null,
                                        low_stock: formData.get('low_stock')
                                            ? '1'
                                            : null,
                                        clearance: formData.get('clearance')
                                            ? '1'
                                            : null,
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
                        <input
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Cari SKU / nama"
                            className="h-10 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                        />
                        <label className="flex items-center gap-2 rounded-xl border border-border px-3 text-sm text-muted-foreground bg-white cursor-pointer h-10 select-none">
                            <input
                                type="checkbox"
                                name="low_stock"
                                defaultChecked={filters.low_stock}
                                className="rounded border-border text-brand-blue cursor-pointer"
                            />
                            Stok Rendah
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-border px-3 text-sm text-muted-foreground bg-white cursor-pointer h-10 select-none">
                            <input
                                type="checkbox"
                                name="clearance"
                                defaultChecked={filters.clearance}
                                className="rounded border-border text-brand-blue cursor-pointer"
                            />
                            Clearance
                        </label>
                        <Button type="submit" className="rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                            Filter
                        </Button>
                    </form>
                </FilterBar>

                {products.data.length === 0 ? (
                    <EmptyState
                        icon={Inbox}
                        title="Tidak ada produk"
                        description="Tidak ada produk yang cocok dengan filter saat ini."
                    />
                ) : (
                    <div>
                        <DataTable>
                            <DataTableHead>
                                <tr>
                                    <DataTableHeaderCell>Produk</DataTableHeaderCell>
                                    <DataTableHeaderCell>SKU</DataTableHeaderCell>
                                    <DataTableHeaderCell>Ukuran</DataTableHeaderCell>
                                    <DataTableHeaderCell>Stok</DataTableHeaderCell>
                                    <DataTableHeaderCell>Harga</DataTableHeaderCell>
                                    <DataTableHeaderCell className="text-right">Aksi</DataTableHeaderCell>
                                </tr>
                            </DataTableHead>
                            <DataTableBody>
                                {products.data.map((product) => (
                                    <tr key={product.id}>
                                        <DataTableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-mist border border-border/55 text-brand-blue">
                                                    {product.image_path ? (
                                                        <img
                                                            src={
                                                                product.image_path
                                                            }
                                                            alt={
                                                                product.name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="size-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-brand-ink text-sm">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {product.category}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                                                        {product.is_clearance ? (
                                                            <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 text-[10px] py-0 px-2 rounded-full">
                                                                Clearance
                                                            </Badge>
                                                        ) : null}
                                                        <StatusBadge value={product.is_active ? 'active' : 'inactive'} />
                                                    </div>
                                                </div>
                                            </div>
                                        </DataTableCell>
                                        <DataTableCell className="text-muted-foreground font-mono text-xs">
                                            {product.sku}
                                        </DataTableCell>
                                        <DataTableCell className="text-muted-foreground font-medium">
                                            {product.size}
                                        </DataTableCell>
                                        <DataTableCell>
                                            <Badge
                                                className={cn(
                                                    'rounded-full border-none font-semibold text-xs',
                                                    product.stock <= 5
                                                        ? 'bg-red-50 text-red-700'
                                                        : 'bg-emerald-50 text-emerald-700'
                                                )}
                                            >
                                                Stok {product.stock}
                                            </Badge>
                                        </DataTableCell>
                                        <DataTableCell>
                                            <p className="font-semibold text-brand-ink text-sm">
                                                {formatCurrency(
                                                    product.final_price,
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Jual:{' '}
                                                {formatCurrency(
                                                    product.selling_price,
                                                )}
                                            </p>
                                        </DataTableCell>
                                        <DataTableCell>
                                            <div className="flex justify-end gap-2">
                                                {can.update ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="rounded-xl cursor-pointer"
                                                        onClick={() =>
                                                            setSheetState(
                                                                {
                                                                    mode: 'edit',
                                                                    product,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                ) : null}
                                                {can.delete && product.is_active ? (
                                                    <form
                                                        {...office.admin.products.destroy.form(
                                                            product.id,
                                                        )}
                                                    >
                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            className="border-red-200 text-red-700 rounded-xl cursor-pointer hover:bg-red-50"
                                                        >
                                                            Nonaktifkan
                                                        </Button>
                                                    </form>
                                                ) : null}
                                            </div>
                                        </DataTableCell>
                                    </tr>
                                ))}
                            </DataTableBody>
                        </DataTable>

                        <OfficePagination links={products.links} />
                    </div>
                )}
            </div>

            <Sheet
                open={sheetState !== null}
                onOpenChange={(open) => !open && setSheetState(null)}
            >
                <SheetContent className="w-full overflow-y-auto border-l border-border bg-brand-mist/50 sm:max-w-2xl">
                    <SheetHeader className="border-b border-border/70 pb-4 text-left">
                        <SheetTitle className="text-xl font-bold text-brand-ink">
                            {sheetState?.mode === 'edit'
                                ? 'Edit Produk RTW'
                                : 'Tambah Produk RTW Baru'}
                        </SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                            {sheetState?.mode === 'edit'
                                ? 'Perbarui data stok, harga, clearance, dan status produk langsung dari panel.'
                                : 'Masukkan SKU, harga, dan stok untuk produk ready-to-wear baru.'}
                        </SheetDescription>
                    </SheetHeader>

                    {sheetState ? (
                        <ProductSheetForm
                            key={
                                sheetState.mode === 'edit'
                                    ? `edit-${sheetState.product.id}`
                                    : 'create'
                            }
                            sheetState={sheetState}
                        />
                    ) : null}
                </SheetContent>
            </Sheet>
        </OfficeLayout>
    );
}

function ProductSheetForm({
    sheetState,
}: {
    sheetState: Exclude<ProductSheetState, null>;
}) {
    const product = sheetState.mode === 'edit' ? sheetState.product : null;

    return (
        <form
            {...(sheetState.mode === 'edit'
                ? office.admin.products.update.form(sheetState.product.id)
                : office.admin.products.store.form())}
            className="flex h-full flex-col"
        >
            <div className="grid gap-4 py-6 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    SKU
                    <input
                        name="sku"
                        defaultValue={product?.sku ?? ''}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Nama Produk
                    <input
                        name="name"
                        defaultValue={product?.name ?? ''}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Kategori
                    <input
                        name="category"
                        defaultValue={product?.category ?? ''}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Ukuran
                    <input
                        name="size"
                        defaultValue={product?.size ?? ''}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Base Price (Harga Dasar)
                    <input
                        name="base_price"
                        type="number"
                        defaultValue={product?.base_price ?? ''}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Selling Price (Harga Jual)
                    <input
                        name="selling_price"
                        type="number"
                        defaultValue={product?.selling_price ?? ''}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Diskon Nominal
                    <input
                        name="discount_amount"
                        type="number"
                        defaultValue={product?.discount_amount ?? 0}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Diskon Persen
                    <input
                        name="discount_percent"
                        type="number"
                        defaultValue={product?.discount_percent ?? 0}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Stok
                    <input
                        name="stock"
                        type="number"
                        defaultValue={product?.stock ?? ''}
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Gambar (URL/Path)
                    <input
                        name="image_path"
                        defaultValue={product?.image_path ?? ''}
                        placeholder="/storage/products/sku-001.jpg"
                        className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-ink"
                    />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-ink md:col-span-2">
                    Deskripsi
                    <textarea
                        name="description"
                        defaultValue={product?.description ?? ''}
                        className="min-h-28 rounded-xl border border-border bg-white px-3 py-3 text-sm text-brand-ink"
                    />
                </label>
                <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-white px-4 py-3">
                        <input type="hidden" name="is_clearance" value="0" />
                        <label className="flex items-center gap-3 text-sm font-semibold text-brand-ink cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_clearance"
                                value="1"
                                defaultChecked={product?.is_clearance ?? false}
                                className="rounded border-border text-brand-blue cursor-pointer"
                            />
                            Produk Clearance
                        </label>
                    </div>
                    <div className="rounded-xl border border-border bg-white px-4 py-3">
                        <input type="hidden" name="is_active" value="0" />
                        <label className="flex items-center gap-3 text-sm font-semibold text-brand-ink cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                value="1"
                                defaultChecked={product?.is_active ?? true}
                                className="rounded border-border text-brand-blue cursor-pointer"
                            />
                            Produk Aktif
                        </label>
                    </div>
                </div>
            </div>
            <SheetFooter className="border-t border-border/70 pt-4">
                <Button type="submit" className="w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue-deep cursor-pointer">
                    {sheetState.mode === 'edit'
                        ? 'Simpan Perubahan'
                        : 'Buat Produk'}
                </Button>
            </SheetFooter>
        </form>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
