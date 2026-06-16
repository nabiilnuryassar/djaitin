import { Form, Head } from '@inertiajs/react';
import {
    create as createCustomer,
    index as customersIndex,
    store as storeCustomer,
} from '@/actions/App/Http/Controllers/Office/CustomerController';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/office/page-header';
import { PremiumCard } from '@/components/office/premium-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OfficeLayout from '@/layouts/office-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Pelanggan', href: customersIndex() },
    { title: 'Tambah', href: createCustomer() },
];

export default function CustomersCreate() {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pelanggan" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-3xl">
                <FlashMessage />

                <PageHeader
                    eyebrow="Pelanggan"
                    title="Tambah Pelanggan Baru"
                    description="Data ini akan dipakai untuk order tailor dan riwayat ukuran."
                />

                <PremiumCard>
                    <Form {...storeCustomer.form()} className="grid gap-5">
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input 
                                        id="name" 
                                        name="name" 
                                        required 
                                        className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Nomor Telepon</Label>
                                    <Input 
                                        id="phone" 
                                        name="phone" 
                                        className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Alamat Lengkap</Label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        className="min-h-24 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                    />
                                    <InputError message={errors.address} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Catatan Internal</Label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        className="min-h-24 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink"
                                    />
                                    <InputError message={errors.notes} />
                                </div>
                                <div className="flex justify-end pt-3">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl cursor-pointer bg-brand-blue text-white hover:bg-brand-blue-deep"
                                    >
                                        Simpan Pelanggan
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </PremiumCard>
            </div>
        </OfficeLayout>
    );
}
