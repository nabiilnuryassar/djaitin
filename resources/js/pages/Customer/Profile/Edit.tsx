import { Head, useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';
import type { SharedPageProps } from '@/types/auth';

type Props = {
    mustVerifyEmail: boolean;
    customer: {
        name: string;
        phone: string | null;
    };
};

export default function CustomerProfileEdit({ mustVerifyEmail, customer: customerProfile }: Props) {
    const page = usePage<SharedPageProps>();
    const form = useForm({
        name: customerProfile.name,
        email: page.props.auth.user?.email ?? '',
        phone: customerProfile.phone ?? '',
    });

    return (
        <CustomerLayout>
            <Head title="Profil Saya" />

            <div className="space-y-6">
                <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(31,23,38,0.08)]">
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#a34a2c]">
                        Profile
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                        Data akun dan profil customer.
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                        Perubahan nama dan email disimpan ke tabel user, sedangkan nama customer dan nomor telepon disimpan ke profil customer yang terhubung.
                    </p>
                </div>

                <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(31,23,38,0.06)]">
                    <CardHeader>
                        <CardTitle>Perbarui profil</CardTitle>
                        <CardDescription>
                            {mustVerifyEmail
                                ? 'Perubahan email akan meminta verifikasi ulang.'
                                : 'Email tidak memerlukan verifikasi tambahan.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">No. telepon</Label>
                            <Input
                                id="phone"
                                value={form.data.phone}
                                onChange={(event) => form.setData('phone', event.target.value)}
                            />
                            <InputError message={form.errors.phone} />
                        </div>

                        <Button
                            type="button"
                            disabled={form.processing}
                            onClick={() => form.put(customer.profile.update().url, { preserveScroll: true })}
                        >
                            Simpan perubahan
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
