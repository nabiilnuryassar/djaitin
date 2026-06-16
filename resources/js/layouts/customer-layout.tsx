import { Link, router, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { AppToaster } from '@/components/app-toaster';
import { CustomerMobileBottomBar } from '@/components/customer-mobile-bottom-bar';
import { CustomerNotificationPopover } from '@/components/customer-notification-popover';
import { Logo } from '@/components/Logo';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useForceLightTheme } from '@/hooks/use-force-light-theme';
import { login, logout, register } from '@/routes';
import customer from '@/routes/customer';
import office from '@/routes/office';
import type { SharedPageProps } from '@/types/auth';

type NavigationItem = {
    label: string;
    href: string;
    match: string;
};

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useForceLightTheme();

    const page = usePage<SharedPageProps>();
    const currentUrl = page.url;
    const user = page.props.auth.user;
    const isCustomer = user?.role === 'customer';
    const unreadNotificationsCount = page.props.unread_notifications_count ?? 0;
    const recentNotifications = page.props.recent_notifications ?? [];
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const customerNavigation: NavigationItem[] = [
        {
            label: 'Beranda',
            href: isCustomer ? customer.dashboard.url() : customer.home.url(),
            match: isCustomer ? customer.dashboard.url() : '/app',
        },
        {
            label: 'Tailor',
            href: isCustomer
                ? customer.tailor.configure.url()
                : customer.services.tailor.url(),
            match: isCustomer
                ? customer.tailor.configure.url()
                : '/app/services/tailor',
        },
        {
            label: 'Katalog',
            href: customer.catalog.index.url(),
            match: '/app/catalog',
        },
        {
            label: 'Pesanan',
            href: customer.orders.index.url(),
            match: '/app/orders',
        },
        {
            label: 'Pembayaran',
            href: customer.payments.index.url(),
            match: '/app/payments',
        },
        {
            label: 'Profil',
            href: customer.profile.edit.url({
                query: { section: 'profile' },
            }),
            match: '/app/profile',
        },
    ];

    const handleLogout = () => {
        setShowLogoutDialog(false);
        router.post(logout().url);
    };

    return (
        <div className="min-h-screen bg-[#eef3fb] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_32%),linear-gradient(180deg,_#f7f9fe_0%,_#eef3fb_100%)] pb-[env(safe-area-inset-bottom)] text-[#0F172A]">
            <AppToaster />

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
                                <CustomerNotificationPopover
                                    notifications={recentNotifications}
                                    unreadCount={unreadNotificationsCount}
                                />
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
                                    onClick={() => setShowLogoutDialog(true)}
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
                <div className="mt-2">{children}</div>
            </div>

            <CustomerMobileBottomBar
                currentUrl={currentUrl}
                pageProps={page.props}
            />

            <AlertDialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin keluar dari akun Anda? Anda
                            perlu login kembali untuk mengakses fitur.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>
                            Ya, Keluar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
