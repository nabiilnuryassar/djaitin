import { Head, Link, router, useForm } from '@inertiajs/react';
import { ShoppingCart, Trash2 } from 'lucide-react';
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

type Props = {
    cart: {
        id: number;
        items: Array<{
            id: number;
            qty: number;
            subtotal: number;
            product: {
                id: number | null;
                name: string | null;
                size: string | null;
                category: string | null;
                stock: number | null;
                image_path: string | null;
                selling_price: number;
                discount_amount: number;
                final_price: number;
            };
        }>;
    };
    summary: {
        items_count: number;
        total_amount: number;
    };
};

export default function CustomerCartIndex({ cart, summary }: Props) {
    return (
        <CustomerLayout>
            <Head title="Keranjang" />

            <div className="space-y-6">
                <section className="flex flex-col gap-4 rounded-[2rem] border border-[#DBEAFE] bg-gradient-to-br from-white to-[#EFF4FF] p-8 shadow-[0_20px_80px_rgba(37,99,235,0.08)] md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                            Shopping Cart
                        </p>
                        <h1 className="[font-family:var(--font-heading)] text-3xl font-semibold tracking-tight text-[#0F172A]">
                            Review item ready-to-wear sebelum checkout.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            Qty di keranjang tetap dicek ulang terhadap stock
                            aktif saat update dan checkout.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={customer.catalog.index()}>
                            Tambah Produk Lagi
                        </Link>
                    </Button>
                </section>

                {cart.items.length === 0 ? (
                    <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <ShoppingCart className="size-10 text-slate-400" />
                            <p className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Keranjang masih kosong
                            </p>
                            <p className="max-w-lg text-sm leading-6 text-slate-600">
                                Pilih produk dari katalog ready-to-wear untuk
                                mulai checkout.
                            </p>
                            <Button asChild>
                                <Link href={customer.catalog.index()}>
                                    Buka Katalog
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="grid gap-4">
                            {cart.items.map((item) => (
                                <CartItemCard key={item.id} item={item} />
                            ))}
                        </div>

                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                            <CardHeader>
                                <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                    Ringkasan Belanja
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-600">
                                    Total akhir belum termasuk ongkir delivery.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">
                                        Total item
                                    </span>
                                    <span className="font-medium text-[#0F172A]">
                                        {summary.items_count}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">
                                        Subtotal
                                    </span>
                                    <span className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#0F172A]">
                                        {formatCurrency(summary.total_amount)}
                                    </span>
                                </div>
                                <Button asChild className="w-full">
                                    <Link href={customer.checkout.index()}>
                                        Lanjut Checkout
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}

function CartItemCard({
    item,
}: {
    item: Props['cart']['items'][number];
}) {
    const form = useForm({
        qty: item.qty.toString(),
    });

    const updateQty = () => {
        form.put(customer.cart.items.update(item.id).url, {
            preserveScroll: true,
        });
    };

    const removeItem = () => {
        router.delete(customer.cart.items.destroy(item.id).url, {
            preserveScroll: true,
        });
    };

    return (
        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                        {item.product.name ?? 'Produk tidak tersedia'}
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-600">
                        {item.product.category ?? '-'} • Size{' '}
                        {item.product.size ?? '-'}
                    </CardDescription>
                    <p className="text-sm text-slate-600">
                        Stock aktif: {item.product.stock ?? 0}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={removeItem}
                >
                    <Trash2 className="size-4" />
                    Hapus
                </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-end">
                <div className="space-y-2">
                    <label
                        htmlFor={`qty-${item.id}`}
                        className="text-sm font-medium text-[#0F172A]"
                    >
                        Qty
                    </label>
                    <Input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        value={form.data.qty}
                        onChange={(event) =>
                            form.setData('qty', event.target.value)
                        }
                    />
                </div>
                <div>
                    <p className="text-sm text-slate-600">Harga satuan</p>
                    <p className="font-medium text-[#0F172A]">
                        {formatCurrency(item.product.final_price)}
                    </p>
                </div>
                <div className="space-y-3 md:text-right">
                    <p className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#0F172A]">
                        {formatCurrency(item.subtotal)}
                    </p>
                    <Button type="button" onClick={updateQty}>
                        Update Qty
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
