import { Head, Link, router } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';
import type { BreadcrumbItem } from '@/types';

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
    { title: 'Produk', href: office.admin.products.index() },
];

export default function AdminProductsIndex({
    filters,
    products,
    can,
}: Props) {
    const [sheetState, setSheetState] = useState<ProductSheetState>(null);

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Products" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Product management
                            </CardTitle>
                            <p className="text-sm text-slate-600">
                                Pantau low stock, clearance, dan update data RTW
                                dalam tabel produk yang ringkas. Untuk produk
                                yang mulai kurang diminati, selling price bisa
                                disesuaikan hingga mendekati base price.
                            </p>
                        </div>
                        {can.create ? (
                            <Button
                                type="button"
                                onClick={() => setSheetState({ mode: 'create' })}
                            >
                                Tambah produk
                            </Button>
                        ) : null}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form
                            className="grid gap-3 md:grid-cols-4"
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
                                                    formData.get('search') || '',
                                                ) || null,
                                            low_stock: formData.get(
                                                'low_stock',
                                            )
                                                ? '1'
                                                : null,
                                            clearance: formData.get(
                                                'clearance',
                                            )
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
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                            />
                            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    name="low_stock"
                                    defaultChecked={filters.low_stock}
                                />
                                Low stock
                            </label>
                            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    name="clearance"
                                    defaultChecked={filters.clearance}
                                />
                                Clearance
                            </label>
                            <Button type="submit">Filter</Button>
                        </form>

                        <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Produk
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                SKU
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Ukuran
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Stok
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                                Harga
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-600">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {products.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-10 text-center text-slate-500"
                                                >
                                                    Tidak ada produk yang cocok
                                                    dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            products.data.map((product) => (
                                                <tr key={product.id}>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-[#EFF4FF] text-[#2563EB]">
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
                                                                    <ImageIcon className="size-5" />
                                                                )}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="font-semibold text-[#0F172A]">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        product.category
                                                                    }
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {product.is_clearance ? (
                                                                        <Badge className="bg-amber-100 text-amber-800">
                                                                            Clearance
                                                                        </Badge>
                                                                    ) : null}
                                                                    <Badge
                                                                        className={
                                                                            product.is_active
                                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                                : 'bg-slate-100 text-slate-700'
                                                                        }
                                                                    >
                                                                        {product.is_active
                                                                            ? 'Aktif'
                                                                            : 'Nonaktif'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600">
                                                        {product.sku}
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600">
                                                        {product.size}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge
                                                            className={
                                                                product.stock <=
                                                                5
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-emerald-100 text-emerald-800'
                                                            }
                                                        >
                                                            Stok {product.stock}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-semibold text-[#0F172A]">
                                                            {formatCurrency(
                                                                product.final_price,
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Jual{' '}
                                                            {formatCurrency(
                                                                product.selling_price,
                                                            )}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            {can.update ? (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
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
                                                            {can.delete &&
                                                            product.is_active ? (
                                                                <form
                                                                    {...office.admin.products.destroy.form(
                                                                        product.id,
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
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {products.links.map((link) => (
                                <Button
                                    key={`${link.label}-${link.url ?? 'null'}`}
                                    asChild={link.url !== null}
                                    type="button"
                                    variant={link.active ? 'default' : 'outline'}
                                    className="min-w-11"
                                    disabled={link.url === null}
                                >
                                    {link.url === null ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Sheet
                open={sheetState !== null}
                onOpenChange={(open) => !open && setSheetState(null)}
            >
                <SheetContent className="w-full overflow-y-auto border-l-slate-200 bg-[#F8FAFF] sm:max-w-2xl">
                    <SheetHeader className="border-b border-slate-200 pb-4 text-left">
                        <SheetTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            {sheetState?.mode === 'edit'
                                ? 'Edit produk RTW'
                                : 'Tambah produk RTW'}
                        </SheetTitle>
                        <SheetDescription className="text-slate-600">
                            {sheetState?.mode === 'edit'
                                ? 'Perbarui data stok, harga, clearance, dan status produk dari sheet.'
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
            <div className="grid gap-4 px-4 py-6 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    SKU
                    <input
                        name="sku"
                        defaultValue={product?.sku ?? ''}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Nama produk
                    <input
                        name="name"
                        defaultValue={product?.name ?? ''}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Kategori
                    <input
                        name="category"
                        defaultValue={product?.category ?? ''}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Ukuran
                    <input
                        name="size"
                        defaultValue={product?.size ?? ''}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Base price
                    <input
                        name="base_price"
                        type="number"
                        defaultValue={product?.base_price ?? ''}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Selling price
                    <input
                        name="selling_price"
                        type="number"
                        defaultValue={product?.selling_price ?? ''}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Diskon nominal
                    <input
                        name="discount_amount"
                        type="number"
                        defaultValue={product?.discount_amount ?? 0}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Diskon persen
                    <input
                        name="discount_percent"
                        type="number"
                        defaultValue={product?.discount_percent ?? 0}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Stok
                    <input
                        name="stock"
                        type="number"
                        defaultValue={product?.stock ?? ''}
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Gambar
                    <input
                        name="image_path"
                        defaultValue={product?.image_path ?? ''}
                        placeholder="/storage/products/sku-001.jpg"
                        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                    Deskripsi
                    <textarea
                        name="description"
                        defaultValue={product?.description ?? ''}
                        className="min-h-28 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
                    />
                </label>
                <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <input type="hidden" name="is_clearance" value="0" />
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                name="is_clearance"
                                value="1"
                                defaultChecked={product?.is_clearance ?? false}
                            />
                            Produk clearance
                        </label>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <input type="hidden" name="is_active" value="0" />
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                name="is_active"
                                value="1"
                                defaultChecked={product?.is_active ?? true}
                            />
                            Produk aktif
                        </label>
                    </div>
                </div>
            </div>
            <SheetFooter className="border-t border-slate-200">
                <Button type="submit" className="w-full">
                    {sheetState.mode === 'edit'
                        ? 'Simpan perubahan'
                        : 'Buat produk'}
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
