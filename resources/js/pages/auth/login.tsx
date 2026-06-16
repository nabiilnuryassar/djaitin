import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Welcome Back"
            description="Masuk ke akun Djaitin Anda untuk melanjutkan."
        >
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={onSubmit}>
                <div className="grid gap-5">
                    {/* Email Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#123c78]/40">
                                <Mail className="h-4 w-4" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="email@example.com"
                                className="border-[#dbe4f5] bg-white/80 pl-10 text-[#0F172A] transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#2a6bb2] focus:bg-white focus:ring-2 focus:ring-[#2a6bb2]/10"
                            />
                        </div>
                        <InputError message={form.errors.email} />
                    </div>

                    {/* Password Field */}
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink
                                    href={request()}
                                    className="ml-auto text-sm font-medium text-[#2a6bb2] hover:text-[#123c78]"
                                    tabIndex={5}
                                >
                                    Lupa password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#123c78]/40">
                                <LockKeyhole className="h-4 w-4" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.data.password}
                                onChange={(e) =>
                                    form.setData('password', e.target.value)
                                }
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Masukkan password"
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

                    {/* Remember Me */}
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={form.data.remember}
                            onCheckedChange={(checked) =>
                                form.setData('remember', checked === true)
                            }
                            tabIndex={3}
                            className="border-[#dbe4f5] text-[#2a6bb2] data-[state=checked]:border-[#2a6bb2] data-[state=checked]:bg-[#2a6bb2]"
                        />
                        <Label
                            htmlFor="remember"
                            className="cursor-pointer text-sm text-[#64748B]"
                        >
                            Ingat saya
                        </Label>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#123c78] to-[#2a6bb2] py-6 text-base font-semibold text-white shadow-lg shadow-[#123c78]/20 transition-all duration-300 hover:from-[#123c78] hover:to-[#2a6bb2] hover:shadow-xl hover:shadow-[#123c78]/30 active:scale-[0.98] disabled:opacity-60"
                        tabIndex={4}
                        disabled={form.processing}
                        data-test="login-button"
                    >
                        {form.processing ? (
                            <span className="flex items-center gap-2">
                                <Spinner className="h-5 w-5" />
                                Memproses...
                            </span>
                        ) : (
                            'Masuk'
                        )}
                    </Button>
                </div>
            </form>

            {status && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            {canRegister && (
                <div className="text-center text-sm text-[#64748B]">
                    Belum punya akun?{' '}
                    <TextLink
                        href="/register"
                        className="font-semibold text-[#2a6bb2] hover:text-[#123c78]"
                    >
                        Daftar sebagai customer
                    </TextLink>
                </div>
            )}
        </AuthLayout>
    );
}
