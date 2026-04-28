import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Factory,
    Plus,
    ShieldCheck,
    Trash2,
    Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
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
    customer: {
        name: string;
        email: string | null;
        phone: string | null;
    };
    paymentMethods: Array<{
        value: string;
        label: string;
    }>;
};

type ItemRow = {
    item_name: string;
    description: string;
    qty: string;
    unit_price: string;
};

const defaultItem = (): ItemRow => ({
    item_name: '',
    description: '',
    qty: '1',
    unit_price: '',
});

export default function CustomerConvectionCreate({
    customer: customerMeta,
    paymentMethods,
}: Props) {
    const [step, setStep] = useState(1);
    const form = useForm({
        company_name: '',
        spec_notes: '',
        reference_file: null as File | null,
        items: [defaultItem()],
        payment: {
            method: 'transfer',
            amount: '',
            reference_number: '',
            notes: '',
            proof: null as File | null,
        },
    });

    const totalAmount = useMemo(
        () =>
            form.data.items.reduce((sum, item) => {
                const qty = Number(item.qty || 0);
                const unitPrice = Number(item.unit_price || 0);

                return sum + qty * unitPrice;
            }, 0),
        [form.data.items],
    );

    const transferSelected = form.data.payment.method === 'transfer';

    const setItem = (index: number, key: keyof ItemRow, value: string) => {
        const items = [...form.data.items];
        items[index] = {
            ...items[index],
            [key]: value,
        };

        form.setData('items', items);
    };

    const addItem = () => {
        form.setData('items', [...form.data.items, defaultItem()]);
    };

    const removeItem = (index: number) => {
        if (form.data.items.length === 1) {
            return;
        }

        form.setData(
            'items',
            form.data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const setPaymentMethod = (method: string) => {
        form.setData('payment', {
            ...form.data.payment,
            method,
            amount: totalAmount > 0 ? totalAmount.toString() : '',
        });
    };

    const submit = () => {
        form.transform((data) => ({
            ...data,
            items: data.items.map((item) => ({
                ...item,
                qty: Number(item.qty),
                unit_price: Number(item.unit_price),
            })),
            payment: {
                ...data.payment,
                amount: Number(totalAmount),
            },
        }));

        form.post(customer.convection.store().url, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <CustomerLayout>
            <Head title="Order Konveksi" />

            <div className="space-y-6">
                <Button asChild variant="outline">
                    <Link href={customer.services.convection()}>
                        <ArrowLeft className="size-4" />
                        Kembali ke layanan konveksi
                    </Link>
                </Button>

                <section className="rounded-[2rem] border border-[#DBEAFE] bg-gradient-to-br from-white to-[#EFF4FF] p-8 shadow-[0_20px_80px_rgba(37,99,235,0.08)]">
                    <p className="text-sm font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                        Order Konveksi
                    </p>
                    <h1 className="mt-2 [font-family:var(--font-heading)] text-3xl font-semibold tracking-tight text-[#0F172A]">
                        Susun order konveksi bertahap sebelum dikirim ke tim
                        produksi.
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                        Lengkapi data perusahaan, daftar item beserta harga,
                        lalu lakukan pembayaran penuh untuk memulai proses
                        produksi.
                    </p>
                </section>

                <SectionTabs
                    tabs={[
                        { id: '1', label: 'Brief & Perusahaan' },
                        { id: '2', label: 'Item & Pricing' },
                        { id: '3', label: 'Review & Pembayaran' },
                    ]}
                    activeTab={String(step)}
                    onChange={(tabId) => setStep(Number(tabId))}
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <MiniStat
                        label="Perusahaan"
                        value={form.data.company_name || '-'}
                    />
                    <MiniStat
                        label="Total item"
                        value={String(form.data.items.length)}
                    />
                    <MiniStat
                        label="Total pesanan"
                        value={formatCurrency(totalAmount)}
                    />
                </div>

                {step === 1 && (
                    <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                        <CardHeader>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Detail Perusahaan & Referensi
                            </CardTitle>
                            <CardDescription className="text-sm leading-6 text-slate-600">
                                PIC saat ini: {customerMeta.name}
                                {customerMeta.email
                                    ? ` • ${customerMeta.email}`
                                    : ''}
                                {customerMeta.phone
                                    ? ` • ${customerMeta.phone}`
                                    : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="company_name">
                                    Nama perusahaan / instansi
                                </Label>
                                <Input
                                    id="company_name"
                                    value={form.data.company_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'company_name',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.company_name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="spec_notes">
                                    Catatan desain / spesifikasi umum
                                </Label>
                                <textarea
                                    id="spec_notes"
                                    className="min-h-28 rounded-xl border border-[#DBEAFE] bg-white px-3 py-2 text-sm text-[#0F172A]"
                                    value={form.data.spec_notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'spec_notes',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.spec_notes} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reference_file">
                                    Upload referensi desain
                                </Label>
                                <Input
                                    id="reference_file"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(event) =>
                                        form.setData(
                                            'reference_file',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <p className="text-sm leading-6 text-slate-600">
                                    File ini wajib ada agar brief konveksi bisa
                                    diproses lebih lanjut.
                                </p>
                                <InputError
                                    message={form.errors.reference_file}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                >
                                    Lanjut ke daftar item
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                    Daftar Item Produksi
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-600">
                                    Isi nama item, qty, harga satuan, dan detail
                                    singkat untuk setiap kebutuhan produksi.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                            >
                                <Plus className="size-4" />
                                Tambah item
                            </Button>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {form.data.items.map((item, index) => (
                                <div
                                    key={`convection-item-${index}`}
                                    className="rounded-[1.5rem] border border-[#DBEAFE] bg-[#F8FAFF] p-5"
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <p className="font-medium text-[#0F172A]">
                                            Item #{index + 1}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            disabled={
                                                form.data.items.length === 1
                                            }
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="size-4" />
                                            Hapus
                                        </Button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor={`item_name_${index}`}
                                            >
                                                Nama item
                                            </Label>
                                            <Input
                                                id={`item_name_${index}`}
                                                value={item.item_name}
                                                onChange={(event) =>
                                                    setItem(
                                                        index,
                                                        'item_name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors[
                                                        `items.${index}.item_name`
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor={`qty_${index}`}>
                                                Qty
                                            </Label>
                                            <Input
                                                id={`qty_${index}`}
                                                type="number"
                                                min="1"
                                                value={item.qty}
                                                onChange={(event) =>
                                                    setItem(
                                                        index,
                                                        'qty',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors[
                                                        `items.${index}.qty`
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor={`unit_price_${index}`}
                                            >
                                                Harga satuan
                                            </Label>
                                            <Input
                                                id={`unit_price_${index}`}
                                                type="number"
                                                min="1"
                                                value={item.unit_price}
                                                onChange={(event) =>
                                                    setItem(
                                                        index,
                                                        'unit_price',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors[
                                                        `items.${index}.unit_price`
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor={`description_${index}`}
                                            >
                                                Detail item
                                            </Label>
                                            <Input
                                                id={`description_${index}`}
                                                value={item.description}
                                                onChange={(event) =>
                                                    setItem(
                                                        index,
                                                        'description',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors[
                                                        `items.${index}.description`
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-2xl bg-white p-4 text-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-slate-600">
                                                Subtotal item
                                            </span>
                                            <span className="font-medium text-[#0F172A]">
                                                {formatCurrency(
                                                    Number(item.qty || 0) *
                                                        Number(
                                                            item.unit_price ||
                                                                0,
                                                        ),
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="rounded-[1.5rem] bg-[#162044] p-5 text-white">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-white/75">
                                            Total sementara
                                        </p>
                                        <p className="[font-family:var(--font-heading)] text-3xl font-semibold">
                                            {formatCurrency(totalAmount)}
                                        </p>
                                    </div>
                                    <Factory className="size-8 text-[#F9C11A]" />
                                </div>
                            </div>

                            <div className="flex justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                >
                                    Kembali
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setStep(3)}
                                >
                                    Lanjut ke pembayaran
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                            <CardHeader>
                                <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                    Pembayaran Penuh
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-600">
                                    Konveksi wajib lunas 100% sebelum order
                                    boleh masuk ke tahap produksi.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="rounded-[1.5rem] border border-[#F9C11A]/60 bg-[#FFF7DA] p-5">
                                    <div className="flex gap-3">
                                        <ShieldCheck className="mt-0.5 size-5 text-[#A16207]" />
                                        <div className="space-y-1 text-sm leading-6 text-[#854D0E]">
                                            <p className="font-semibold">
                                                BR-C01 aktif
                                            </p>
                                            <p>
                                                Tim office tidak bisa
                                                memindahkan order konveksi ke
                                                tahap produksi selama pembayaran
                                                belum lunas dan terverifikasi.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            className={
                                                form.data.payment.method ===
                                                method.value
                                                    ? 'rounded-[1.5rem] border border-[#2563EB] bg-[#EFF4FF] p-5 text-left shadow-[0_12px_30px_rgba(37,99,235,0.08)]'
                                                    : 'rounded-[1.5rem] border border-[#DBEAFE] bg-white p-5 text-left transition-colors hover:bg-[#F8FAFF]'
                                            }
                                            onClick={() =>
                                                setPaymentMethod(method.value)
                                            }
                                        >
                                            <p className="font-medium text-[#0F172A]">
                                                {method.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="payment_amount">
                                        Nominal pembayaran
                                    </Label>
                                    <Input
                                        id="payment_amount"
                                        type="number"
                                        value={totalAmount}
                                        readOnly
                                    />
                                    <InputError
                                        message={
                                            form.errors['payment.amount']
                                        }
                                    />
                                </div>

                                {transferSelected && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="reference_number">
                                                Nomor referensi transfer
                                            </Label>
                                            <Input
                                                id="reference_number"
                                                value={
                                                    form.data.payment
                                                        .reference_number
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'payment',
                                                        {
                                                            ...form.data
                                                                .payment,
                                                            reference_number:
                                                                event
                                                                    .target
                                                                    .value,
                                                        },
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors[
                                                        'payment.reference_number'
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="payment_proof">
                                                Bukti transfer
                                            </Label>
                                            <Input
                                                id="payment_proof"
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={(event) =>
                                                    form.setData(
                                                        'payment',
                                                        {
                                                            ...form.data
                                                                .payment,
                                                            proof:
                                                                event
                                                                    .target
                                                                    .files?.[0] ??
                                                                null,
                                                        },
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors[
                                                        'payment.proof'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="payment_notes">
                                        Catatan pembayaran
                                    </Label>
                                    <Input
                                        id="payment_notes"
                                        value={form.data.payment.notes}
                                        onChange={(event) =>
                                            form.setData('payment', {
                                                ...form.data.payment,
                                                notes: event.target.value,
                                            })
                                        }
                                    />
                                    <InputError
                                        message={
                                            form.errors['payment.notes']
                                        }
                                    />
                                </div>

                                <div className="flex justify-between gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(2)}
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={form.processing}
                                        onClick={submit}
                                    >
                                        Kirim order konveksi
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-[#162044] text-white shadow-[0_20px_80px_rgba(22,32,68,0.18)]">
                            <CardHeader>
                                <CardTitle className="[font-family:var(--font-heading)] text-2xl">
                                    Ringkasan Pesanan
                                </CardTitle>
                                <CardDescription className="text-white/80">
                                    Review perusahaan, item, dan pembayaran
                                    sebelum submit final.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-2xl bg-white/8 p-4 text-sm">
                                    <SummaryLine
                                        label="Perusahaan"
                                        value={form.data.company_name || '-'}
                                    />
                                    <SummaryLine
                                        label="PIC"
                                        value={customerMeta.name}
                                    />
                                </div>

                                {form.data.items.map((item, index) => (
                                    <div
                                        key={`summary-item-${index}`}
                                        className="rounded-2xl bg-white/8 p-4"
                                    >
                                        <p className="font-medium text-white">
                                            {item.item_name ||
                                                `Item #${index + 1}`}
                                        </p>
                                        <p className="mt-1 text-sm text-white/80">
                                            Qty {item.qty || 0}
                                            {` • ${formatCurrency(Number(item.unit_price || 0))}`}
                                        </p>
                                        <p className="mt-2 text-sm text-white/90">
                                            {formatCurrency(
                                                Number(item.qty || 0) *
                                                    Number(
                                                        item.unit_price || 0,
                                                    ),
                                            )}
                                        </p>
                                    </div>
                                ))}

                                <div className="rounded-2xl bg-white/8 p-4 text-sm">
                                    <SummaryLine
                                        label="Total item"
                                        value={String(form.data.items.length)}
                                    />
                                    <SummaryLine
                                        label="Total pesanan"
                                        value={formatCurrency(totalAmount)}
                                        strong
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}

function SectionTabs({
    tabs,
    activeTab,
    onChange,
}: {
    tabs: Array<{ id: string; label: string }>;
    activeTab: string;
    onChange: (tabId: string) => void;
}) {
    return (
        <div className="rounded-[1.5rem] border border-[#DBEAFE] bg-white p-2 shadow-[0_16px_40px_rgba(37,99,235,0.05)]">
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={
                            activeTab === tab.id
                                ? 'rounded-xl bg-[#1B5EC5] px-4 py-2.5 text-sm font-semibold text-white'
                                : 'rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-[#EFF4FF] hover:text-[#1B5EC5]'
                        }
                        onClick={() => onChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[1.5rem] border border-[#DBEAFE] bg-white p-5 shadow-[0_16px_30px_rgba(37,99,235,0.05)]">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#2563EB] uppercase">
                {label}
            </p>
            <p className="mt-3 [font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                {value}
            </p>
        </div>
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
