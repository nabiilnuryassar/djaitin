import { Head, Link, useForm } from '@inertiajs/react';
import { CreditCard, MapPinHouse, PackageCheck, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
                final_price: number;
            };
        }>;
    };
    addresses: Array<{
        id: number;
        label: string;
        recipient_name: string;
        phone: string | null;
        full_address: string;
        is_default: boolean;
    }>;
    couriers: Array<{
        id: number;
        name: string;
        base_fee: number;
    }>;
    summary: {
        subtotal: number;
    };
    paymentMethods: Array<{
        value: string;
        label: string;
    }>;
};

export default function CustomerCheckoutIndex({
    cart,
    addresses,
    couriers,
    summary,
    paymentMethods,
}: Props) {
    const defaultAddress = addresses.find((address) => address.is_default);
    const defaultCourier = couriers[0];

    const form = useForm({
        delivery_type: 'pickup',
        address_id: defaultAddress?.id.toString() ?? '',
        courier_id: defaultCourier?.id.toString() ?? '',
        payment: {
            method: 'transfer',
            amount: summary.subtotal.toString(),
            reference_number: '',
            notes: '',
            proof: null as File | null,
        },
    });

    const courierFee = (courierId: string) =>
        couriers.find((courier) => courier.id.toString() === courierId)
            ?.base_fee ?? 0;

    const deliveryFee =
        form.data.delivery_type === 'delivery'
            ? courierFee(form.data.courier_id)
            : 0;
    const totalAmount = summary.subtotal + deliveryFee;
    const transferSelected = form.data.payment.method === 'transfer';

    const setDeliveryType = (deliveryType: 'pickup' | 'delivery') => {
        const nextDeliveryFee =
            deliveryType === 'delivery' ? courierFee(form.data.courier_id) : 0;
        const nextTotalAmount = summary.subtotal + nextDeliveryFee;

        form.setData((data) => ({
            ...data,
            delivery_type: deliveryType,
            payment: {
                ...data.payment,
                amount:
                    data.payment.method === 'transfer'
                        ? nextTotalAmount.toString()
                        : data.payment.amount,
            },
        }));
    };

    const setCourierId = (courierId: string) => {
        const nextDeliveryFee =
            form.data.delivery_type === 'delivery' ? courierFee(courierId) : 0;
        const nextTotalAmount = summary.subtotal + nextDeliveryFee;

        form.setData((data) => ({
            ...data,
            courier_id: courierId,
            payment: {
                ...data.payment,
                amount:
                    data.payment.method === 'transfer'
                        ? nextTotalAmount.toString()
                        : data.payment.amount,
            },
        }));
    };

    const setPaymentMethod = (method: string) => {
        form.setData((data) => ({
            ...data,
            payment: {
                ...data.payment,
                method,
                amount: method === 'transfer' ? totalAmount.toString() : '',
            },
        }));
    };

    const submit = () => {
        form.transform((data) => ({
            ...data,
            address_id:
                data.delivery_type === 'delivery' && data.address_id !== ''
                    ? Number(data.address_id)
                    : null,
            courier_id:
                data.delivery_type === 'delivery' && data.courier_id !== ''
                    ? Number(data.courier_id)
                    : null,
            payment: {
                ...data.payment,
                amount:
                    data.payment.amount === ''
                        ? null
                        : Number(data.payment.amount),
            },
        }));

        form.post(customer.checkout.store().url, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <CustomerLayout>
            <Head title="Checkout RTW" />

            <div className="space-y-6">
                <section className="rounded-[2rem] border border-[#DBEAFE] bg-gradient-to-br from-white to-[#EFF4FF] p-8 shadow-[0_20px_80px_rgba(37,99,235,0.08)]">
                    <p className="text-sm font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                        Ready-to-Wear Checkout
                    </p>
                    <h1 className="mt-2 [font-family:var(--font-heading)] text-3xl font-semibold tracking-tight text-[#0F172A]">
                        Konfirmasi pengiriman dan metode pembayaran sebelum order dibuat.
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                        Stock tetap diverifikasi ulang di backend. Untuk delivery,
                        ongkir mengikuti biaya master kurir tanpa markup toko.
                    </p>
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                    <div className="space-y-6">
                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                            <CardHeader>
                                <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                    Tipe Pengambilan
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-600">
                                    Pilih pickup di toko atau delivery ke alamat customer.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-2">
                                <OptionCard
                                    active={form.data.delivery_type === 'pickup'}
                                    description="Ambil sendiri di lokasi, cocok untuk pembayaran cash."
                                    icon={Store}
                                    label="Pickup"
                                    onClick={() => setDeliveryType('pickup')}
                                />
                                <OptionCard
                                    active={
                                        form.data.delivery_type === 'delivery'
                                    }
                                    description="Kirim ke alamat customer dengan biaya sesuai kurir yang dipilih."
                                    icon={MapPinHouse}
                                    label="Delivery"
                                    onClick={() => setDeliveryType('delivery')}
                                />
                            </CardContent>
                        </Card>

                        {form.data.delivery_type === 'delivery' && (
                            <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                                <CardHeader>
                                    <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                        Detail Delivery
                                    </CardTitle>
                                    <CardDescription className="text-sm leading-6 text-slate-600">
                                        Gunakan alamat tersimpan untuk mempercepat checkout.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {addresses.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-[#DBEAFE] bg-[#F8FAFF] p-5 text-sm leading-6 text-slate-600">
                                            Belum ada alamat tersimpan. Tambahkan
                                            dulu dari{' '}
                                            <Link
                                                href={customer.profile.edit({
                                                    query: {
                                                        section: 'addresses',
                                                    },
                                                })}
                                                className="font-medium text-[#1B5EC5]"
                                            >
                                                halaman profil
                                            </Link>
                                            .
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="address_id">
                                                    Alamat
                                                </Label>
                                                <select
                                                    id="address_id"
                                                    className="h-11 rounded-xl border border-[#DBEAFE] bg-white px-3 text-sm text-[#0F172A]"
                                                    value={form.data.address_id}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'address_id',
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Pilih alamat
                                                    </option>
                                                    {addresses.map((address) => (
                                                        <option
                                                            key={address.id}
                                                            value={address.id}
                                                        >
                                                            {address.label ||
                                                                'Alamat'}{' '}
                                                            -{' '}
                                                            {
                                                                address.recipient_name
                                                            }
                                                        </option>
                                                    ))}
                                                </select>
                                                {form.errors.address_id && (
                                                    <p className="text-sm text-red-600">
                                                        {form.errors.address_id}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="courier_id">
                                                    Kurir
                                                </Label>
                                                <select
                                                    id="courier_id"
                                                    className="h-11 rounded-xl border border-[#DBEAFE] bg-white px-3 text-sm text-[#0F172A]"
                                                    value={form.data.courier_id}
                                                    onChange={(event) =>
                                                        setCourierId(
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Pilih kurir
                                                    </option>
                                                    {couriers.map((courier) => (
                                                        <option
                                                            key={courier.id}
                                                            value={courier.id}
                                                        >
                                                            {courier.name} -{' '}
                                                            {formatCurrency(
                                                                courier.base_fee,
                                                            )}
                                                        </option>
                                                    ))}
                                                </select>
                                                {form.errors.courier_id && (
                                                    <p className="text-sm text-red-600">
                                                        {form.errors.courier_id}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                            <CardHeader>
                                <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                    Metode Pembayaran
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-600">
                                    Transfer bisa diverifikasi lebih cepat. Cash
                                    cocok untuk pickup.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    {paymentMethods.map((method) => (
                                        <OptionCard
                                            key={method.value}
                                            active={
                                                form.data.payment.method ===
                                                method.value
                                            }
                                            description={method.label}
                                            icon={CreditCard}
                                            label={method.label}
                                            onClick={() =>
                                                setPaymentMethod(method.value)
                                            }
                                        />
                                    ))}
                                </div>

                                {transferSelected && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">
                                                Nominal Transfer
                                            </Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="1"
                                                value={form.data.payment.amount}
                                                onChange={(event) =>
                                                    form.setData('payment', {
                                                        ...form.data.payment,
                                                        amount:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                            {form.errors['payment.amount'] && (
                                                <p className="text-sm text-red-600">
                                                    {
                                                        form.errors[
                                                            'payment.amount'
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="reference_number">
                                                Nomor Referensi
                                            </Label>
                                            <Input
                                                id="reference_number"
                                                value={
                                                    form.data.payment
                                                        .reference_number
                                                }
                                                onChange={(event) =>
                                                    form.setData('payment', {
                                                        ...form.data.payment,
                                                        reference_number:
                                                            event.target.value,
                                                    })
                                                }
                                            />
                                            {form.errors[
                                                'payment.reference_number'
                                            ] && (
                                                <p className="text-sm text-red-600">
                                                    {
                                                        form.errors[
                                                            'payment.reference_number'
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="proof">
                                                Bukti Transfer
                                            </Label>
                                            <Input
                                                id="proof"
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={(event) =>
                                                    form.setData('payment', {
                                                        ...form.data.payment,
                                                        proof:
                                                            event.target
                                                                .files?.[0] ??
                                                            null,
                                                    })
                                                }
                                            />
                                            {form.errors['payment.proof'] && (
                                                <p className="text-sm text-red-600">
                                                    {
                                                        form.errors[
                                                            'payment.proof'
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Catatan</Label>
                                    <Input
                                        id="notes"
                                        value={form.data.payment.notes}
                                        onChange={(event) =>
                                            form.setData('payment', {
                                                ...form.data.payment,
                                                notes: event.target.value,
                                            })
                                        }
                                        placeholder="Instruksi singkat untuk pickup atau delivery."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-0 bg-[#162044] text-white shadow-[0_20px_80px_rgba(22,32,68,0.18)]">
                        <CardHeader>
                            <CardTitle className="[font-family:var(--font-heading)] text-2xl">
                                Ringkasan Order
                            </CardTitle>
                            <CardDescription className="text-white/80">
                                Total akhir dan item RTW yang akan dibuat sebagai order.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl bg-white/8 p-4"
                                >
                                    <p className="font-medium text-white">
                                        {item.product.name}
                                    </p>
                                    <p className="mt-1 text-sm text-white/80">
                                        Size {item.product.size} • Qty {item.qty}
                                    </p>
                                    <p className="mt-2 text-sm text-white/90">
                                        {formatCurrency(item.subtotal)}
                                    </p>
                                </div>
                            ))}

                            <div className="rounded-2xl bg-white/8 p-4 text-sm">
                                <SummaryLine
                                    label="Subtotal"
                                    value={formatCurrency(summary.subtotal)}
                                />
                                <SummaryLine
                                    label="Ongkir kurir"
                                    value={formatCurrency(deliveryFee)}
                                />
                                <SummaryLine
                                    label="Total"
                                    strong
                                    value={formatCurrency(totalAmount)}
                                />
                            </div>

                            <Button
                                type="button"
                                className="w-full bg-[#F9C11A] text-[#162044] hover:bg-[#F9C11A]/90"
                                onClick={submit}
                            >
                                <PackageCheck className="size-4" />
                                Konfirmasi Order
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}

function OptionCard({
    active,
    icon: Icon,
    label,
    description,
    onClick,
}: {
    active: boolean;
    icon: typeof Store;
    label: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={
                active
                    ? 'rounded-[1.5rem] border border-[#2563EB] bg-[#EFF4FF] p-5 text-left shadow-[0_12px_30px_rgba(37,99,235,0.08)]'
                    : 'rounded-[1.5rem] border border-[#DBEAFE] bg-white p-5 text-left transition-colors hover:bg-[#F8FAFF]'
            }
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <div
                    className={
                        active
                            ? 'rounded-2xl bg-[#2563EB] p-3 text-white'
                            : 'rounded-2xl bg-[#EFF4FF] p-3 text-[#2563EB]'
                    }
                >
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="font-medium text-[#0F172A]">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}

function SummaryLine({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-white/80">{label}</span>
            <span
                className={
                    strong
                        ? '[font-family:var(--font-heading)] text-lg font-semibold text-white'
                        : 'font-medium text-white'
                }
            >
                {value}
            </span>
        </div>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
