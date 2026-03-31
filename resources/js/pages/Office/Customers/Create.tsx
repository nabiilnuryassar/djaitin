import { Form, Head } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
    create as createCustomer,
    index as customersIndex,
    store as storeCustomer,
} from '@/actions/App/Http/Controllers/Office/CustomerController';
import InputError from '@/components/input-error';
import { FlashMessage } from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Tambah pelanggan baru</CardTitle>
                        <CardDescription>
                            Data ini akan dipakai untuk order tailor dan riwayat ukuran.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...storeCustomer.form()} className="grid gap-5">
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama</Label>
                                        <Input id="name" name="name" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Telepon</Label>
                                        <Input id="phone" name="phone" />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="address">Alamat</Label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm"
                                        />
                                        <InputError message={errors.address} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Catatan</Label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm"
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            Simpan pelanggan
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}
