import { Head, useForm } from '@inertiajs/react';
import { Mail, LockKeyhole, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
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
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post('/register', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <AuthLayout
            title="Join Djaitin"
            description="Buat akun dan mulai perjalanan fashion Anda bersama kami."
        >
            <Head title="Register" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-5">
                    {/* Name Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            Nama Lengkap
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#123c78]/40">
                                <User className="h-4 w-4" />
                            </div>
                            <Input
                                id="name"
                                name="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                required
                                autoFocus
                                autoComplete="name"
                                placeholder="Nama lengkap Anda"
                                className="border-[#dbe4f5] bg-white/80 pl-10 text-[#0F172A] transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#2a6bb2] focus:bg-white focus:ring-2 focus:ring-[#2a6bb2]/10"
                            />
                        </div>
                        <InputError message={form.errors.name} />
                    </div>

                    {/* Email Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">
                            Email
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#123c78]/40">
                                <Mail className="h-4 w-4" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                required
                                autoComplete="email"
                                placeholder="email@example.com"
                                className="border-[#dbe4f5] bg-white/80 pl-10 text-[#0F172A] transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#2a6bb2] focus:bg-white focus:ring-2 focus:ring-[#2a6bb2]/10"
                            />
                        </div>
                        <InputError message={form.errors.email} />
                    </div>

                    {/* Password Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            Password
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#123c78]/40">
                                <LockKeyhole className="h-4 w-4" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                required
                                autoComplete="new-password"
                                placeholder="Minimal 8 karakter"
                                className="border-[#dbe4f5] bg-white/80 pl-10 pr-10 text-[#0F172A] transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#2a6bb2] focus:bg-white focus:ring-2 focus:ring-[#2a6bb2]/10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#123c78]/40 hover:text-[#123c78]/60"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <InputError message={form.errors.password} />
                    </div>

                    {/* Password Confirmation Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Konfirmasi Password
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#123c78]/40">
                                <LockKeyhole className="h-4 w-4" />
                            </div>
                            <Input
                                id="password_confirmation"
                                type={
                                    showPasswordConfirmation
                                        ? 'text'
                                        : 'password'
                                }
                                name="password_confirmation"
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                required
                                autoComplete="new-password"
                                placeholder="Ulangi password Anda"
                                className="border-[#dbe4f5] bg-white/80 pl-10 pr-10 text-[#0F172A] transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#2a6bb2] focus:bg-white focus:ring-2 focus:ring-[#2a6bb2]/10"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPasswordConfirmation(
                                        !showPasswordConfirmation,
                                    )
                                }
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#123c78]/40 hover:text-[#123c78]/60"
                                tabIndex={-1}
                            >
                                {showPasswordConfirmation ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <InputError
                            message={form.errors.password_confirmation}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#123c78] to-[#2a6bb2] py-6 text-base font-semibold text-white shadow-lg shadow-[#123c78]/20 transition-all duration-300 hover:from-[#123c78] hover:to-[#2a6bb2] hover:shadow-xl hover:shadow-[#123c78]/30 active:scale-[0.98] disabled:opacity-60"
                        type="submit"
                        disabled={form.processing}
                    >
                        {form.processing ? (
                            <span className="flex items-center gap-2">
                                <Spinner className="h-5 w-5" />
                                Memproses...
                            </span>
                        ) : (
                            'Daftar Sekarang'
                        )}
                    </Button>
                </div>
            </form>

            <div className="text-center text-sm text-[#64748B]">
                Sudah punya akun?{' '}
                <TextLink
                    href={login()}
                    className="font-semibold text-[#2a6bb2] hover:text-[#123c78]"
                >
                    Masuk di sini
                </TextLink>
            </div>
        </AuthLayout>
    );
}
