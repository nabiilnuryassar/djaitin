import { Link, router, usePage } from '@inertiajs/react';
import { ClipboardList, Home, LogOut, MapPin, Menu, Package, Ruler, Shirt, UserCircle2, Wallet } from 'lucide-react';
import { useState, type PropsWithChildren } from 'react';
import { FlashMessage } from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import customer from '@/routes/customer';
import office from '@/routes/office';
import { login, logout, register } from '@/routes';
import type { SharedPageProps } from '@/types/auth';

type NavigationItem = {
    label: string;
    href: ReturnType<typeof customer.home>;
    icon: typeof Home;
    match: string;
};

const customerNavigation: NavigationItem[] = [
    {
        label: 'Beranda',
        href: customer.home(),
        icon: Home,
        match: '/app',
    },
    {
        label: 'Tailor',
        href: customer.services.tailor(),
        icon: Shirt,
        match: '/app/services/tailor',
    },
    {
        label: 'Orders',
        href: customer.orders.index(),
        icon: ClipboardList,
        match: '/app/orders',
    },
    {
        label: 'Pembayaran',
        href: customer.payments.index(),
        icon: Wallet,
        match: '/app/payments',
    },
    {
        label: 'Ukuran',
        href: customer.measurements.index(),
        icon: Ruler,
        match: '/app/measurements',
    },
    {
        label: 'Alamat',
        href: customer.addresses.index(),
        icon: MapPin,
        match: '/app/addresses',
    },
    {
        label: 'Profil',
        href: customer.profile.edit(),
        icon: UserCircle2,
        match: '/app/profile',
    },
];

export default function CustomerLayout({ children }: PropsWithChildren) {
    const page = usePage<SharedPageProps>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const currentUrl = page.url;
    const user = page.props.auth.user;
    const isCustomer = user?.role === 'customer';

    return (
        <div className="min-h-screen bg-[#f5f1e8] text-[#201727]">
            <header className="sticky top-0 z-20 border-b border-[#eadfce] bg-[#f5f1e8]/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link href={customer.home()} className="flex items-center gap-3">
                            <div className="rounded-2xl bg-[#1f1726] p-2 text-[#f5f1e8]">
                                <Package className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-[#a34a2c]">
                                    Djaitin
                                </p>
                                <p className="font-semibold">Customer Portal</p>
                            </div>
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="inline-flex rounded-xl border border-[#d8c8b3] p-2 text-[#1f1726] md:hidden"
                        onClick={() => setIsMenuOpen((value) => !value)}
                    >
                        <Menu className="size-5" />
                    </button>

                    <nav className="hidden items-center gap-2 md:flex">
                        {customerNavigation.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={navClassName(currentUrl, item.match)}
                            >
                                <item.icon className="size-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        {isCustomer ? (
                            <>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-slate-600">{user?.email}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-[#d8c8b3] bg-white/70"
                                    onClick={() => router.post(logout().url)}
                                >
                                    <LogOut className="size-4" />
                                    Keluar
                                </Button>
                            </>
                        ) : user ? (
                            <Button asChild>
                                <Link href={office.dashboard()}>Buka Office</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="outline" className="border-[#d8c8b3] bg-white/70">
                                    <Link href={login()}>Masuk</Link>
                                </Button>
                                <Button asChild>
                                    <Link href={register()}>Daftar</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="border-t border-[#eadfce] px-6 py-4 md:hidden">
                        <div className="grid gap-2">
                            {customerNavigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={navClassName(currentUrl, item.match)}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <item.icon className="size-4" />
                                    {item.label}
                                </Link>
                            ))}

                            <div className="mt-2 grid gap-2">
                                {isCustomer ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="justify-start border-[#d8c8b3] bg-white/70"
                                        onClick={() => router.post(logout().url)}
                                    >
                                        <LogOut className="size-4" />
                                        Keluar
                                    </Button>
                                ) : user ? (
                                    <Button asChild className="justify-start">
                                        <Link href={office.dashboard()}>Buka Office</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="outline" className="justify-start border-[#d8c8b3] bg-white/70">
                                            <Link href={login()}>Masuk</Link>
                                        </Button>
                                        <Button asChild className="justify-start">
                                            <Link href={register()}>Daftar</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <div className="mx-auto max-w-6xl px-6 py-8">
                <FlashMessage />
                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
}

function navClassName(currentUrl: string, match: string): string {
    const isActive = currentUrl === match || (match !== '/app' && currentUrl.startsWith(match));

    return [
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition',
        isActive
            ? 'bg-[#1f1726] text-[#f5f1e8]'
            : 'bg-white/70 text-[#1f1726] hover:bg-white',
    ].join(' ');
}
