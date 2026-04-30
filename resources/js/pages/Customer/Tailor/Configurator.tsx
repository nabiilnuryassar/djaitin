import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
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
    Scissors,
    ShieldCheck,
    Shirt,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { cn } from '@/lib/utils';
import customer from '@/routes/customer';
import { login, register } from '@/routes';
import tailorProfilePreviewImage from '../../../../images/generated/tailor-profile-preview.jpg';
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
    desired_fit: (typeof desiredFits)[number];
    occasion: (typeof occasions)[number];
    style_traits: string[];
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
        title: 'Identity',
        description: 'Bangun identitas gaya utama.',
        icon: Shirt,
    },
    {
        number: 2,
        title: 'Silhouette',
        description: 'Pilih bahan dan arah potongan.',
        icon: Scissors,
    },
    {
        number: 3,
        title: 'Fabric',
        description: 'Tentukan metode ukuran.',
        icon: Palette,
    },
    {
        number: 4,
        title: 'Measures',
        description: 'Isi detail order dan brief.',
        icon: Ruler,
    },
    {
        number: 5,
        title: 'Details',
        description: 'Cek ringkasan dan estimasi.',
        icon: FileText,
    },
    {
        number: 6,
        title: 'Finalize',
        description: 'Lengkapi pembayaran awal.',
        icon: CreditCard,
    },
] as const;

const desiredFits = ['Slim', 'Regular', 'Relaxed'] as const;
const occasions = ['Office', 'Wedding', 'Daily', 'Event', 'Uniform'] as const;
const characterTraits = ['Wibawa', 'Kreatif', 'Efisien', 'Inovatif'] as const;

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
    const maxAccessibleStep = isCustomer ? 6 : 5;
    const [currentStep, setCurrentStep] = useState(
        Math.min(resolveInitialStep(initialState), maxAccessibleStep),
    );
    const selectedGarment = garmentModels.find(
        (garmentModel) =>
            garmentModel.id.toString() === form.data.garment_model_id,
    );
    const selectedFabric = fabrics.find(
        (fabric) => fabric.id.toString() === form.data.fabric_id,
    );
    const quantity = Math.max(toNumber(form.data.qty), 1);
    const unitPrice =
        (selectedGarment?.base_price ?? 0) +
        (selectedFabric?.price_adjustment ?? 0);
    const subtotal = unitPrice * quantity;
    const discount = customerMeta?.is_loyalty_eligible
        ? subtotal * (discountPolicy.percent / 100)
        : 0;
    const total = Math.max(subtotal - discount, 0);
    const minimumDeposit = Math.ceil(total * 0.5);
    const paymentAmount = toNumber(form.data.payment_amount);
    const depositMeetsMinimum =
        total > 0 && paymentAmount >= minimumDeposit;
    const latestDraft = form.data.draft_id
        ? Number(form.data.draft_id)
        : (draft?.id ?? null);
    const identityCards = buildIdentityCards(garmentModels);
    const selectedIdentity =
        identityCards.find(
            (card) => card.id.toString() === form.data.garment_model_id,
        ) ?? identityCards[0];
    const progress = (currentStep / steps.length) * 100;

    useEffect(() => {
        if (
            currentStep !== 6 ||
            form.data.payment_amount !== '' ||
            total <= 0
        ) {
            return;
        }

        form.setData('payment_amount', minimumDeposit.toString());
    }, [currentStep, form, form.data.payment_amount, minimumDeposit, total]);

    const stepIsComplete = {
        1:
            Boolean(form.data.garment_model_id) &&
            form.data.occasion !== '' &&
            form.data.style_traits.length > 0,
        2: Boolean(form.data.fabric_id),
        3: hasMeasurementSelection(form.data),
        4: quantity >= 1,
        5: total > 0,
        6: paymentStepIsComplete(form.data) && depositMeetsMinimum,
    } satisfies Record<number, boolean>;
    const currentStepKey = currentStep as keyof typeof stepIsComplete;
    const canMoveNext = currentStep < 6 && stepIsComplete[currentStepKey];
    const canSubmitOrder =
        stepIsComplete[1] &&
        stepIsComplete[2] &&
        stepIsComplete[3] &&
        stepIsComplete[4] &&
        stepIsComplete[6];

    const submitDraft = () => {
        form.transform((data) => ({
            draft_id: data.draft_id ? Number(data.draft_id) : null,
            garment_model_id: data.garment_model_id
                ? Number(data.garment_model_id)
                : null,
            fabric_id: data.fabric_id ? Number(data.fabric_id) : null,
            wizard_preferences: {
                desired_fit: data.desired_fit,
                occasion: data.occasion,
                style_traits: data.style_traits,
            },
            measurement_mode: data.measurement_mode || null,
            measurement_id: data.measurement_id
                ? Number(data.measurement_id)
                : null,
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
            wizard_preferences: {
                desired_fit: data.desired_fit,
                occasion: data.occasion,
                style_traits: data.style_traits,
            },
            measurement_mode: data.measurement_mode,
            measurement_id: data.measurement_id
                ? Number(data.measurement_id)
                : null,
            manual_measurement: buildManualMeasurement(data),
            qty: Number(data.qty),
            due_date: data.due_date || null,
            spec_notes: buildSpecNotes(data, selectedIdentity?.title ?? null),
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
                <section className="space-y-3">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="space-y-3">
                            <h1 className="[font-family:var(--font-heading)] text-4xl font-semibold tracking-tight text-[#1a243d] md:text-5xl">
                                Bangun Gaya Tailor Anda
                            </h1>
                            <p className="max-w-3xl text-base leading-7 text-slate-600">
                                Mulailah perjalanan personalisasi pakaian Anda.
                                Pilih identitas yang mencerminkan karakter dan
                                biarkan Djaitin menyusun detail teknisnya.
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 rounded-full border-[#dbe4f5] bg-white px-5 text-[#1d5fd3] hover:bg-[#f3f7ff] hover:text-[#1d5fd3]"
                        >
                            <Link href={customer.services.tailor()}>
                                Detail layanan
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-[28px] border border-[#dbe4f5] bg-white px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.05)]">
                        <div className="relative">
                            <div className="absolute top-5 right-6 left-6 hidden h-px bg-[#e8eef8] md:block" />
                            <div
                                className="absolute top-5 left-6 hidden h-px bg-[#1d5fd3] transition-all md:block"
                                style={{ width: `calc(${progress}% - 1.5rem)` }}
                            />
                            <div className="relative grid gap-3 md:grid-cols-6">
                                {steps.map((step) => {
                                    const isActive =
                                        currentStep === step.number;
                                    const isDone = currentStep > step.number;
                                    const isLocked =
                                        step.number > maxAccessibleStep;

                                    return (
                                        <button
                                            key={step.number}
                                            type="button"
                                            disabled={isLocked}
                                            className="group flex flex-col items-center gap-2 text-center"
                                            onClick={() =>
                                                !isLocked &&
                                                setCurrentStep(step.number)
                                            }
                                        >
                                            <div
                                                className={cn(
                                                    'relative z-10 flex size-10 items-center justify-center rounded-full border bg-[#f3f6fb] text-slate-400 transition',
                                                    isActive &&
                                                        'border-[#1d5fd3] bg-[#1d5fd3] text-white shadow-[0_12px_30px_rgba(29,95,211,0.3)]',
                                                    isDone &&
                                                        'border-[#d9e7ff] bg-[#eaf2ff] text-[#1d5fd3]',
                                                    isLocked && 'opacity-50',
                                                )}
                                            >
                                                {isLocked ? (
                                                    <Lock className="size-4" />
                                                ) : isDone ? (
                                                    <Check className="size-4" />
                                                ) : (
                                                    <step.icon className="size-4" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p
                                                    className={cn(
                                                        'text-[11px] font-semibold tracking-[0.16em] uppercase',
                                                        isActive
                                                            ? 'text-[#1d5fd3]'
                                                            : 'text-slate-400',
                                                    )}
                                                >
                                                    {step.title}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {!isCustomer && (
                    <Alert className="rounded-[24px] border-[#e5d8c7] bg-white">
                        <AlertCircle className="text-[#d1781d]" />
                        <AlertTitle>
                            Guest mode berhenti di ringkasan
                        </AlertTitle>
                        <AlertDescription className="space-y-3 pt-3 text-sm leading-6 text-slate-600">
                            <p>
                                Kamu bisa mengeksplor konfigurasi hingga step
                                review. Step pembayaran dan submit order tetap
                                membutuhkan login customer.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild size="sm">
                                    <Link href={login()}>Masuk</Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="border-[#dbe4f5] bg-white text-[#1d5fd3] hover:bg-[#f3f7ff] hover:text-[#1d5fd3]"
                                >
                                    <Link href={register()}>
                                        Daftar Customer
                                    </Link>
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {customerMeta?.is_loyalty_eligible && (
                    <Alert className="rounded-[24px] border-[#f2e1b9] bg-[#fff9ef]">
                        <Sparkles className="text-[#f4b21a]" />
                        <AlertTitle>Diskon loyalitas aktif</AlertTitle>
                        <AlertDescription className="text-sm leading-6 text-slate-600">
                            Akun ini sudah memenuhi syarat loyalitas. Preview
                            ringkasan menggunakan diskon{' '}
                            {discountPolicy.percent}% dari total tailor aktif.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_340px]">
                    <div className="space-y-6">
                        {currentStep === 1 && (
                            <>
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#1a243d]">
                                            1. Pilih Identitas Gaya
                                        </h2>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {identityCards.map((card, index) => {
                                            const isSelected =
                                                form.data.garment_model_id ===
                                                card.id.toString();

                                            return (
                                                <button
                                                    key={card.id}
                                                    type="button"
                                                    className={cn(
                                                        'relative rounded-[26px] border bg-white p-6 text-left shadow-[0_18px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#cfdcf5]',
                                                        isSelected
                                                            ? 'border-[#1d5fd3] shadow-[0_16px_45px_rgba(29,95,211,0.18)]'
                                                            : 'border-[#e6ecf5]',
                                                    )}
                                                    onClick={() =>
                                                        form.setData(
                                                            'garment_model_id',
                                                            card.id.toString(),
                                                        )
                                                    }
                                                >
                                                    {index === 0 && (
                                                        <span className="absolute top-5 right-5 rounded-full bg-[#f4b21a] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-white uppercase">
                                                            Most Popular
                                                        </span>
                                                    )}
                                                    <div className="flex size-11 items-center justify-center rounded-full bg-[#f3f6fb] text-[#1d5fd3]">
                                                        <card.icon className="size-5" />
                                                    </div>
                                                    <h3 className="mt-6 text-xl font-semibold text-[#1a243d]">
                                                        {card.title}
                                                    </h3>
                                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                                        {card.description}
                                                    </p>
                                                    <div className="mt-5 flex flex-wrap gap-2">
                                                        {card.traits.map(
                                                            (trait) => (
                                                                <span
                                                                    key={trait}
                                                                    className="rounded-full bg-[#f4f7fc] px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase"
                                                                >
                                                                    {trait}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError
                                        message={form.errors.garment_model_id}
                                    />
                                </section>

                                <ActionStrip
                                    currentStep={currentStep}
                                    maxAccessibleStep={maxAccessibleStep}
                                />

                                <section className="rounded-[28px] border border-[#e6ecf5] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                                    <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#1a243d]">
                                        2. Detail Karakter & Fit
                                    </h2>
                                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                        <PreferenceGroup title="Occasion">
                                            <div className="flex flex-wrap gap-2">
                                                {occasions.map((occasion) => (
                                                    <button
                                                        key={occasion}
                                                        type="button"
                                                        className={cn(
                                                            'rounded-full border px-4 py-2 text-sm font-medium transition',
                                                            form.data
                                                                .occasion ===
                                                                occasion
                                                                ? 'border-[#1d5fd3] bg-[#eef4ff] text-[#1d5fd3]'
                                                                : 'border-[#e6ecf5] bg-white text-slate-500 hover:bg-[#f8fbff]',
                                                        )}
                                                        onClick={() =>
                                                            form.setData(
                                                                'occasion',
                                                                occasion,
                                                            )
                                                        }
                                                    >
                                                        {occasion}
                                                    </button>
                                                ))}
                                            </div>
                                        </PreferenceGroup>
                                        <PreferenceGroup title="Desired Fit">
                                            <div className="flex flex-wrap gap-2">
                                                {desiredFits.map((fit) => (
                                                    <button
                                                        key={fit}
                                                        type="button"
                                                        className={cn(
                                                            'rounded-full px-4 py-2 text-sm font-semibold transition',
                                                            form.data
                                                                .desired_fit ===
                                                                fit
                                                                ? 'bg-[#1d5fd3] text-white shadow-[0_10px_24px_rgba(29,95,211,0.2)]'
                                                                : 'bg-[#f4f7fc] text-slate-500 hover:bg-[#ebf1fb]',
                                                        )}
                                                        onClick={() =>
                                                            form.setData(
                                                                'desired_fit',
                                                                fit,
                                                            )
                                                        }
                                                    >
                                                        {fit}
                                                    </button>
                                                ))}
                                            </div>
                                        </PreferenceGroup>
                                        <PreferenceGroup title="Karakter Utama">
                                            <div className="flex flex-wrap gap-2">
                                                {characterTraits.map(
                                                    (trait) => {
                                                        const isActive =
                                                            form.data.style_traits.includes(
                                                                trait,
                                                            );

                                                        return (
                                                            <button
                                                                key={trait}
                                                                type="button"
                                                                className={cn(
                                                                    'rounded-full border px-4 py-2 text-sm font-medium transition',
                                                                    isActive
                                                                        ? 'border-[#f4b21a] bg-[#fff7e8] text-[#9f6b08]'
                                                                        : 'border-[#e6ecf5] bg-white text-slate-500 hover:bg-[#f8fbff]',
                                                                )}
                                                                onClick={() =>
                                                                    form.setData(
                                                                        'style_traits',
                                                                        form.data.style_traits.includes(
                                                                            trait,
                                                                        )
                                                                            ? form.data.style_traits.filter(
                                                                                  (
                                                                                      item,
                                                                                  ) =>
                                                                                      item !==
                                                                                      trait,
                                                                              )
                                                                            : [
                                                                                  ...form
                                                                                      .data
                                                                                      .style_traits,
                                                                                  trait,
                                                                              ],
                                                                    )
                                                                }
                                                            >
                                                                {trait}
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </PreferenceGroup>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#1a243d]">
                                            3. Pratinjau Tekstur Fabric
                                        </h2>
                                        <Link
                                            href={customer.catalog.index()}
                                            className="text-sm font-semibold text-[#1d5fd3]"
                                        >
                                            Lihat Katalog
                                        </Link>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                        {fabrics.slice(0, 4).map((fabric) => {
                                            const isSelected =
                                                form.data.fabric_id ===
                                                fabric.id.toString();

                                            return (
                                                <button
                                                    key={fabric.id}
                                                    type="button"
                                                    className={cn(
                                                        'overflow-hidden rounded-[24px] border bg-white text-left shadow-[0_16px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5',
                                                        isSelected
                                                            ? 'border-[#1d5fd3] ring-2 ring-[#d8e7ff]'
                                                            : 'border-[#e6ecf5]',
                                                    )}
                                                    onClick={() =>
                                                        form.setData(
                                                            'fabric_id',
                                                            fabric.id.toString(),
                                                        )
                                                    }
                                                >
                                                    <div
                                                        className={cn(
                                                            'h-36 w-full',
                                                            fabricSwatchClassName(
                                                                fabric.name,
                                                            ),
                                                        )}
                                                    />
                                                    <div className="px-4 py-4">
                                                        <p className="font-semibold text-[#1a243d]">
                                                            {fabric.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {fabric.description ??
                                                                'Material aktif untuk tailor custom.'}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError
                                        message={form.errors.fabric_id}
                                    />
                                </section>
                            </>
                        )}

                        {currentStep === 2 && (
                            <StepCard
                                title="Step 2. Fabric & Silhouette"
                                description="Tentukan bahan utama untuk menegaskan jatuhnya struktur tailor Anda."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    {fabrics.map((fabric) => {
                                        const isSelected =
                                            form.data.fabric_id ===
                                            fabric.id.toString();

                                        return (
                                            <button
                                                key={fabric.id}
                                                type="button"
                                                className={cn(
                                                    'rounded-[24px] border bg-white p-5 text-left transition',
                                                    isSelected
                                                        ? 'border-[#1d5fd3] shadow-[0_16px_45px_rgba(29,95,211,0.16)]'
                                                        : 'border-[#e6ecf5] hover:border-[#d4e1f7]',
                                                )}
                                                onClick={() =>
                                                    form.setData(
                                                        'fabric_id',
                                                        fabric.id.toString(),
                                                    )
                                                }
                                            >
                                                <div
                                                    className={cn(
                                                        'h-28 rounded-[18px]',
                                                        fabricSwatchClassName(
                                                            fabric.name,
                                                        ),
                                                    )}
                                                />
                                                <div className="mt-4 flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-[#1a243d]">
                                                            {fabric.name}
                                                        </p>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {fabric.description ??
                                                                'Bahan aktif untuk arah tailor yang lebih tajam.'}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#1d5fd3]">
                                                        {fabric.price_adjustment ===
                                                        0
                                                            ? 'Base'
                                                            : `${fabric.price_adjustment > 0 ? '+' : '-'}${formatCurrency(Math.abs(fabric.price_adjustment))}`}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={form.errors.fabric_id} />
                            </StepCard>
                        )}

                        {currentStep === 3 && (
                            <StepCard
                                title="Step 3. Measurement Route"
                                description="Pilih cara Djaitin membaca proporsi tubuh agar hasil tailor lebih presisi."
                            >
                                <div className="grid gap-3 md:grid-cols-3">
                                    {[
                                        {
                                            value: 'saved',
                                            label: 'Ukuran Tersimpan',
                                            description:
                                                'Pakai profil ukuran yang sudah ada di library customer.',
                                        },
                                        {
                                            value: 'manual',
                                            label: 'Input Manual',
                                            description:
                                                'Masukkan ukuran baru untuk dipakai pada order ini.',
                                        },
                                        {
                                            value: 'offline',
                                            label: 'Ukur Offline',
                                            description:
                                                'Lanjutkan order dan finalisasi pengukuran di toko.',
                                        },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={cn(
                                                'rounded-[24px] border p-5 text-left transition',
                                                form.data.measurement_mode ===
                                                    option.value
                                                    ? 'border-[#1d5fd3] bg-[#f5f9ff]'
                                                    : 'border-[#e6ecf5] bg-white',
                                            )}
                                            onClick={() =>
                                                form.setData(
                                                    'measurement_mode',
                                                    option.value as FormState['measurement_mode'],
                                                )
                                            }
                                        >
                                            <p className="font-semibold text-[#1a243d]">
                                                {option.label}
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                {option.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                <InputError
                                    message={form.errors.measurement_mode}
                                />

                                {form.data.measurement_mode === 'saved' && (
                                    <div className="rounded-[24px] border border-[#e6ecf5] bg-[#f9fbff] p-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="measurement_id">
                                                Measurement library
                                            </Label>
                                            <select
                                                id="measurement_id"
                                                className="h-11 rounded-xl border border-[#dbe4f5] bg-white px-3 text-sm"
                                                value={form.data.measurement_id}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'measurement_id',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Pilih ukuran
                                                </option>
                                                {measurements.map(
                                                    (measurement) => (
                                                        <option
                                                            key={measurement.id}
                                                            value={
                                                                measurement.id
                                                            }
                                                        >
                                                            {measurement.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            {measurements.length === 0 && (
                                                <p className="text-sm leading-6 text-slate-500">
                                                    Belum ada ukuran tersimpan.
                                                    Tambahkan lewat{' '}
                                                    <Link
                                                        href={customer.measurements.index()}
                                                        className="font-medium text-[#1d5fd3]"
                                                    >
                                                        measurement library
                                                    </Link>{' '}
                                                    atau pindah ke input manual.
                                                </p>
                                            )}
                                            <InputError
                                                message={
                                                    form.errors.measurement_id
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {form.data.measurement_mode === 'manual' && (
                                    <div className="rounded-[24px] border border-[#e6ecf5] bg-[#f9fbff] p-5">
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="manual_label">
                                                    Label ukuran
                                                </Label>
                                                <Input
                                                    id="manual_label"
                                                    value={
                                                        form.data.manual_label
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'manual_label',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: Kemeja kerja April"
                                                />
                                                <InputError
                                                    message={
                                                        errorMap[
                                                            'manual_measurement.label'
                                                        ]
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {measurementFields.map(
                                                    (field) => (
                                                        <div
                                                            key={field.key}
                                                            className="grid gap-2"
                                                        >
                                                            <Label
                                                                htmlFor={
                                                                    field.key
                                                                }
                                                            >
                                                                {field.label}
                                                            </Label>
                                                            <Input
                                                                id={field.key}
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={
                                                                    form.data[
                                                                        field
                                                                            .key
                                                                    ]
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    form.setData(
                                                                        field.key,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <InputError
                                                                message={
                                                                    errorMap[
                                                                        `manual_measurement.${field.key}`
                                                                    ]
                                                                }
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="manual_notes">
                                                    Catatan ukuran
                                                </Label>
                                                <textarea
                                                    id="manual_notes"
                                                    className="min-h-24 rounded-xl border border-[#dbe4f5] bg-white px-3 py-2 text-sm"
                                                    value={
                                                        form.data.manual_notes
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'manual_notes',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errorMap[
                                                            'manual_measurement.notes'
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {form.data.measurement_mode === 'offline' && (
                                    <div className="rounded-[24px] border border-dashed border-[#dbe4f5] bg-[#f9fbff] p-5 text-sm leading-6 text-slate-500">
                                        Measurement digital tidak dibuat saat
                                        ini. Djaitin akan menandai pengukuran
                                        offline saat order diproses oleh tim.
                                    </div>
                                )}
                            </StepCard>
                        )}

                        {currentStep === 4 && (
                            <StepCard
                                title="Step 4. Detail Order"
                                description="Isi kuantitas, target selesai, dan brief personal agar tim office menerima arahan yang lebih jelas."
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="qty">Qty</Label>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="border-[#dbe4f5] bg-white"
                                                onClick={() =>
                                                    form.setData(
                                                        'qty',
                                                        Math.max(
                                                            quantity - 1,
                                                            1,
                                                        ).toString(),
                                                    )
                                                }
                                            >
                                                -
                                            </Button>
                                            <Input
                                                id="qty"
                                                type="number"
                                                min="1"
                                                value={form.data.qty}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'qty',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="border-[#dbe4f5] bg-white"
                                                onClick={() =>
                                                    form.setData(
                                                        'qty',
                                                        (
                                                            quantity + 1
                                                        ).toString(),
                                                    )
                                                }
                                            >
                                                +
                                            </Button>
                                        </div>
                                        <InputError message={form.errors.qty} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="due_date">
                                            Target selesai
                                        </Label>
                                        <Input
                                            id="due_date"
                                            type="date"
                                            value={form.data.due_date}
                                            onChange={(event) =>
                                                form.setData(
                                                    'due_date',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={form.errors.due_date}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="spec_notes">
                                        Catatan spesifikasi
                                    </Label>
                                    <textarea
                                        id="spec_notes"
                                        className="min-h-36 rounded-xl border border-[#dbe4f5] bg-white px-3 py-2 text-sm"
                                        value={form.data.spec_notes}
                                        onChange={(event) =>
                                            form.setData(
                                                'spec_notes',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Warna, model kerah, preferensi fit, bordir, dan detail lain."
                                    />
                                    <InputError
                                        message={form.errors.spec_notes}
                                    />
                                </div>
                            </StepCard>
                        )}

                        {currentStep === 5 && (
                            <StepCard
                                title="Step 5. Review & Ringkasan"
                                description="Baca ulang seluruh komposisi order sebelum masuk ke pembayaran transfer."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-[24px] border border-[#e6ecf5] bg-[#f9fbff] p-5">
                                        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                            Komposisi Order
                                        </p>
                                        <div className="mt-4 space-y-3 text-sm">
                                            <SummaryLine
                                                label="Identity"
                                                value={
                                                    selectedIdentity?.title ??
                                                    '-'
                                                }
                                            />
                                            <SummaryLine
                                                label="Bahan"
                                                value={
                                                    selectedFabric?.name ?? '-'
                                                }
                                            />
                                            <SummaryLine
                                                label="Desired fit"
                                                value={form.data.desired_fit}
                                            />
                                            <SummaryLine
                                                label="Occasion"
                                                value={form.data.occasion}
                                            />
                                            <SummaryLine
                                                label="Trait"
                                                value={
                                                    form.data.style_traits.join(
                                                        ', ',
                                                    ) || '-'
                                                }
                                            />
                                            <SummaryLine
                                                label="Harga satuan"
                                                value={formatCurrency(
                                                    unitPrice,
                                                )}
                                            />
                                            <SummaryLine
                                                label="Qty"
                                                value={quantity.toString()}
                                            />
                                            <SummaryLine
                                                label="Subtotal"
                                                value={formatCurrency(subtotal)}
                                            />
                                            <SummaryLine
                                                label="Diskon loyalitas"
                                                value={
                                                    discount > 0
                                                        ? `-${formatCurrency(discount)}`
                                                        : 'Belum aktif'
                                                }
                                            />
                                            <div className="border-t border-[#e6ecf5] pt-3">
                                                <SummaryLine
                                                    label="Total order"
                                                    value={formatCurrency(
                                                        total,
                                                    )}
                                                    strong
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[24px] bg-[linear-gradient(180deg,#1d5fd3_0%,#1748a5_100%)] p-5 text-white">
                                        <p className="text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">
                                            Pembayaran Awal
                                        </p>
                                        <p className="mt-4 [font-family:var(--font-heading)] text-4xl font-semibold">
                                            {minimumDeposit > 0
                                                ? formatCurrency(minimumDeposit)
                                                : '-'}
                                        </p>
                                        <p className="mt-3 text-sm leading-6 text-white/80">
                                            Sistem menampilkan acuan DP minimum
                                            50% agar customer punya ekspektasi
                                            yang jelas sebelum unggah bukti
                                            transfer.
                                        </p>
                                        <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/80">
                                            {customerMeta?.is_loyalty_eligible
                                                ? `Loyalty aktif setelah ${customerMeta.loyalty_order_count} order tailor closed.`
                                                : `Diskon loyalitas aktif setelah lebih dari ${discountPolicy.threshold} order tailor closed.`}
                                        </div>
                                    </div>
                                </div>

                                {!isCustomer && (
                                    <div className="rounded-[24px] border border-dashed border-[#dbe4f5] bg-[#f9fbff] p-5 text-sm leading-6 text-slate-500">
                                        Step pembayaran hanya tersedia setelah
                                        login customer. Konfigurasi guest belum
                                        bisa disimpan sebagai draft.
                                    </div>
                                )}
                            </StepCard>
                        )}

                        {currentStep === 6 && (
                            <StepCard
                                title="Step 6. Finalize Pembayaran"
                                description="Portal customer saat ini hanya menerima transfer. Setelah bukti dikirim, office akan memverifikasi pembayaran."
                            >
                                <div className="rounded-[24px] border border-[#e6ecf5] bg-[#f9fbff] p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-[#1a243d]">
                                                Metode pembayaran customer
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Flow customer portal dibatasi ke
                                                transfer.
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-[#1d5fd3] px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-white uppercase">
                                            Transfer
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="payment_amount">
                                                Nominal transfer
                                            </Label>
                                            <Input
                                                id="payment_amount"
                                                type="number"
                                                min={minimumDeposit}
                                                value={form.data.payment_amount}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'payment_amount',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <p
                                                className={
                                                    depositMeetsMinimum
                                                        ? 'text-xs text-emerald-700'
                                                        : 'text-xs text-[#9F1239]'
                                                }
                                            >
                                                DP wajib minimal 50% dari total:{' '}
                                                {formatCurrency(minimumDeposit)}
                                                .
                                            </p>
                                            <InputError
                                                message={
                                                    errorMap['payment.amount']
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="payment_reference_number">
                                                Nomor referensi transfer
                                            </Label>
                                            <Input
                                                id="payment_reference_number"
                                                value={
                                                    form.data
                                                        .payment_reference_number
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'payment_reference_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: TRX-12345 atau nomor transaksi bank"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Isi dengan nomor transaksi dari
                                                bank, mobile banking, atau
                                                e-wallet yang muncul setelah
                                                transfer berhasil.
                                            </p>
                                            <InputError
                                                message={
                                                    errorMap[
                                                        'payment.reference_number'
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-2">
                                        <Label htmlFor="proof">
                                            Bukti transfer
                                        </Label>
                                        <Input
                                            id="proof"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(event) =>
                                                form.setData(
                                                    'proof',
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errorMap['payment.proof']}
                                        />
                                    </div>

                                    <div className="mt-4 grid gap-2">
                                        <Label htmlFor="payment_notes">
                                            Catatan pembayaran
                                        </Label>
                                        <textarea
                                            id="payment_notes"
                                            className="min-h-24 rounded-xl border border-[#dbe4f5] bg-white px-3 py-2 text-sm"
                                            value={form.data.payment_notes}
                                            onChange={(event) =>
                                                form.setData(
                                                    'payment_notes',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errorMap['payment.notes']}
                                        />
                                    </div>
                                </div>
                            </StepCard>
                        )}

                        <div className="sticky bottom-4 z-10 rounded-[28px] border border-[#e6ecf5] bg-white/94 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-full border-[#dbe4f5] bg-white"
                                        disabled={currentStep === 1}
                                        onClick={() =>
                                            setCurrentStep((step) =>
                                                Math.max(step - 1, 1),
                                            )
                                        }
                                    >
                                        <ChevronLeft className="size-4" />
                                        Back
                                    </Button>
                                    {isCustomer && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-full border-[#dbe4f5] bg-white text-[#1d5fd3] hover:bg-[#f3f7ff] hover:text-[#1d5fd3]"
                                            disabled={form.processing}
                                            onClick={submitDraft}
                                        >
                                            <Save className="size-4" />
                                            Simpan Draft
                                        </Button>
                                    )}
                                </div>

                                <div className="text-sm font-medium text-slate-500">
                                    Step {currentStep} dari {steps.length}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {!isCustomer && currentStep === 5 ? (
                                        <>
                                            <Button asChild>
                                                <Link href={login()}>
                                                    Masuk untuk bayar
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="rounded-full border-[#dbe4f5] bg-white text-[#1d5fd3] hover:bg-[#f3f7ff] hover:text-[#1d5fd3]"
                                            >
                                                <Link href={register()}>
                                                    Daftar Customer
                                                </Link>
                                            </Button>
                                        </>
                                    ) : currentStep < 6 ? (
                                        <Button
                                            type="button"
                                            className="rounded-full bg-[#1d5fd3] px-5 text-white hover:bg-[#174fb7]"
                                            disabled={!canMoveNext}
                                            onClick={() =>
                                                setCurrentStep((step) =>
                                                    Math.min(
                                                        step + 1,
                                                        maxAccessibleStep,
                                                    ),
                                                )
                                            }
                                        >
                                            {currentStep === 1
                                                ? 'Lanjut ke Silhouette & Fit'
                                                : 'Lanjut'}
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            className="rounded-full bg-[#1d5fd3] px-5 text-white hover:bg-[#174fb7]"
                                            disabled={
                                                form.processing ||
                                                !canSubmitOrder
                                            }
                                            onClick={submitOrder}
                                        >
                                            {latestDraft !== null
                                                ? 'Submit Draft'
                                                : 'Submit Order'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
                        <Card className="overflow-hidden rounded-[28px] border-[#e6ecf5] bg-white shadow-[0_22px_50px_rgba(15,23,42,0.06)]">
                            <CardHeader className="flex flex-row items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#1a243d]">
                                        Profil Tailor Anda
                                    </CardTitle>
                                </div>
                                <span className="rounded-full bg-[#fff2d6] px-2.5 py-1 text-[11px] font-semibold text-[#c48a10]">
                                    98% Match
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-[24px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_35%),linear-gradient(180deg,#3f4e67_0%,#253346_100%)] p-4">
                                    <div className="relative h-64 overflow-hidden rounded-[22px] border border-white/10 bg-[#162235]">
                                        <img
                                            src={tailorProfilePreviewImage}
                                            alt="Preview visual profil tailor Djaitin"
                                            className="h-full w-full object-cover object-center"
                                        />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_rgba(6,12,28,0.52)_100%)]" />
                                        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-[#071225]/70 px-3 py-2 text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
                                            <p className="text-[10px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                                                Live Preview
                                            </p>
                                            <p className="mt-1 text-sm font-medium">
                                                {selectedIdentity?.title ??
                                                    'Executive Sharp'}{' '}
                                                x {form.data.desired_fit} Fit
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    className="h-11 w-full rounded-full bg-[#1d5fd3] text-white hover:bg-[#174fb7]"
                                    disabled={currentStep >= maxAccessibleStep}
                                    onClick={() =>
                                        setCurrentStep((step) =>
                                            Math.min(
                                                step + 1,
                                                maxAccessibleStep,
                                            ),
                                        )
                                    }
                                >
                                    {currentStep === 1
                                        ? 'Lanjut ke Silhouette & Fit'
                                        : 'Lanjut ke Step Berikutnya'}
                                    <ArrowRight className="size-4" />
                                </Button>

                                <div className="space-y-3 rounded-[24px] bg-[#f7f9fd] p-4">
                                    <SummaryLine
                                        label="Bahan Utama"
                                        value={
                                            selectedFabric?.name ??
                                            'Royal Navy Merino'
                                        }
                                    />
                                    <SummaryLine
                                        label="Silhouette"
                                        value={selectedIdentity?.title ?? '-'}
                                    />
                                    <SummaryLine
                                        label="Fit"
                                        value={form.data.desired_fit}
                                    />
                                    <SummaryLine
                                        label="Occasion"
                                        value={form.data.occasion}
                                    />
                                    <SummaryLine
                                        label="Karakter"
                                        value={
                                            form.data.style_traits.join(', ') ||
                                            '-'
                                        }
                                    />
                                </div>

                                <div className="rounded-[24px] border border-[#dce8fb] bg-[#f5f9ff] p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-[#1d5fd3] text-white">
                                            <ShieldCheck className="size-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#1d5fd3]">
                                                Rekomendasi Djaitin
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                Djaitin merekomendasikan{' '}
                                                {selectedFabric?.name ??
                                                    'Wool Blend'}{' '}
                                                dengan layer yang rapi agar
                                                struktur tetap tegas pada gaya{' '}
                                                {selectedIdentity?.title ??
                                                    'Executive Sharp'}
                                                .
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[24px] bg-[#eef3fb] p-4 text-center">
                                    <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                        Estimasi Pengerjaan
                                    </p>
                                    <p className="mt-2 [font-family:var(--font-heading)] text-3xl font-semibold text-[#1a243d]">
                                        14 - 21 Hari Kerja
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </CustomerLayout>
    );
}

function StepCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4 rounded-[28px] border border-[#e6ecf5] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
            <div>
                <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#1a243d]">
                    {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>
            <div className="space-y-5">{children}</div>
        </section>
    );
}

function PreferenceGroup({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-[24px] bg-[#f4f7fc] p-5">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                {title}
            </p>
            <div className="mt-4">{children}</div>
        </div>
    );
}

function ActionStrip({
    currentStep,
    maxAccessibleStep,
}: {
    currentStep: number;
    maxAccessibleStep: number;
}) {
    return (
        <div className="rounded-[24px] border border-[#edf2fb] bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <ArrowLeft className="size-4" />
                    Back
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-[11px] font-semibold text-[#1d5fd3] uppercase">
                        Step {currentStep}
                    </span>
                    <span className="rounded-full bg-[#f4f7fc] px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase">
                        Max {maxAccessibleStep}
                    </span>
                </div>
                <div className="text-sm font-medium text-slate-400">
                    Progress terjaga
                </div>
            </div>
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
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">{label}</span>
            <span
                className={cn(
                    'text-right text-sm font-medium text-[#1a243d]',
                    strong && 'text-base font-semibold',
                )}
            >
                {value}
            </span>
        </div>
    );
}

const measurementFields: Array<{
    key: keyof Pick<
        FormState,
        | 'chest'
        | 'waist'
        | 'hips'
        | 'shoulder'
        | 'sleeve_length'
        | 'shirt_length'
        | 'inseam'
        | 'trouser_waist'
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

function buildIdentityCards(garmentModels: GarmentModelOption[]) {
    const fallbacks = [
        {
            title: 'Executive Sharp',
            description:
                'Dirancang untuk otoritas dan presisi profesional di ruang rapat.',
            traits: ['Power', 'Formal', 'Modern'],
            icon: ShieldCheck,
        },
        {
            title: 'Smart Casual',
            description:
                'Keseimbangan sempurna antara relaksasi dan profesionalisme modern.',
            traits: ['Fluid', 'Creative', 'Versatile'],
            icon: Sparkles,
        },
        {
            title: 'Heritage Formal',
            description:
                'Penghormatan terhadap tradisi dengan siluet berwibawa.',
            traits: ['Classic', 'Tailored', 'Elegant'],
            icon: Scissors,
        },
        {
            title: 'Minimalist Avant',
            description:
                'Garis-garis bersih dan struktur futuristik untuk tampilan tegas.',
            traits: ['Clean', 'Sharp', 'Confident'],
            icon: Ruler,
        },
    ];

    return garmentModels.slice(0, 4).map((garmentModel, index) => ({
        id: garmentModel.id,
        title: fallbacks[index]?.title ?? garmentModel.name,
        description:
            garmentModel.description ?? fallbacks[index]?.description ?? '',
        traits: fallbacks[index]?.traits ?? ['Tailor', 'Custom', 'Premium'],
        icon: fallbacks[index]?.icon ?? Shirt,
    }));
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
    const wizardPreferences = objectValue(draftPayload.wizard_preferences);

    return {
        draft_id: draftId?.toString() ?? '',
        garment_model_id:
            stringValue(draftPayload.garment_model_id) ??
            garmentModels[0]?.id.toString() ??
            '',
        fabric_id:
            stringValue(draftPayload.fabric_id) ??
            fabrics[0]?.id.toString() ??
            '',
        desired_fit: fitValue(wizardPreferences.desired_fit),
        occasion: occasionValue(wizardPreferences.occasion),
        style_traits: traitValues(wizardPreferences.style_traits),
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

function buildSpecNotes(
    data: FormState,
    identityLabel: string | null = null,
): string | null {
    const wizardLines = [
        `Identity: ${(identityLabel ?? data.garment_model_id) || '-'}`,
        `Desired fit: ${data.desired_fit}`,
        `Occasion: ${data.occasion}`,
        `Traits: ${data.style_traits.join(', ') || '-'}`,
    ];

    const customNotes = data.spec_notes.trim();

    return [...wizardLines, customNotes]
        .filter((line) => line !== '')
        .join('\n');
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

    if (
        data.garment_model_id !== '' &&
        data.occasion !== '' &&
        data.style_traits.length > 0
    ) {
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
    return typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : {};
}

function enumValue(value: unknown): FormState['measurement_mode'] {
    if (value === 'manual' || value === 'offline' || value === 'saved') {
        return value;
    }

    return 'saved';
}

function fitValue(value: unknown): FormState['desired_fit'] {
    return desiredFits.includes(value as FormState['desired_fit'])
        ? (value as FormState['desired_fit'])
        : 'Slim';
}

function occasionValue(value: unknown): FormState['occasion'] {
    return occasions.includes(value as FormState['occasion'])
        ? (value as FormState['occasion'])
        : 'Office';
}

function traitValues(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return ['Wibawa'];
    }

    const sanitized = value.filter((item): item is string =>
        characterTraits.includes(item as (typeof characterTraits)[number]),
    );

    return sanitized.length > 0 ? sanitized : ['Wibawa'];
}

function fabricSwatchClassName(name: string): string {
    const key = name.toLowerCase();

    if (key.includes('navy') || key.includes('royal')) {
        return 'bg-[radial-gradient(circle_at_left,_#f06d7b_0,_#f06d7b_18%,_#111e44_19%,_#0b122f_72%)]';
    }

    if (
        key.includes('linen') ||
        key.includes('sand') ||
        key.includes('cream')
    ) {
        return 'bg-[linear-gradient(135deg,_#e8dbba_0%,_#d7c49b_100%)]';
    }

    if (key.includes('velvet') || key.includes('black')) {
        return 'bg-[radial-gradient(circle_at_top_left,_#444_0,_#161616_45%,_#020202_100%)]';
    }

    return 'bg-[linear-gradient(135deg,_#171b2b_0%,_#2a334e_50%,_#101522_100%)]';
}
