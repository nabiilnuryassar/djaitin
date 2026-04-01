import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    product: Product;
    variants: Product[];
};

export default function CustomerCatalogShow({ product, variants }: Props) {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const isCustomer = auth.user?.role === 'customer';
    const form = useForm({
        product_id: product.id,
        qty: '1',
    });

    const addToCart = () => {
        form.post(customer.cart.items.store().url, {
            preserveScroll: true,
        });
    };

    return (
        <CustomerLayout>
            <Head title={product.name} />

            <div className="space-y-6">
                <Button asChild variant="outline">
                    <Link href={customer.catalog.index()}>
                        <ArrowLeft className="size-4" />
                        Kembali ke Katalog
                    </Link>
                </Button>

                <section className="grid gap-6 rounded-[2rem] border border-[#DBEAFE] bg-white p-8 shadow-[0_20px_80px_rgba(37,99,235,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[1.75rem] bg-gradient-to-br from-[#EFF4FF] to-[#DBEAFE] p-8">
                        <p className="text-sm font-semibold tracking-[0.18em] text-[#2563EB] uppercase">
                            {product.sku}
                        </p>
                        <div className="mt-6 space-y-4">
                            <h1 className="[font-family:var(--font-heading)] text-4xl font-semibold tracking-tight text-[#0F172A]">
                                {product.name}
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-slate-600">
                                {product.description ??
                                    'Produk ready-to-wear untuk customer yang butuh proses lebih cepat dibanding tailor custom.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#EFF4FF] px-3 py-1 text-xs font-medium text-[#1B5EC5]">
                                {formatLabel(product.category)}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                Size {product.size}
                            </span>
                            <span className={stockBadgeClassName(product)}>
                                {stockLabel(product)}
                            </span>
                        </div>

                        <div>
                            <p className="[font-family:var(--font-heading)] text-3xl font-semibold text-[#0F172A]">
                                {formatCurrency(product.final_price)}
                            </p>
                            {product.discount_amount > 0 && (
                                <p className="mt-1 text-sm text-slate-500 line-through">
                                    {formatCurrency(product.selling_price)}
                                </p>
                            )}
                        </div>

                        <Card className="border-0 bg-[#F8FAFF] shadow-none">
                            <CardHeader>
                                <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                    Pilih size
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-600">
                                    Variant size yang stoknya habis akan
                                    otomatis nonaktif.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {variants.map((variant) =>
                                    variant.stock < 1 ? (
                                        <span
                                            key={variant.id}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400"
                                        >
                                            {variant.size}
                                        </span>
                                    ) : (
                                        <Link
                                            key={variant.id}
                                            href={customer.catalog.show(variant.id)}
                                            className={
                                                variant.id === product.id
                                                    ? 'rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white'
                                                    : 'rounded-full border border-[#DBEAFE] bg-white px-4 py-2 text-sm font-medium text-[#1B5EC5] transition-colors hover:bg-[#EFF4FF]'
                                            }
                                        >
                                            {variant.size}
                                        </Link>
                                    ),
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                            <div className="space-y-2">
                                <label
                                    htmlFor="qty"
                                    className="text-sm font-medium text-[#0F172A]"
                                >
                                    Qty
                                </label>
                                <Input
                                    id="qty"
                                    type="number"
                                    min="1"
                                    max={Math.max(product.stock, 1)}
                                    value={form.data.qty}
                                    onChange={(event) =>
                                        form.setData('qty', event.target.value)
                                    }
                                />
                            </div>
                            <div className="flex items-end">
                                {isCustomer ? (
                                    <Button
                                        type="button"
                                        className="w-full"
                                        disabled={
                                            product.stock < 1 || form.processing
                                        }
                                        onClick={addToCart}
                                    >
                                        <ShoppingCart className="size-4" />
                                        Tambah ke Keranjang
                                    </Button>
                                ) : (
                                    <Button asChild className="w-full">
                                        <Link href={login()}>
                                            <ShoppingCart className="size-4" />
                                            Masuk untuk Beli
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
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
        return 'Stock Habis';
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
