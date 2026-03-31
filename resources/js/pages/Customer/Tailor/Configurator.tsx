import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Check,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    FileText,
    Lock,
    Palette,
    Receipt,
    Ruler,
    Save,
    Shirt,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';
import { login, register } from '@/routes';
import type { User } from '@/types/auth';

type Option = {
    id: number;
    name: string;
    description: string | null;
};

type GarmentModelOption = Option & {
    base_price: number;
};

type FabricOption = Option & {
    price_adjustment: number;
};

type MeasurementOption = {
    id: number;
    label: string;
};

type Props = {
    garmentModels: GarmentModelOption[];
    fabrics: FabricOption[];
    measurements: MeasurementOption[];
    discountPolicy: {
        percent: number;
        threshold: number;
    };
    customerMeta: {
        id: number;
        is_loyalty_eligible: boolean;
        loyalty_order_count: number;
    } | null;
    draft: {
        id: number;
        payload: Record<string, unknown> | null;
    } | null;
};

type FormState = {
    draft_id: string;
    garment_model_id: string;
    fabric_id: string;
    measurement_mode: 'saved' | 'manual' | 'offline';
    measurement_id: string;
    manual_label: string;
    chest: string;
    waist: string;
    hips: string;
    shoulder: string;
    sleeve_length: string;
    shirt_length: string;
    inseam: string;
    trouser_waist: string;
    manual_notes: string;
    qty: string;
    due_date: string;
    spec_notes: string;
    payment_amount: string;
    payment_reference_number: string;
    payment_notes: string;
    proof: File | null;
};

const steps = [
    {
        number: 1,
        title: 'Model',
        description: 'Pilih tipe garmen yang ingin dibuat.',
        icon: Shirt,
    },
    {
        number: 2,
        title: 'Bahan',
        description: 'Tentukan material dan adjustment harga.',
        icon: Palette,
    },
    {
        number: 3,
        title: 'Ukuran',
        description: 'Pakai ukuran tersimpan, manual, atau offline.',
        icon: Ruler,
    },
    {
        number: 4,
        title: 'Detail',
        description: 'Isi qty, target selesai, dan catatan spesifikasi.',
        icon: FileText,
    },
    {
        number: 5,
        title: 'Ringkasan',
        description: 'Baca subtotal, diskon, dan info DP minimum.',
        icon: Receipt,
    },
    {
        number: 6,
        title: 'Pembayaran',
        description: 'Transfer awal dan unggah bukti pembayaran.',
        icon: CreditCard,
    },
] as const;

export default function CustomerTailorConfigurator({
    garmentModels,
    fabrics,
    measurements,
    discountPolicy,
    customerMeta,
    draft,
}: Props) {
    const auth = usePage<{ auth: { user: User | null } }>().props.auth;
    const isCustomer = auth.user?.role === 'customer';
    const draftPayload = draft?.payload ?? {};
    const initialState = createInitialState({
        garmentModels,
        fabrics,
        draftId: draft?.id ?? null,
        draftPayload,
    });
    const form = useForm<FormState>(initialState);
    const errorMap = form.errors as Record<string, string | undefined>;

    const selectedGarment = garmentModels.find(
        (garmentModel) => garmentModel.id.toString() === form.data.garment_model_id,
    );
    const selectedFabric = fabrics.find(
        (fabric) => fabric.id.toString() === form.data.fabric_id,
    );
    const quantity = Math.max(toNumber(form.data.qty), 1);
    const unitPrice = (selectedGarment?.base_price ?? 0) + (selectedFabric?.price_adjustment ?? 0);
    const subtotal = unitPrice * quantity;
    const discount = customerMeta?.is_loyalty_eligible
        ? subtotal * (discountPolicy.percent / 100)
        : 0;
    const total = Math.max(subtotal - discount, 0);
    const minimumDeposit = Math.ceil(total * 0.5);
    const latestDraft = form.data.draft_id ? Number(form.data.draft_id) : (draft?.id ?? null);
    const maxAccessibleStep = isCustomer ? 6 : 5;
    const [currentStep, setCurrentStep] = useState(
        Math.min(resolveInitialStep(initialState), maxAccessibleStep),
    );

    useEffect(() => {
        if (currentStep !== 6 || form.data.payment_amount !== '' || total <= 0) {
            return;
        }

        form.setData('payment_amount', minimumDeposit.toString());
    }, [currentStep, form, form.data.payment_amount, minimumDeposit, total]);

    const stepIsComplete = {
        1: Boolean(form.data.garment_model_id),
        2: Boolean(form.data.fabric_id),
        3: hasMeasurementSelection(form.data),
        4: quantity >= 1,
        5: total > 0,
        6: paymentStepIsComplete(form.data),
    } satisfies Record<number, boolean>;
    const currentStepKey = currentStep as keyof typeof stepIsComplete;
    const canMoveNext = currentStep < 6 && stepIsComplete[currentStepKey];
    const canSubmitOrder =
        stepIsComplete[1] &&
        stepIsComplete[2] &&
        stepIsComplete[3] &&
        stepIsComplete[4] &&
        stepIsComplete[6];
    const progress = (currentStep / steps.length) * 100;

    const submitDraft = () => {
        form.transform((data) => ({
            draft_id: data.draft_id ? Number(data.draft_id) : null,
            garment_model_id: data.garment_model_id ? Number(data.garment_model_id) : null,
            fabric_id: data.fabric_id ? Number(data.fabric_id) : null,
            measurement_mode: data.measurement_mode || null,
            measurement_id: data.measurement_id ? Number(data.measurement_id) : null,
            manual_measurement: buildManualMeasurement(data),
            qty: data.qty ? Number(data.qty) : null,
            due_date: data.due_date || null,
            spec_notes: data.spec_notes || null,
        }));

        form.post(customer.orders.draft.store().url, {
            preserveScroll: true,
        });
    };

    const submitOrder = () => {
        form.transform((data) => ({
            garment_model_id: Number(data.garment_model_id),
            fabric_id: Number(data.fabric_id),
            measurement_mode: data.measurement_mode,
            measurement_id: data.measurement_id ? Number(data.measurement_id) : null,
            manual_measurement: buildManualMeasurement(data),
            qty: Number(data.qty),
            due_date: data.due_date || null,
            spec_notes: data.spec_notes || null,
            payment: {
                method: 'transfer',
                amount: Number(data.payment_amount),
                reference_number: data.payment_reference_number,
                notes: data.payment_notes || null,
                proof: data.proof,
            },
        }));

        form.post(
            latestDraft !== null
                ? customer.orders.draft.submit(latestDraft).url
                : customer.orders.tailor.store().url,
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <CustomerLayout>
            <Head title="Konfigurasi Tailor" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)] md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#a34a2c]">
                            Tailor Configurator
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Susun order tailor customer dalam 6 tahap yang lebih jelas.
                        </h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            Preview harga di sini tetap mengikuti aturan backend. Final pricing dihitung ulang saat order disubmit.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="border-[#d8c8b3] bg-white/70">
                        <Link href={customer.services.tailor()}>
                            Detail layanan
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

                {!isCustomer && (
                    <Alert className="border-[#e6d8c7] bg-white">
                        <AlertCircle className="text-[#a34a2c]" />
                        <AlertTitle>Guest mode berhenti di ringkasan</AlertTitle>
                        <AlertDescription className="space-y-3 pt-3 text-sm leading-6">
                            <p>
                                Kamu bisa mengeksplor konfigurasi sampai Step 5. Step pembayaran dan submit order tetap membutuhkan login customer.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild size="sm">
                                    <Link href={login()}>Masuk</Link>
                                </Button>
                                <Button asChild size="sm" variant="outline" className="border-[#d8c8b3] bg-white/70">
                                    <Link href={register()}>Daftar Customer</Link>
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {customerMeta?.is_loyalty_eligible && (
                    <Alert className="border-[#eed8c4] bg-[#fff6ed]">
                        <Shirt className="text-[#a34a2c]" />
                        <AlertTitle>Diskon loyalitas aktif</AlertTitle>
                        <AlertDescription>
                            Akun ini sudah memenuhi syarat loyalitas. Preview ringkasan memakai diskon {discountPolicy.percent}%.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                        <CardHeader className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle>Wizard 6 langkah</CardTitle>
                                    <CardDescription>
                                        Setiap tahap menjaga form tetap terbaca tanpa menumpuk semua field sekaligus.
                                    </CardDescription>
                                </div>
                                <div className="rounded-full bg-[#f3e3d8] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#a34a2c]">
                                    Step {currentStep} / {steps.length}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="h-2 overflow-hidden rounded-full bg-[#efe5d8]">
                                    <div
                                        className="h-full rounded-full bg-[#1f1726] transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                                    {steps.map((step) => {
                                        const isActive = currentStep === step.number;
                                        const isLocked = step.number > maxAccessibleStep;
                                        const isDone = step.number < currentStep;

                                        return (
                                            <button
                                                key={step.number}
                                                type="button"
                                                disabled={isLocked}
                                                className={[
                                                    'rounded-2xl border px-4 py-4 text-left transition',
                                                    isActive
                                                        ? 'border-[#1f1726] bg-[#1f1726] text-[#f5f1e8]'
                                                        : 'border-[#eadfce] bg-[#fcfaf6] text-[#1f1726]',
                                                    isLocked ? 'cursor-not-allowed opacity-55' : '',
                                                ].join(' ')}
                                                onClick={() => setCurrentStep(step.number)}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <step.icon className="size-4" />
                                                    {isLocked ? (
                                                        <Lock className="size-4" />
                                                    ) : isDone ? (
                                                        <Check className="size-4" />
                                                    ) : (
                                                        <span className="text-xs font-semibold">0{step.number}</span>
                                                    )}
                                                </div>
                                                <p className="mt-4 text-sm font-semibold">{step.title}</p>
                                                <p className={isActive ? 'mt-1 text-xs text-[#d8c8d7]' : 'mt-1 text-xs text-slate-500'}>
                                                    {step.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-lg font-semibold">Step 1 — Pilih model garmen</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Model menjadi baseline harga dan arah potongan sebelum customer masuk ke pilihan bahan.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {garmentModels.map((garmentModel) => {
                                            const isSelected = form.data.garment_model_id === garmentModel.id.toString();

                                            return (
                                                <button
                                                    key={garmentModel.id}
                                                    type="button"
                                                    className={[
                                                        'rounded-[1.75rem] border p-5 text-left transition',
                                                        isSelected
                                                            ? 'border-[#1f1726] bg-[#1f1726] text-[#f5f1e8] shadow-[0_24px_70px_rgba(31,23,38,0.14)]'
                                                            : 'border-[#eadfce] bg-[#fcfaf6] hover:border-[#cbbca6]',
                                                    ].join(' ')}
                                                    onClick={() => form.setData('garment_model_id', garmentModel.id.toString())}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className={isSelected ? 'rounded-2xl bg-white/10 p-3' : 'rounded-2xl bg-[#f3e3d8] p-3 text-[#a34a2c]'}>
                                                            <Shirt className="size-5" />
                                                        </div>
                                                        <span className={isSelected ? 'text-sm font-medium text-[#f0d9c4]' : 'text-sm font-medium text-[#a34a2c]'}>
                                                            {formatCurrency(garmentModel.base_price)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-5 text-lg font-semibold">{garmentModel.name}</p>
                                                    <p className={isSelected ? 'mt-2 text-sm leading-6 text-[#d8c8d7]' : 'mt-2 text-sm leading-6 text-slate-600'}>
                                                        {garmentModel.description ?? 'Model aktif siap dipakai untuk custom order.'}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={form.errors.garment_model_id} />
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-lg font-semibold">Step 2 — Pilih bahan</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Bahan mengubah karakter hasil akhir sekaligus adjustment harga per item.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {fabrics.map((fabric) => {
                                            const isSelected = form.data.fabric_id === fabric.id.toString();
                                            const priceLabel = fabric.price_adjustment === 0
                                                ? 'Tanpa adjustment'
                                                : `${fabric.price_adjustment > 0 ? '+' : '-'}${formatCurrency(Math.abs(fabric.price_adjustment))}`;

                                            return (
                                                <button
                                                    key={fabric.id}
                                                    type="button"
                                                    className={[
                                                        'rounded-[1.75rem] border p-5 text-left transition',
                                                        isSelected
                                                            ? 'border-[#1f1726] bg-[#1f1726] text-[#f5f1e8] shadow-[0_24px_70px_rgba(31,23,38,0.14)]'
                                                            : 'border-[#eadfce] bg-[#fcfaf6] hover:border-[#cbbca6]',
                                                    ].join(' ')}
                                                    onClick={() => form.setData('fabric_id', fabric.id.toString())}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className={isSelected ? 'rounded-2xl bg-white/10 p-3' : 'rounded-2xl bg-[#f3e3d8] p-3 text-[#a34a2c]'}>
                                                            <Palette className="size-5" />
                                                        </div>
                                                        <span className={isSelected ? 'text-sm font-medium text-[#f0d9c4]' : 'text-sm font-medium text-[#a34a2c]'}>
                                                            {priceLabel}
                                                        </span>
                                                    </div>
                                                    <p className="mt-5 text-lg font-semibold">{fabric.name}</p>
                                                    <p className={isSelected ? 'mt-2 text-sm leading-6 text-[#d8c8d7]' : 'mt-2 text-sm leading-6 text-slate-600'}>
                                                        {fabric.description ?? 'Bahan aktif yang bisa dipakai untuk order customer.'}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={form.errors.fabric_id} />
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-lg font-semibold">Step 3 — Tentukan metode ukuran</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Customer bisa memakai ukuran tersimpan, input manual, atau menandai pengukuran offline di toko.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3">
                                        {[
                                            {
                                                value: 'saved',
                                                label: 'Ukuran tersimpan',
                                                description: 'Pilih data measurement yang sudah ada di library.',
                                            },
                                            {
                                                value: 'manual',
                                                label: 'Input manual',
                                                description: 'Masukkan ukuran baru dan simpan saat submit final.',
                                            },
                                            {
                                                value: 'offline',
                                                label: 'Ukur di toko',
                                                description: 'Lanjutkan order tanpa measurement digital saat ini.',
                                            },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                className={[
                                                    'rounded-2xl border px-4 py-4 text-left transition',
                                                    form.data.measurement_mode === option.value
                                                        ? 'border-[#1f1726] bg-[#1f1726] text-[#f5f1e8]'
                                                        : 'border-[#eadfce] bg-[#fcfaf6]',
                                                ].join(' ')}
                                                onClick={() =>
                                                    form.setData('measurement_mode', option.value as FormState['measurement_mode'])
                                                }
                                            >
                                                <p className="text-sm font-semibold">{option.label}</p>
                                                <p className={form.data.measurement_mode === option.value ? 'mt-2 text-xs leading-5 text-[#d8c8d7]' : 'mt-2 text-xs leading-5 text-slate-600'}>
                                                    {option.description}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={form.errors.measurement_mode} />

                                    {form.data.measurement_mode === 'saved' && (
                                        <div className="grid gap-2 rounded-[1.75rem] border border-[#eadfce] bg-[#fcfaf6] p-5">
                                            <Label htmlFor="measurement_id">Measurement library</Label>
                                            <select
                                                id="measurement_id"
                                                className="h-10 rounded-md border bg-transparent px-3 text-sm"
                                                value={form.data.measurement_id}
                                                onChange={(event) => form.setData('measurement_id', event.target.value)}
                                            >
                                                <option value="">Pilih ukuran</option>
                                                {measurements.map((measurement) => (
                                                    <option key={measurement.id} value={measurement.id}>
                                                        {measurement.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {measurements.length === 0 && (
                                                <p className="text-sm leading-6 text-slate-600">
                                                    Belum ada ukuran tersimpan. Tambahkan lewat halaman{' '}
                                                    <Link className="font-medium text-[#a34a2c]" href={customer.measurements.index()}>
                                                        measurement library
                                                    </Link>
                                                    {' '}atau pindah ke input manual.
                                                </p>
                                            )}
                                            <InputError message={form.errors.measurement_id} />
                                        </div>
                                    )}

                                    {form.data.measurement_mode === 'manual' && (
                                        <div className="grid gap-4 rounded-[1.75rem] border border-[#eadfce] bg-[#fcfaf6] p-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="manual_label">Label ukuran</Label>
                                                <Input
                                                    id="manual_label"
                                                    value={form.data.manual_label}
                                                    onChange={(event) => form.setData('manual_label', event.target.value)}
                                                    placeholder="Contoh: Kemeja kerja April"
                                                />
                                                <InputError message={errorMap['manual_measurement.label']} />
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                {measurementFields.map((field) => (
                                                    <div key={field.key} className="grid gap-2">
                                                        <Label htmlFor={field.key}>{field.label}</Label>
                                                        <Input
                                                            id={field.key}
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={form.data[field.key]}
                                                            onChange={(event) => form.setData(field.key, event.target.value)}
                                                        />
                                                        <InputError message={errorMap[`manual_measurement.${field.key}`]} />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="manual_notes">Catatan ukuran</Label>
                                                <textarea
                                                    id="manual_notes"
                                                    className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm"
                                                    value={form.data.manual_notes}
                                                    onChange={(event) => form.setData('manual_notes', event.target.value)}
                                                />
                                                <InputError message={errorMap['manual_measurement.notes']} />
                                            </div>
                                        </div>
                                    )}

                                    {form.data.measurement_mode === 'offline' && (
                                        <div className="rounded-[1.75rem] border border-dashed border-[#d8c8b3] bg-[#fcfaf6] p-5 text-sm leading-6 text-slate-600">
                                            Measurement digital tidak akan dibuat saat ini. Order tetap bisa dilanjutkan dan office akan menandai pengukuran offline saat proses berjalan.
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-lg font-semibold">Step 4 — Isi detail order</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Atur quantity, target selesai, dan catatan spesifikasi agar office menerima brief yang lebih rapi.
                                        </p>
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="qty">Qty</Label>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="border-[#d8c8b3] bg-white/70"
                                                    onClick={() =>
                                                        form.setData('qty', Math.max(quantity - 1, 1).toString())
                                                    }
                                                >
                                                    -
                                                </Button>
                                                <Input
                                                    id="qty"
                                                    type="number"
                                                    min="1"
                                                    value={form.data.qty}
                                                    onChange={(event) => form.setData('qty', event.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="border-[#d8c8b3] bg-white/70"
                                                    onClick={() => form.setData('qty', (quantity + 1).toString())}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            <InputError message={form.errors.qty} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="due_date">Target selesai</Label>
                                            <Input
                                                id="due_date"
                                                type="date"
                                                value={form.data.due_date}
                                                onChange={(event) => form.setData('due_date', event.target.value)}
                                            />
                                            <InputError message={form.errors.due_date} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="spec_notes">Catatan spesifikasi</Label>
                                        <textarea
                                            id="spec_notes"
                                            className="min-h-32 rounded-md border bg-transparent px-3 py-2 text-sm"
                                            value={form.data.spec_notes}
                                            onChange={(event) => form.setData('spec_notes', event.target.value)}
                                            placeholder="Warna, model kerah, preferensi fit, bordir, dan detail lain."
                                        />
                                        <InputError message={form.errors.spec_notes} />
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-lg font-semibold">Step 5 — Ringkasan order</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Tahap ini membantu customer membaca total biaya sebelum pindah ke pembayaran transfer.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-[1.75rem] border border-[#eadfce] bg-[#fcfaf6] p-5">
                                            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                                                Komposisi order
                                            </p>
                                            <div className="mt-4 space-y-3 text-sm">
                                                <SummaryLine label="Model" value={selectedGarment?.name ?? '-'} />
                                                <SummaryLine label="Bahan" value={selectedFabric?.name ?? '-'} />
                                                <SummaryLine label="Harga satuan" value={formatCurrency(unitPrice)} />
                                                <SummaryLine label="Qty" value={quantity.toString()} />
                                                <SummaryLine label="Subtotal" value={formatCurrency(subtotal)} />
                                                <SummaryLine
                                                    label="Diskon loyalitas"
                                                    value={discount > 0 ? `-${formatCurrency(discount)}` : 'Belum aktif'}
                                                />
                                                <div className="border-t border-[#eadfce] pt-3">
                                                    <SummaryLine label="Total order" strong value={formatCurrency(total)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 rounded-[1.75rem] bg-[#1f1726] p-5 text-[#f5f1e8]">
                                            <div>
                                                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d8c8d7]">
                                                    Pembayaran awal
                                                </p>
                                                <p className="mt-3 text-3xl font-semibold">
                                                    {minimumDeposit > 0 ? formatCurrency(minimumDeposit) : '-'}
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-[#d8c8d7]">
                                                    Informasi DP minimum 50% ditampilkan sebagai acuan customer sebelum masuk ke step pembayaran.
                                                </p>
                                            </div>

                                            {customerMeta?.is_loyalty_eligible ? (
                                                <div className="rounded-2xl bg-white/8 p-4 text-sm leading-6 text-[#e7dde6]">
                                                    Loyalty aktif setelah {customerMeta.loyalty_order_count} order tailor closed. Sistem saat ini menerapkan diskon {discountPolicy.percent}%.
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl bg-white/8 p-4 text-sm leading-6 text-[#e7dde6]">
                                                    Threshold loyalitas saat ini: {discountPolicy.threshold} order tailor closed.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!isCustomer && (
                                        <div className="rounded-[1.75rem] border border-dashed border-[#d8c8b3] bg-[#fcfaf6] p-5 text-sm leading-6 text-slate-600">
                                            Step pembayaran hanya tersedia setelah login customer. Konfigurasi yang sedang dibaca di sini belum bisa disimpan sebagai draft guest.
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 6 && (
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-lg font-semibold">Step 6 — Pembayaran awal</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Portal customer saat ini hanya menerima transfer. Setelah bukti dikirim, office akan memverifikasi pembayaran.
                                        </p>
                                    </div>

                                    <div className="rounded-[1.75rem] border border-[#eadfce] bg-[#fcfaf6] p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium">Metode pembayaran customer</p>
                                                <p className="text-sm text-slate-600">
                                                    Flow customer portal dibatasi ke transfer.
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-[#f3e3d8] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#a34a2c]">
                                                Transfer
                                            </span>
                                        </div>

                                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="payment_amount">Nominal transfer</Label>
                                                <Input
                                                    id="payment_amount"
                                                    type="number"
                                                    min="1"
                                                    value={form.data.payment_amount}
                                                    onChange={(event) => form.setData('payment_amount', event.target.value)}
                                                />
                                                <p className="text-xs text-slate-500">
                                                    Acuan DP minimum saat ini {formatCurrency(minimumDeposit)}.
                                                </p>
                                                <InputError message={errorMap['payment.amount']} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="payment_reference_number">Nomor referensi</Label>
                                                <Input
                                                    id="payment_reference_number"
                                                    value={form.data.payment_reference_number}
                                                    onChange={(event) => form.setData('payment_reference_number', event.target.value)}
                                                    placeholder="TRX-12345"
                                                />
                                                <InputError message={errorMap['payment.reference_number']} />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2">
                                            <Label htmlFor="proof">Bukti transfer</Label>
                                            <Input
                                                id="proof"
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={(event) => form.setData('proof', event.target.files?.[0] ?? null)}
                                            />
                                            <InputError message={errorMap['payment.proof']} />
                                        </div>

                                        <div className="mt-4 grid gap-2">
                                            <Label htmlFor="payment_notes">Catatan pembayaran</Label>
                                            <textarea
                                                id="payment_notes"
                                                className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm"
                                                value={form.data.payment_notes}
                                                onChange={(event) => form.setData('payment_notes', event.target.value)}
                                            />
                                            <InputError message={errorMap['payment.notes']} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 border-t border-[#f0e6da] pt-6 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-[#d8c8b3] bg-white/70"
                                        disabled={currentStep === 1}
                                        onClick={() => setCurrentStep((step) => Math.max(step - 1, 1))}
                                    >
                                        <ChevronLeft className="size-4" />
                                        Kembali
                                    </Button>

                                    {isCustomer && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-[#d8c8b3] bg-white/70"
                                            disabled={form.processing}
                                            onClick={submitDraft}
                                        >
                                            <Save className="size-4" />
                                            Simpan Draft
                                        </Button>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {!isCustomer && currentStep === 5 ? (
                                        <>
                                            <Button asChild>
                                                <Link href={login()}>Masuk untuk bayar</Link>
                                            </Button>
                                            <Button asChild variant="outline" className="border-[#d8c8b3] bg-white/70">
                                                <Link href={register()}>Daftar Customer</Link>
                                            </Button>
                                        </>
                                    ) : currentStep < 6 ? (
                                        <Button
                                            type="button"
                                            disabled={!canMoveNext}
                                            onClick={() =>
                                                setCurrentStep((step) => Math.min(step + 1, maxAccessibleStep))
                                            }
                                        >
                                            Lanjut
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            disabled={form.processing || !canSubmitOrder}
                                            onClick={submitOrder}
                                        >
                                            {latestDraft !== null ? 'Submit Draft' : 'Submit Order'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-[#1f1726] text-[#f5f1e8] shadow-[0_20px_80px_rgba(31,23,38,0.18)]">
                        <CardHeader>
                            <CardTitle>Ringkasan backend pricing</CardTitle>
                            <CardDescription className="text-[#d8c8d7]">
                                Panel ini tetap terlihat di semua step agar customer tidak kehilangan konteks total biaya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 text-sm">
                            <div className="rounded-2xl bg-white/8 p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8c8d7]">
                                    Step aktif
                                </p>
                                <p className="mt-3 text-lg font-semibold">
                                    {steps[currentStep - 1].title}
                                </p>
                                <p className="mt-2 leading-6 text-[#d8c8d7]">
                                    {steps[currentStep - 1].description}
                                </p>
                            </div>

                            <SummaryLine dark label="Model" value={selectedGarment?.name ?? '-'} />
                            <SummaryLine dark label="Bahan" value={selectedFabric?.name ?? '-'} />
                            <SummaryLine dark label="Base price" value={formatCurrency(selectedGarment?.base_price ?? 0)} />
                            <SummaryLine dark label="Adjustment bahan" value={formatCurrency(selectedFabric?.price_adjustment ?? 0)} />
                            <SummaryLine dark label="Harga satuan" value={formatCurrency(unitPrice)} />
                            <SummaryLine dark label="Qty" value={quantity.toString()} />
                            <SummaryLine dark label="Subtotal" value={formatCurrency(subtotal)} />
                            <SummaryLine
                                dark
                                label="Diskon loyalitas"
                                value={discount > 0 ? `-${formatCurrency(discount)}` : 'Belum aktif'}
                            />
                            <div className="border-t border-white/15 pt-4">
                                <SummaryLine dark label="Total order" strong value={formatCurrency(total)} />
                            </div>

                            <div className="rounded-2xl bg-white/8 p-4 text-sm leading-6 text-[#e7dde6]">
                                <p className="font-medium text-[#f5f1e8]">Catatan</p>
                                <ul className="mt-3 space-y-2">
                                    <li>Draft terakhir akan muncul kembali saat customer membuka halaman ini lagi.</li>
                                    <li>Ukuran manual disimpan sebagai measurement reusable setelah submit final.</li>
                                    <li>Portal customer saat ini menerima transfer, bukan cash.</li>
                                    <li>Threshold loyalitas: {discountPolicy.threshold} order tailor closed.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}

const measurementFields: Array<{
    key: keyof Pick<
        FormState,
        'chest' | 'waist' | 'hips' | 'shoulder' | 'sleeve_length' | 'shirt_length' | 'inseam' | 'trouser_waist'
    >;
    label: string;
}> = [
    { key: 'chest', label: 'Lingkar dada' },
    { key: 'waist', label: 'Lingkar pinggang' },
    { key: 'hips', label: 'Lingkar pinggul' },
    { key: 'shoulder', label: 'Lebar bahu' },
    { key: 'sleeve_length', label: 'Panjang lengan' },
    { key: 'shirt_length', label: 'Panjang baju' },
    { key: 'inseam', label: 'Inseam' },
    { key: 'trouser_waist', label: 'Pinggang celana' },
];

function SummaryLine({
    label,
    value,
    strong = false,
    dark = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
    dark?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className={dark ? 'text-[#d8c8d7]' : 'text-slate-600'}>{label}</span>
            <span
                className={
                    strong
                        ? dark
                            ? 'text-lg font-semibold text-[#f5f1e8]'
                            : 'text-lg font-semibold text-[#1f1726]'
                        : dark
                          ? 'font-medium text-[#f5f1e8]'
                          : 'font-medium text-[#1f1726]'
                }
            >
                {value}
            </span>
        </div>
    );
}

function createInitialState({
    garmentModels,
    fabrics,
    draftId,
    draftPayload,
}: {
    garmentModels: GarmentModelOption[];
    fabrics: FabricOption[];
    draftId: number | null;
    draftPayload: Record<string, unknown>;
}): FormState {
    const manualMeasurement = objectValue(draftPayload.manual_measurement);
    const payment = objectValue(draftPayload.payment);

    return {
        draft_id: draftId?.toString() ?? '',
        garment_model_id: stringValue(draftPayload.garment_model_id) ?? garmentModels[0]?.id.toString() ?? '',
        fabric_id: stringValue(draftPayload.fabric_id) ?? fabrics[0]?.id.toString() ?? '',
        measurement_mode: enumValue(draftPayload.measurement_mode),
        measurement_id: stringValue(draftPayload.measurement_id) ?? '',
        manual_label: stringValue(manualMeasurement.label) ?? '',
        chest: stringValue(manualMeasurement.chest) ?? '',
        waist: stringValue(manualMeasurement.waist) ?? '',
        hips: stringValue(manualMeasurement.hips) ?? '',
        shoulder: stringValue(manualMeasurement.shoulder) ?? '',
        sleeve_length: stringValue(manualMeasurement.sleeve_length) ?? '',
        shirt_length: stringValue(manualMeasurement.shirt_length) ?? '',
        inseam: stringValue(manualMeasurement.inseam) ?? '',
        trouser_waist: stringValue(manualMeasurement.trouser_waist) ?? '',
        manual_notes: stringValue(manualMeasurement.notes) ?? '',
        qty: stringValue(draftPayload.qty) ?? '1',
        due_date: stringValue(draftPayload.due_date) ?? '',
        spec_notes: stringValue(draftPayload.spec_notes) ?? '',
        payment_amount: stringValue(payment.amount) ?? '',
        payment_reference_number: stringValue(payment.reference_number) ?? '',
        payment_notes: stringValue(payment.notes) ?? '',
        proof: null,
    };
}

function buildManualMeasurement(data: FormState) {
    if (data.measurement_mode !== 'manual') {
        return null;
    }

    return {
        label: data.manual_label || null,
        chest: nullableNumber(data.chest),
        waist: nullableNumber(data.waist),
        hips: nullableNumber(data.hips),
        shoulder: nullableNumber(data.shoulder),
        sleeve_length: nullableNumber(data.sleeve_length),
        shirt_length: nullableNumber(data.shirt_length),
        inseam: nullableNumber(data.inseam),
        trouser_waist: nullableNumber(data.trouser_waist),
        notes: data.manual_notes || null,
    };
}

function hasMeasurementSelection(data: FormState): boolean {
    if (data.measurement_mode === 'saved') {
        return data.measurement_id !== '';
    }

    if (data.measurement_mode === 'manual') {
        return data.manual_label.trim() !== '';
    }

    return data.measurement_mode === 'offline';
}

function paymentStepIsComplete(data: FormState): boolean {
    return (
        data.payment_amount !== '' &&
        data.payment_reference_number.trim() !== '' &&
        data.proof !== null
    );
}

function resolveInitialStep(data: FormState): number {
    if (data.payment_reference_number !== '' || data.payment_amount !== '') {
        return 6;
    }

    if (data.spec_notes !== '' || data.due_date !== '' || data.qty !== '1') {
        return 5;
    }

    if (hasMeasurementSelection(data)) {
        return 4;
    }

    if (data.fabric_id !== '') {
        return 3;
    }

    if (data.garment_model_id !== '') {
        return 2;
    }

    return 1;
}

function nullableNumber(value: string): number | null {
    return value === '' ? null : Number(value);
}

function toNumber(value: string): number {
    return value === '' ? 0 : Number(value);
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function stringValue(value: unknown): string | null {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return value.toString();
    }

    return null;
}

function objectValue(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function enumValue(value: unknown): FormState['measurement_mode'] {
    if (value === 'manual' || value === 'offline' || value === 'saved') {
        return value;
    }

    return 'saved';
}
