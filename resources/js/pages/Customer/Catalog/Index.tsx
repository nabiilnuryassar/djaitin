import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';
import { login } from '@/routes';
import type { User } from '@/types/auth';

type Product = {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    category: string;
    size: string;
    selling_price: number;
    discount_amount: number;
    final_price: number;
    is_clearance: boolean;
    stock: number;
    is_low_stock: boolean;
    image_path: string | null;
};

type Props = {
    filters: {
        category: string;
        size: string;
    };
    categories: string[];
    sizes: string[];
    products: {
        data: Product[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
};

export default function CustomerCatalogIndex({
    filters,
    categories,
    sizes,
    products,
}: Props) {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const isCustomer = auth.user?.role === 'customer';
    const filterForm = useForm({
        category: filters.category,
        size: filters.size,
    });

    const applyFilters = () => {
        router.get(
            customer.catalog.index.url({
                query: {
                    category: filterForm.data.category || null,
                    size: filterForm.data.size || null,
                },
            }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const addToCart = (productId: number) => {
        router.post(
            customer.cart.items.store().url,
            { product_id: productId, qty: 1 },
            { preserveScroll: true },
        );
    };

    return (
        <CustomerLayout>
            <Head title="Katalog RTW" />

            <div className="space-y-6">
                <section className="grid gap-6 rounded-[2rem] border border-[#DBEAFE] bg-gradient-to-br from-white to-[#EFF4FF] p-8 shadow-[0_20px_80px_rgba(37,99,235,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                        <p className="text-sm font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                            Ready-to-Wear Catalog
                        </p>
                        <h1 className="[font-family:var(--font-heading)] text-4xl font-semibold tracking-tight text-[#0F172A]">
                            Belanja produk siap pakai dengan filter size dan stok yang jelas.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            Katalog ini hanya menampilkan produk aktif. Stock
                            dicek ulang di backend saat masuk cart dan saat
                            checkout.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {isCustomer ? (
                                <Button asChild>
                                    <Link href={customer.cart.index()}>
                                        Buka Keranjang
                                        <ShoppingCart className="size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild>
                                    <Link href={login()}>
                                        Masuk untuk Belanja
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="border-0 bg-[#162044] text-white shadow-none">
                        <CardHeader>
                            <CardTitle className="[font-family:var(--font-heading)] text-2xl">
                                Fokus Phase 3
                            </CardTitle>
                            <CardDescription className="text-white/80">
                                Cart, checkout, pickup/delivery, dan kontrol stok.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm leading-6 text-white/85">
                            {[
                                'Clearance product ditandai langsung di katalog.',
                                'Produk low stock diberi peringatan sebelum checkout.',
                                'Guest tetap bisa browse, tetapi add to cart diarahkan ke login.',
                                'Keranjang dan checkout terisolasi per customer account.',
                            ].map((item) => (
                                <div key={item} className="flex gap-3">
                                    <div className="mt-2 size-2 rounded-full bg-[#F9C11A]" />
                                    <p>{item}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Filter produk
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-slate-600">
                                Batasi katalog berdasarkan kategori dan size.
                            </CardDescription>
                        </div>
                        <div className="grid gap-3 md:grid-cols-[180px_160px_auto]">
                            <select
                                value={filterForm.data.category}
                                onChange={(event) =>
                                    filterForm.setData(
                                        'category',
                                        event.target.value,
                                    )
                                }
                                className="h-11 rounded-xl border border-[#DBEAFE] bg-white px-3 text-sm text-[#0F172A]"
                            >
                                <option value="">Semua kategori</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {formatLabel(category)}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterForm.data.size}
                                onChange={(event) =>
                                    filterForm.setData(
                                        'size',
                                        event.target.value,
                                    )
                                }
                                className="h-11 rounded-xl border border-[#DBEAFE] bg-white px-3 text-sm text-[#0F172A]"
                            >
                                <option value="">Semua size</option>
                                {sizes.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                                onClick={applyFilters}
                            >
                                Terapkan Filter
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {products.data.map((product) => (
                        <Card
                            key={product.id}
                            className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]"
                        >
                            <CardHeader className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                            {product.name}
                                        </CardTitle>
                                        <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                                            {product.description ??
                                                'Produk siap pakai untuk kebutuhan cepat customer.'}
                                        </CardDescription>
                                    </div>
                                    {product.is_clearance && (
                                        <span className="rounded-full bg-[#F9C11A]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A16207]">
                                            Clearance
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-[#EFF4FF] px-3 py-1 text-xs font-medium text-[#1B5EC5]">
                                        {formatLabel(product.category)}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                        Size {product.size}
                                    </span>
                                    <span
                                        className={stockBadgeClassName(product)}
                                    >
                                        {stockLabel(product)}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <p className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#0F172A]">
                                        {formatCurrency(product.final_price)}
                                    </p>
                                    {product.discount_amount > 0 && (
                                        <p className="text-sm text-slate-500 line-through">
                                            {formatCurrency(
                                                product.selling_price,
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button asChild variant="outline">
                                        <Link href={customer.catalog.show(product.id)}>
                                            Detail
                                        </Link>
                                    </Button>
                                    {isCustomer ? (
                                        <Button
                                            type="button"
                                            disabled={product.stock < 1}
                                            onClick={() => addToCart(product.id)}
                                        >
                                            <ShoppingCart className="size-4" />
                                            Tambah ke Keranjang
                                        </Button>
                                    ) : (
                                        <Button asChild>
                                            <Link href={login()}>
                                                <ShoppingBag className="size-4" />
                                                Masuk untuk Beli
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {products.data.length === 0 && (
                    <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <ShoppingBag className="size-10 text-slate-400" />
                            <p className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Produk yang cocok belum ditemukan
                            </p>
                            <p className="max-w-xl text-sm leading-6 text-slate-600">
                                Ubah filter kategori atau size untuk melihat
                                produk ready-to-wear lainnya.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-wrap gap-2">
                    {products.links.map((link) => (
                        <Button
                            key={link.label}
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
            </div>
        </CustomerLayout>
    );
}

function stockBadgeClassName(product: Product): string {
    if (product.stock < 1) {
        return 'rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700';
    }

    if (product.is_low_stock) {
        return 'rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700';
    }

    return 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700';
}

function stockLabel(product: Product): string {
    if (product.stock < 1) {
        return 'Habis';
    }

    if (product.is_low_stock) {
        return `Hampir Habis (${product.stock})`;
    }

    return `Tersedia (${product.stock})`;
}

function formatLabel(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
