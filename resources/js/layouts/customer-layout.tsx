import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ClipboardList,
    Home,
    LogOut,
    Package,
    ShoppingBag,
    Shirt,
    UserCircle2,
    Wallet,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { CustomerMobileBottomBar } from '@/components/customer-mobile-bottom-bar';
import { FlashMessage } from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import { useForceLightTheme } from '@/hooks/use-force-light-theme';
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
        label: 'Katalog',
        href: customer.catalog.index(),
        icon: ShoppingBag,
        match: '/app/catalog',
    },
    {
        label: 'Pesanan',
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
        label: 'Profil',
        href: customer.profile.edit({
            query: { section: 'profile' },
        }),
        icon: UserCircle2,
        match: '/app/profile',
    },
];

export default function CustomerLayout({ children }: PropsWithChildren) {
    useForceLightTheme();

    const page = usePage<SharedPageProps>();
    const currentUrl = page.url;
    const user = page.props.auth.user;
    const isCustomer = user?.role === 'customer';
    const unreadNotificationsCount = page.props.unread_notifications_count ?? 0;

    return (
        <div className="min-h-screen bg-[#F8FAFF] bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_40%)] pb-[env(safe-area-inset-bottom)] text-[#0F172A]">
            <header className="sticky top-0 z-20 border-b border-[#DBEAFE] bg-white/92 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={customer.home()}
                            className="flex items-center gap-3"
                        >
                            <div className="rounded-2xl bg-[#162044] p-2 text-[#F9C11A] shadow-[0_12px_28px_rgba(22,32,68,0.18)]">
                                <Package className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                                    Djaitin
                                </p>
                                <p className="[font-family:var(--font-heading)] font-semibold text-[#0F172A]">
                                    Customer Portal
                                </p>
                            </div>
                        </Link>
                    </div>

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
                        {isCustomer && (
                            <Link
                                href={customer.notifications.index()}
                                className={navClassName(
                                    currentUrl,
                                    '/app/notifications',
                                )}
                            >
                                <Bell className="size-4" />
                                Notifikasi
                                {unreadNotificationsCount > 0 && (
                                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#F9C11A] px-1.5 py-0.5 text-[11px] font-semibold text-[#162044]">
                                        {unreadNotificationsCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        {isCustomer ? (
                            <>
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        {user?.email}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                                    onClick={() => router.post(logout().url)}
                                >
                                    <LogOut className="size-4" />
                                    Keluar
                                </Button>
                            </>
                        ) : user ? (
                            <Button asChild>
                                <Link href={office.dashboard()}>
                                    Buka Office
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                                >
                                    <Link href={login()}>Masuk</Link>
                                </Button>
                                <Button asChild>
                                    <Link href={register()}>Daftar</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-6 py-8 pb-28 md:pb-8">
                <FlashMessage />
                <div className="mt-6">{children}</div>
            </div>

            <CustomerMobileBottomBar
                currentUrl={currentUrl}
                pageProps={page.props}
            />
        </div>
    );
}

function navClassName(currentUrl: string, match: string): string {
    const isActive =
        currentUrl === match ||
        (match !== '/app' && currentUrl.startsWith(match));

    return [
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-200',
        isActive
            ? 'bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)]'
            : 'bg-white text-[#162044] ring-1 ring-[#DBEAFE] hover:bg-[#EFF4FF]',
    ].join(' ');
}
