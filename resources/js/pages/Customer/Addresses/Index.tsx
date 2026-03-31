import { Head, useForm } from '@inertiajs/react';
import { MapPinHouse, Pencil, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import customer from '@/routes/customer';

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

type Props = {
    addresses: Address[];
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

export default function CustomerAddressesIndex({ addresses }: Props) {
    return (
        <CustomerLayout>
            <Head title="Alamat Saya" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)] md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#a34a2c]">
                            Address Book
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            Kelola alamat pengiriman customer.
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                            Alamat default tetap menyinkronkan field alamat legacy customer untuk kompatibilitas office.
                        </p>
                    </div>
                    <CreateAddressSheet defaultAddress={addresses.length === 0} />
                </div>

                <div className="grid gap-4">
                    {addresses.map((address) => (
                        <AddressCard key={address.id} address={address} />
                    ))}

                    {addresses.length === 0 && (
                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                            <CardContent className="flex flex-col items-start gap-4 p-8">
                                <div className="rounded-2xl bg-[#f3e3d8] p-3 text-[#a34a2c]">
                                    <MapPinHouse className="size-5" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Belum ada alamat tersimpan</h2>
                                    <p className="max-w-xl text-sm leading-6 text-slate-600">
                                        Tambahkan alamat utama customer agar checkout berikutnya lebih ringkas.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </CustomerLayout>
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
        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <CardTitle>{address.label || 'Alamat tanpa label'}</CardTitle>
                        {address.is_default && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f3e3d8] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#a34a2c]">
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
                            className="border-[#d8c8b3] bg-white/70"
                            disabled={setDefaultForm.processing}
                            onClick={() =>
                                setDefaultForm.post(customer.addresses.setDefault(address.id).url, {
                                    preserveScroll: true,
                                })
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
                className="border-[#d8c8b3] bg-white/70"
                onClick={() => setOpen(true)}
            >
                <Pencil className="size-4" />
                Edit
            </Button>

            <AddressSheet
                description="Perbarui alamat customer tanpa keluar dari halaman daftar alamat."
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
            <SheetContent className="w-full overflow-y-auto border-l-[#eadfce] sm:max-w-2xl">
                <SheetHeader className="border-b border-[#f0e6da] pb-4">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
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
                            onChange={(value) => form.setData('recipient_name', value)}
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
                            onChange={(value) => form.setData('postal_code', value)}
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
                            onChange={(value) => form.setData('province', value)}
                            value={form.data.province}
                        />
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor={`${title}-address-line`}>Alamat lengkap</Label>
                            <textarea
                                id={`${title}-address-line`}
                                className="min-h-28 rounded-md border bg-transparent px-3 py-2 text-sm"
                                value={form.data.address_line}
                                onChange={(event) => form.setData('address_line', event.target.value)}
                            />
                            <InputError message={form.errors.address_line} />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-[#fcfaf6] px-4 py-3 text-sm text-slate-700">
                        <Checkbox
                            checked={form.data.is_default}
                            onCheckedChange={(checked) => form.setData('is_default', checked === true)}
                        />
                        Jadikan alamat default untuk pengiriman customer.
                    </label>
                </div>

                <SheetFooter className="border-t border-[#f0e6da]">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-[#d8c8b3] bg-white/70"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button type="button" disabled={form.processing} onClick={onSubmit}>
                        {submitLabel}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
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
            <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
            <InputError message={error} />
        </div>
    );
}

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
