import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const form = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/register', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <AuthLayout
            title="Create your customer account"
            description="Daftar untuk mulai membuat pesanan dan memantau status order Anda."
        >
            <Head title="Register" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input
                            id="name"
                            name="name"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder="Nama lengkap"
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                            required
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Minimal 8 karakter"
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={form.data.password_confirmation}
                            onChange={(event) => form.setData('password_confirmation', event.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Ulangi password"
                        />
                        <InputError message={form.errors.password_confirmation} />
                    </div>

                    <Button className="mt-2 w-full" type="submit" disabled={form.processing}>
                        {form.processing && <Spinner />}
                        Daftar
                    </Button>
                </div>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                Sudah punya akun? <TextLink href={login()}>Masuk</TextLink>
            </div>
        </AuthLayout>
    );
}
