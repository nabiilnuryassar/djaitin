import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    MapPinHouse,
    Pencil,
    Plus,
    Ruler,
    Star,
    UserCircle2,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import CustomerLayout from '@/layouts/customer-layout';
import { cn } from '@/lib/utils';
import customer from '@/routes/customer';
import type { SharedPageProps } from '@/types/auth';

type Address = {
    id: number;
    label: string;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string;
    province: string;
    postal_code: string | null;
    is_default: boolean;
};

type AddressForm = {
    label: string;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string;
    province: string;
    postal_code: string;
    is_default: boolean;
};

type Measurement = {
    id: number;
    label: string | null;
    chest: number | null;
    waist: number | null;
    hips: number | null;
    shoulder: number | null;
    sleeve_length: number | null;
    shirt_length: number | null;
    inseam: number | null;
    trouser_waist: number | null;
    notes: string | null;
};

type MeasurementForm = {
    label: string;
    chest: string;
    waist: string;
    hips: string;
    shoulder: string;
    sleeve_length: string;
    shirt_length: string;
    inseam: string;
    trouser_waist: string;
    notes: string;
};

type Props = {
    mustVerifyEmail: boolean;
    customer: {
        name: string;
        phone: string | null;
    };
    addresses: Address[];
    measurements: Measurement[];
};

export default function CustomerProfileEdit({
    mustVerifyEmail,
    customer: customerProfile,
    addresses,
    measurements,
}: Props) {
    const page = usePage<SharedPageProps>();
    const currentSection =
        new URL(page.url, 'http://localhost').searchParams.get('section') ??
        'profile';

    const profileForm = useForm({
        name: customerProfile.name,
        email: page.props.auth.user?.email ?? '',
        phone: customerProfile.phone ?? '',
    });

    return (
        <CustomerLayout>
            <Head title="Profil Saya" />

            <div className="space-y-6">
                <div className="rounded-[2rem] border border-[#DBEAFE] bg-gradient-to-br from-white to-[#EFF4FF] p-8 shadow-[0_20px_80px_rgba(37,99,235,0.08)]">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                            Account Center
                        </p>
                        <h1 className="[font-family:var(--font-heading)] text-3xl font-semibold tracking-tight text-[#0F172A]">
                            Profil, alamat, dan ukuran customer dalam satu
                            halaman.
                        </h1>
                        <p className="max-w-3xl text-sm leading-7 text-slate-600">
                            Semua pengaturan akun customer sekarang dipusatkan
                            di halaman profile agar perubahan data, alamat
                            kirim, dan measurement lebih ringkas untuk dikelola.
                        </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <SectionPill
                            active={currentSection === 'profile'}
                            href={customer.profile.edit({
                                query: { section: 'profile' },
                            })}
                            label="Profil"
                        />
                        <SectionPill
                            active={currentSection === 'addresses'}
                            href={customer.profile.edit({
                                query: { section: 'addresses' },
                            })}
                            label="Alamat"
                        />
                        <SectionPill
                            active={currentSection === 'measurements'}
                            href={customer.profile.edit({
                                query: { section: 'measurements' },
                            })}
                            label="Ukuran"
                        />
                    </div>
                </div>

                <Card
                    className={sectionCardClassName(
                        currentSection === 'profile',
                    )}
                >
                    <CardHeader>
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-[#EFF4FF] p-3 text-[#2563EB]">
                                <UserCircle2 className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                    Perbarui profil
                                </CardTitle>
                                <CardDescription className="text-sm leading-6 text-slate-600">
                                    {mustVerifyEmail
                                        ? 'Perubahan email akan meminta verifikasi ulang.'
                                        : 'Email tidak memerlukan verifikasi tambahan.'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                value={profileForm.data.name}
                                onChange={(event) =>
                                    profileForm.setData(
                                        'name',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={profileForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileForm.data.email}
                                onChange={(event) =>
                                    profileForm.setData(
                                        'email',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={profileForm.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">No. telepon</Label>
                            <Input
                                id="phone"
                                value={profileForm.data.phone}
                                onChange={(event) =>
                                    profileForm.setData(
                                        'phone',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={profileForm.errors.phone} />
                        </div>

                        <Button
                            type="button"
                            disabled={profileForm.processing}
                            onClick={() =>
                                profileForm.put(customer.profile.update().url, {
                                    preserveScroll: true,
                                })
                            }
                        >
                            Simpan perubahan
                        </Button>
                    </CardContent>
                </Card>

                <section className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.18em] text-[#2563EB] uppercase">
                                Alamat
                            </p>
                            <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#0F172A]">
                                Address book customer
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Alamat default tetap menyinkronkan field alamat
                                legacy customer untuk kompatibilitas office.
                            </p>
                        </div>
                        <CreateAddressSheet
                            defaultAddress={addresses.length === 0}
                        />
                    </div>

                    <div
                        className={cn(
                            'space-y-4 rounded-[2rem] p-1',
                            currentSection === 'addresses' && 'bg-[#EFF4FF]/70',
                        )}
                    >
                        {addresses.map((address) => (
                            <AddressCard key={address.id} address={address} />
                        ))}

                        {addresses.length === 0 && (
                            <Card
                                className={sectionCardClassName(
                                    currentSection === 'addresses',
                                )}
                            >
                                <CardContent className="flex flex-col items-start gap-4 p-8">
                                    <div className="rounded-2xl bg-[#EFF4FF] p-3 text-[#2563EB]">
                                        <MapPinHouse className="size-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                            Belum ada alamat tersimpan
                                        </h3>
                                        <p className="max-w-xl text-sm leading-6 text-slate-600">
                                            Tambahkan alamat utama customer agar
                                            checkout berikutnya lebih ringkas.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.18em] text-[#2563EB] uppercase">
                                Ukuran
                            </p>
                            <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#0F172A]">
                                Measurement library
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Semua measurement tersimpan di sini dan bisa
                                dipakai ulang saat membuat order tailor
                                berikutnya.
                            </p>
                        </div>
                        <CreateMeasurementDialog />
                    </div>

                    <div
                        className={cn(
                            'grid gap-4 rounded-[2rem] p-1 md:grid-cols-2',
                            currentSection === 'measurements' &&
                                'bg-[#EFF4FF]/70',
                        )}
                    >
                        {measurements.map((measurement) => (
                            <MeasurementCard
                                key={measurement.id}
                                measurement={measurement}
                            />
                        ))}

                        {measurements.length === 0 && (
                            <Card
                                className={cn(
                                    sectionCardClassName(
                                        currentSection === 'measurements',
                                    ),
                                    'md:col-span-2',
                                )}
                            >
                                <CardContent className="flex flex-col items-start gap-4 p-8">
                                    <div className="rounded-2xl bg-[#EFF4FF] p-3 text-[#2563EB]">
                                        <Ruler className="size-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                            Belum ada ukuran tersimpan
                                        </h3>
                                        <p className="max-w-xl text-sm leading-6 text-slate-600">
                                            Tambahkan measurement pertama agar
                                            langkah ukuran di tailor
                                            configurator lebih cepat.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </section>
            </div>
        </CustomerLayout>
    );
}

function SectionPill({
    active,
    href,
    label,
}: {
    active: boolean;
    href: ReturnType<typeof customer.home>;
    label: string;
}) {
    return (
        <Link
            className={cn(
                'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                active
                    ? 'bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)]'
                    : 'bg-white text-[#1B5EC5] ring-1 ring-[#DBEAFE] hover:bg-[#EFF4FF]',
            )}
            href={href}
            prefetch
        >
            {label}
        </Link>
    );
}

function CreateAddressSheet({ defaultAddress }: { defaultAddress: boolean }) {
    const [open, setOpen] = useState(false);
    const form = useForm<AddressForm>(emptyAddressForm(defaultAddress));

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            form.setData(emptyAddressForm(defaultAddress));
            form.clearErrors();
        }
    };

    return (
        <>
            <Button type="button" onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                Tambah alamat
            </Button>

            <AddressSheet
                description="Simpan alamat pengiriman yang siap dipakai untuk order berikutnya."
                form={form}
                onOpenChange={handleOpenChange}
                onSubmit={() =>
                    form.post(customer.addresses.store().url, {
                        preserveScroll: true,
                        onSuccess: () => handleOpenChange(false),
                    })
                }
                open={open}
                submitLabel="Simpan alamat"
                title="Tambah alamat baru"
            />
        </>
    );
}

function AddressCard({ address }: { address: Address }) {
    const setDefaultForm = useForm({});

    return (
        <Card className="rounded-[1.75rem] border border-[#DBEAFE] bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            {address.label || 'Alamat tanpa label'}
                        </CardTitle>
                        {address.is_default && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF4FF] px-3 py-1 text-xs font-medium tracking-[0.18em] text-[#1B5EC5] uppercase">
                                <Star className="size-3.5" />
                                Default
                            </span>
                        )}
                    </div>
                    <CardDescription className="text-sm leading-6 text-slate-600">
                        {address.recipient_name}
                        {address.phone ? ` • ${address.phone}` : ''}
                    </CardDescription>
                </div>

                <div className="flex flex-wrap gap-3">
                    {!address.is_default && (
                        <Button
                            type="button"
                            variant="outline"
                            className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                            disabled={setDefaultForm.processing}
                            onClick={() =>
                                setDefaultForm.post(
                                    customer.addresses.setDefault(address.id)
                                        .url,
                                    {
                                        preserveScroll: true,
                                    },
                                )
                            }
                        >
                            Jadikan default
                        </Button>
                    )}
                    <EditAddressSheet address={address} />
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
                <p>{address.address_line}</p>
                <p>
                    {[address.city, address.province, address.postal_code]
                        .filter((value) => value && value.length > 0)
                        .join(', ')}
                </p>
            </CardContent>
        </Card>
    );
}

function EditAddressSheet({ address }: { address: Address }) {
    const [open, setOpen] = useState(false);
    const form = useForm<AddressForm>(formFromAddress(address));

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            form.setData(formFromAddress(address));
            form.clearErrors();
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                onClick={() => setOpen(true)}
            >
                <Pencil className="size-4" />
                Edit
            </Button>

            <AddressSheet
                description="Perbarui alamat customer tanpa keluar dari halaman account center."
                form={form}
                onOpenChange={handleOpenChange}
                onSubmit={() =>
                    form.put(customer.addresses.update(address.id).url, {
                        preserveScroll: true,
                        onSuccess: () => handleOpenChange(false),
                    })
                }
                open={open}
                submitLabel="Perbarui alamat"
                title={address.label || 'Edit alamat'}
            />
        </>
    );
}

function AddressSheet({
    title,
    description,
    open,
    onOpenChange,
    form,
    onSubmit,
    submitLabel,
}: {
    title: string;
    description: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: ReturnType<typeof useForm<AddressForm>>;
    onSubmit: () => void;
    submitLabel: string;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto border-l-[#DBEAFE] bg-[#F8FAFF] sm:max-w-2xl">
                <SheetHeader className="border-b border-[#DBEAFE] pb-4">
                    <SheetTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                        {title}
                    </SheetTitle>
                    <SheetDescription className="text-slate-600">
                        {description}
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 px-4 py-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <TextField
                            error={form.errors.label}
                            id={`${title}-label`}
                            label="Label"
                            onChange={(value) => form.setData('label', value)}
                            value={form.data.label}
                        />
                        <TextField
                            error={form.errors.recipient_name}
                            id={`${title}-recipient`}
                            label="Nama penerima"
                            onChange={(value) =>
                                form.setData('recipient_name', value)
                            }
                            value={form.data.recipient_name}
                        />
                        <TextField
                            error={form.errors.phone}
                            id={`${title}-phone`}
                            label="No. telepon"
                            onChange={(value) => form.setData('phone', value)}
                            value={form.data.phone}
                        />
                        <TextField
                            error={form.errors.postal_code}
                            id={`${title}-postal`}
                            label="Kode pos"
                            onChange={(value) =>
                                form.setData('postal_code', value)
                            }
                            value={form.data.postal_code}
                        />
                        <TextField
                            error={form.errors.city}
                            id={`${title}-city`}
                            label="Kota"
                            onChange={(value) => form.setData('city', value)}
                            value={form.data.city}
                        />
                        <TextField
                            error={form.errors.province}
                            id={`${title}-province`}
                            label="Provinsi"
                            onChange={(value) =>
                                form.setData('province', value)
                            }
                            value={form.data.province}
                        />
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor={`${title}-address-line`}>
                                Alamat lengkap
                            </Label>
                            <textarea
                                id={`${title}-address-line`}
                                className="min-h-28 rounded-md border border-[#DBEAFE] bg-white px-3 py-2 text-sm"
                                value={form.data.address_line}
                                onChange={(event) =>
                                    form.setData(
                                        'address_line',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.address_line} />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-[#DBEAFE] bg-white px-4 py-3 text-sm text-slate-700">
                        <Checkbox
                            checked={form.data.is_default}
                            onCheckedChange={(checked) =>
                                form.setData('is_default', checked === true)
                            }
                        />
                        Jadikan alamat default untuk pengiriman customer.
                    </label>
                </div>

                <SheetFooter className="border-t border-[#DBEAFE]">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        disabled={form.processing}
                        onClick={onSubmit}
                    >
                        {submitLabel}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function CreateMeasurementDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm<MeasurementForm>(emptyMeasurementForm());

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            form.setData(emptyMeasurementForm());
            form.clearErrors();
        }
    };

    return (
        <>
            <Button type="button" onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                Tambah ukuran
            </Button>

            <MeasurementDialog
                description="Simpan measurement reusable untuk order tailor berikutnya."
                form={form}
                onOpenChange={handleOpenChange}
                onSubmit={() => {
                    form.transform(transformMeasurementPayload);
                    form.post(customer.measurements.store().url, {
                        preserveScroll: true,
                        onSuccess: () => handleOpenChange(false),
                    });
                }}
                open={open}
                submitLabel="Simpan ukuran"
                title="Tambah ukuran baru"
            />
        </>
    );
}

function MeasurementCard({ measurement }: { measurement: Measurement }) {
    return (
        <Card className="rounded-[1.75rem] border border-[#DBEAFE] bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                        {measurement.label ?? `Ukuran #${measurement.id}`}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                        Gunakan data ini untuk repeat order tanpa input ulang.
                    </CardDescription>
                </div>
                <EditMeasurementDialog measurement={measurement} />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    {measurementInputs.map((field) => (
                        <div
                            key={field.key}
                            className="rounded-2xl border border-[#DBEAFE] bg-[#F8FAFF] p-4"
                        >
                            <p className="text-xs font-medium tracking-[0.18em] text-slate-600 uppercase">
                                {field.label}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-[#0F172A]">
                                {measurement[field.key] === null
                                    ? '-'
                                    : `${measurement[field.key]} cm`}
                            </p>
                        </div>
                    ))}
                </div>

                {measurement.notes && (
                    <div className="rounded-2xl border border-[#DBEAFE] bg-[#F8FAFF] p-4 text-sm leading-6 text-slate-600">
                        {measurement.notes}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function EditMeasurementDialog({ measurement }: { measurement: Measurement }) {
    const [open, setOpen] = useState(false);
    const form = useForm<MeasurementForm>(formFromMeasurement(measurement));

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            form.setData(formFromMeasurement(measurement));
            form.clearErrors();
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                onClick={() => setOpen(true)}
            >
                <Pencil className="size-4" />
                Edit
            </Button>

            <MeasurementDialog
                description="Perbarui measurement customer langsung dari account center."
                form={form}
                onOpenChange={handleOpenChange}
                onSubmit={() => {
                    form.transform(transformMeasurementPayload);
                    form.put(customer.measurements.update(measurement.id).url, {
                        preserveScroll: true,
                        onSuccess: () => handleOpenChange(false),
                    });
                }}
                open={open}
                submitLabel="Perbarui ukuran"
                title={measurement.label ?? `Ukuran #${measurement.id}`}
            />
        </>
    );
}

function MeasurementDialog({
    title,
    description,
    open,
    onOpenChange,
    form,
    onSubmit,
    submitLabel,
}: {
    title: string;
    description: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: ReturnType<typeof useForm<MeasurementForm>>;
    onSubmit: () => void;
    submitLabel: string;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-[#DBEAFE] bg-[#F8FAFF] sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`${title}-label`}>Label</Label>
                        <Input
                            id={`${title}-label`}
                            value={form.data.label}
                            onChange={(event) =>
                                form.setData('label', event.target.value)
                            }
                        />
                        <InputError message={form.errors.label} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {measurementInputs.map((field) => (
                            <div key={field.key} className="grid gap-2">
                                <Label htmlFor={`${title}-${field.key}`}>
                                    {field.label}
                                </Label>
                                <Input
                                    id={`${title}-${field.key}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data[field.key]}
                                    onChange={(event) =>
                                        form.setData(
                                            field.key,
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors[field.key]} />
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`${title}-notes`}>Catatan</Label>
                        <textarea
                            id={`${title}-notes`}
                            className="min-h-28 rounded-md border border-[#DBEAFE] bg-white px-3 py-2 text-sm"
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                        />
                        <InputError message={form.errors.notes} />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        disabled={form.processing}
                        onClick={onSubmit}
                    >
                        {submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TextField({
    id,
    label,
    value,
    error,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <InputError message={error} />
        </div>
    );
}

function sectionCardClassName(active: boolean): string {
    return cn(
        'rounded-[1.75rem] border border-[#DBEAFE] bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]',
        active && 'ring-2 ring-[#BFDBFE]',
    );
}

const measurementInputs: Array<{
    key: keyof Pick<
        Measurement,
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

function emptyAddressForm(defaultAddress: boolean): AddressForm {
    return {
        label: '',
        recipient_name: '',
        phone: '',
        address_line: '',
        city: '',
        province: '',
        postal_code: '',
        is_default: defaultAddress,
    };
}

function formFromAddress(address: Address): AddressForm {
    return {
        label: address.label,
        recipient_name: address.recipient_name,
        phone: address.phone,
        address_line: address.address_line,
        city: address.city,
        province: address.province,
        postal_code: address.postal_code ?? '',
        is_default: address.is_default,
    };
}

function emptyMeasurementForm(): MeasurementForm {
    return {
        label: '',
        chest: '',
        waist: '',
        hips: '',
        shoulder: '',
        sleeve_length: '',
        shirt_length: '',
        inseam: '',
        trouser_waist: '',
        notes: '',
    };
}

function formFromMeasurement(measurement: Measurement): MeasurementForm {
    return {
        label: measurement.label ?? '',
        chest: stringifyNullable(measurement.chest),
        waist: stringifyNullable(measurement.waist),
        hips: stringifyNullable(measurement.hips),
        shoulder: stringifyNullable(measurement.shoulder),
        sleeve_length: stringifyNullable(measurement.sleeve_length),
        shirt_length: stringifyNullable(measurement.shirt_length),
        inseam: stringifyNullable(measurement.inseam),
        trouser_waist: stringifyNullable(measurement.trouser_waist),
        notes: measurement.notes ?? '',
    };
}

function stringifyNullable(value: number | null): string {
    return value === null ? '' : value.toString();
}

function transformMeasurementPayload(data: MeasurementForm) {
    return {
        label: data.label || null,
        chest: numberOrNull(data.chest),
        waist: numberOrNull(data.waist),
        hips: numberOrNull(data.hips),
        shoulder: numberOrNull(data.shoulder),
        sleeve_length: numberOrNull(data.sleeve_length),
        shirt_length: numberOrNull(data.shirt_length),
        inseam: numberOrNull(data.inseam),
        trouser_waist: numberOrNull(data.trouser_waist),
        notes: data.notes || null,
    };
}

function numberOrNull(value: string): number | null {
    return value === '' ? null : Number(value);
}
