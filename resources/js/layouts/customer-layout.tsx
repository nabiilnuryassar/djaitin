import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ClipboardList,
    Home,
    LogOut,
    ShoppingBag,
    Shirt,
    UserCircle2,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { CustomerMobileBottomBar } from '@/components/customer-mobile-bottom-bar';
import { FlashMessage } from '@/components/flash-message';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useForceLightTheme } from '@/hooks/use-force-light-theme';
import customer from '@/routes/customer';
import office from '@/routes/office';
import { login, logout, register } from '@/routes';
import type { SharedPageProps } from '@/types/auth';

type NavigationItem = {
    label: string;
    href: ReturnType<typeof customer.home>;
    match: string;
};

export default function CustomerLayout({ children }: PropsWithChildren) {
    useForceLightTheme();

    const page = usePage<SharedPageProps>();
    const currentUrl = page.url;
    const user = page.props.auth.user;
    const isCustomer = user?.role === 'customer';
    const unreadNotificationsCount = page.props.unread_notifications_count ?? 0;
    const customerNavigation: NavigationItem[] = [
        {
            label: 'Beranda',
            href: isCustomer ? customer.dashboard() : customer.home(),
            match: isCustomer ? customer.dashboard.url() : '/app',
        },
        {
            label: 'Tailor',
            href: isCustomer
                ? customer.tailor.configure()
                : customer.services.tailor(),
            match: isCustomer
                ? customer.tailor.configure.url()
                : '/app/services/tailor',
        },
        {
            label: 'Katalog',
            href: customer.catalog.index(),
            match: '/app/catalog',
        },
        {
            label: 'Pesanan',
            href: customer.orders.index(),
            match: '/app/orders',
        },
        {
            label: 'Pembayaran',
            href: customer.payments.index(),
            match: '/app/payments',
        },
        {
            label: 'Profil',
            href: customer.profile.edit({
                query: { section: 'profile' },
            }),
            match: '/app/profile',
        },
    ];

    return (
        <div className="min-h-screen bg-[#eef3fb] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_32%),linear-gradient(180deg,_#f7f9fe_0%,_#eef3fb_100%)] pb-[env(safe-area-inset-bottom)] text-[#0F172A]">
            <header className="sticky top-0 z-20 border-b border-white/60 bg-white/78 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={
                                isCustomer
                                    ? customer.dashboard()
                                    : customer.home()
                            }
                            className="inline-flex items-center gap-3 rounded-2xl bg-[#162044] px-3 py-2 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
                        >
                            <Logo className="size-7" />
                            <span className="text-xs font-semibold tracking-[0.22em] uppercase">
                                Djaitin
                            </span>
                        </Link>
                    </div>

                    <nav className="hidden items-center gap-2 md:flex">
                        {customerNavigation.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={navClassName(currentUrl, item.match)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        {isCustomer ? (
                            <>
                                <Link
                                    href={customer.notifications.index()}
                                    className="relative inline-flex size-10 items-center justify-center rounded-full bg-white text-[#162044] ring-1 ring-[#dbe4f5] transition hover:bg-[#f3f7ff]"
                                >
                                    <Bell className="size-4" />
                                    {unreadNotificationsCount > 0 && (
                                        <span className="absolute top-0.5 right-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#f4b21a] px-1 py-0.5 text-[10px] font-semibold text-[#162044]">
                                            {unreadNotificationsCount}
                                        </span>
                                    )}
                                </Link>
                                <div className="flex items-center gap-3 rounded-full bg-white px-2 py-1.5 ring-1 ring-[#dbe4f5]">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-[#162044]">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Premium Member
                                        </p>
                                    </div>
                                    <div className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f4b21a_0%,#ffdd83_100%)] text-sm font-semibold text-[#162044]">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex size-10 items-center justify-center rounded-full border border-[#dbe4f5] bg-white text-slate-500 transition hover:bg-[#f3f7ff] hover:text-[#1B5EC5]"
                                    onClick={() => router.post(logout().url)}
                                >
                                    <LogOut className="size-4" />
                                </button>
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

            <div className="mx-auto max-w-7xl px-6 py-8 pb-28 md:pb-8">
                <FlashMessage />
                <div className="mt-2">{children}</div>
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
            ? 'bg-[#2f62d8] text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)]'
            : 'bg-white/80 text-[#162044] ring-1 ring-[#dbe4f5] hover:bg-[#f3f7ff]',
    ].join(' ');
}
