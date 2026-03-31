import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Ruler } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

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

type Props = {
    measurements: Measurement[];
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

export default function CustomerMeasurementsIndex({ measurements }: Props) {
    return (
        <CustomerLayout>
            <Head title="Measurement Library" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)] md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#a34a2c]">
                            Measurement Library
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            Simpan dan revisi ukuran pribadi.
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                            Measurement yang tersimpan di sini bisa dipakai kembali saat membuat order tailor berikutnya.
                        </p>
                    </div>
                    <CreateMeasurementDialog />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {measurements.map((measurement) => (
                        <MeasurementCard key={measurement.id} measurement={measurement} />
                    ))}

                    {measurements.length === 0 && (
                        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)] md:col-span-2">
                            <CardContent className="flex flex-col items-start gap-4 p-8">
                                <div className="rounded-2xl bg-[#f3e3d8] p-3 text-[#a34a2c]">
                                    <Ruler className="size-5" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">Belum ada ukuran tersimpan</h2>
                                    <p className="max-w-xl text-sm leading-6 text-slate-600">
                                        Tambahkan measurement pertama agar langkah ukuran di tailor configurator lebih cepat.
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
        <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle>{measurement.label ?? `Ukuran #${measurement.id}`}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6 text-slate-600">
                        Gunakan data ini untuk repeat order tanpa input ulang.
                    </CardDescription>
                </div>
                <EditMeasurementDialog measurement={measurement} />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    {measurementInputs.map((field) => (
                        <div key={field.key} className="rounded-2xl border border-[#eadfce] bg-[#fcfaf6] p-4">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                {field.label}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-[#1f1726]">
                                {measurement[field.key] === null ? '-' : `${measurement[field.key]} cm`}
                            </p>
                        </div>
                    ))}
                </div>

                {measurement.notes && (
                    <div className="rounded-2xl border border-[#eadfce] p-4 text-sm leading-6 text-slate-600">
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
                className="border-[#d8c8b3] bg-white/70"
                onClick={() => setOpen(true)}
            >
                <Pencil className="size-4" />
                Edit
            </Button>

            <MeasurementDialog
                description="Perbarui measurement customer langsung dari library pribadi."
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
            <DialogContent className="max-h-[90vh] overflow-y-auto border-[#eadfce] sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`${title}-label`}>Label</Label>
                        <Input
                            id={`${title}-label`}
                            value={form.data.label}
                            onChange={(event) => form.setData('label', event.target.value)}
                        />
                        <InputError message={form.errors.label} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {measurementInputs.map((field) => (
                            <div key={field.key} className="grid gap-2">
                                <Label htmlFor={`${title}-${field.key}`}>{field.label}</Label>
                                <Input
                                    id={`${title}-${field.key}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data[field.key]}
                                    onChange={(event) => form.setData(field.key, event.target.value)}
                                />
                                <InputError message={form.errors[field.key]} />
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`${title}-notes`}>Catatan</Label>
                        <textarea
                            id={`${title}-notes`}
                            className="min-h-28 rounded-md border bg-transparent px-3 py-2 text-sm"
                            value={form.data.notes}
                            onChange={(event) => form.setData('notes', event.target.value)}
                        />
                        <InputError message={form.errors.notes} />
                    </div>
                </div>

                <DialogFooter>
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const measurementInputs: Array<{
    key: keyof Pick<
        Measurement,
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
