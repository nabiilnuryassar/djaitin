import { Link, router } from '@inertiajs/react';
import {
    Bell,
    ClipboardList,
    CreditCard,
    Home,
    LogIn,
    LogOut,
    MapPin,
    Ruler,
    ShoppingBag,
    ShoppingCart,
    Shirt,
    UserCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import customer from '@/routes/customer';
import office from '@/routes/office';
import { login, logout, register } from '@/routes';
import type { SharedPageProps } from '@/types/auth';

type MobileBarProps = {
    currentUrl: string;
    pageProps: SharedPageProps;
};

type ParentKey = 'account' | 'transactions' | null;

type GroupedNavItem = {
    label: string;
    href: ReturnType<typeof customer.home>;
    description: string;
    icon: typeof Home;
    match: string;
    section?: 'profile' | 'addresses' | 'measurements';
};

const transactionItems: GroupedNavItem[] = [
    {
        label: 'Katalog',
        href: customer.catalog.index(),
        description: 'Browse produk aktif ready-to-wear per kategori dan size.',
        icon: ShoppingBag,
        match: '/app/catalog',
    },
    {
        label: 'Keranjang',
        href: customer.cart.index(),
        description: 'Review item RTW yang sudah siap di-checkout.',
        icon: ShoppingCart,
        match: '/app/cart',
    },
    {
        label: 'Pesanan',
        href: customer.orders.index(),
        description: 'Pantau progres pesanan, detail item, dan tagihan.',
        icon: ClipboardList,
        match: '/app/orders',
    },
    {
        label: 'Pembayaran',
        href: customer.payments.index(),
        description: 'Lihat transfer pending dan unggah bukti pembayaran.',
        icon: CreditCard,
        match: '/app/payments',
    },
];

const accountItems: GroupedNavItem[] = [
    {
        label: 'Notifikasi',
        href: customer.notifications.index(),
        description: 'Lihat update pembayaran, progres order, dan status pengiriman terbaru.',
        icon: Bell,
        match: '/app/notifications',
    },
    {
        label: 'Ukuran',
        href: customer.profile.edit({
            query: { section: 'measurements' },
        }),
        description: 'Simpan measurement pribadi untuk order berikutnya.',
        icon: Ruler,
        match: '/app/profile',
        section: 'measurements',
    },
    {
        label: 'Alamat',
        href: customer.profile.edit({
            query: { section: 'addresses' },
        }),
        description: 'Kelola alamat pengiriman dan alamat default.',
        icon: MapPin,
        match: '/app/profile',
        section: 'addresses',
    },
    {
        label: 'Profil',
        href: customer.profile.edit({
            query: { section: 'profile' },
        }),
        description: 'Perbarui data akun customer yang sedang aktif.',
        icon: UserCircle2,
        match: '/app/profile',
        section: 'profile',
    },
];

export function CustomerMobileBottomBar({
    currentUrl,
    pageProps,
}: MobileBarProps) {
    const [openGroup, setOpenGroup] = useState<ParentKey>(null);
    const user = pageProps.auth.user;
    const isCustomer = user?.role === 'customer';
    const unreadNotificationsCount = pageProps.unread_notifications_count ?? 0;

    const homeHref = isCustomer ? customer.dashboard() : customer.home();
    const tailorHref = isCustomer
        ? customer.tailor.configure()
        : customer.services.tailor();

    const activeGroup = useMemo(() => {
        if (currentUrl === '/app' || currentUrl === customer.dashboard.url()) {
            return 'home';
        }

        if (
            currentUrl.startsWith(customer.services.tailor.url()) ||
            currentUrl.startsWith(customer.tailor.configure.url())
        ) {
            return 'tailor';
        }

        if (
            transactionItems.some((item) => currentUrl.startsWith(item.match))
        ) {
            return 'transactions';
        }

        if (accountItems.some((item) => currentUrl.startsWith(item.match))) {
            return 'account';
        }

        return null;
    }, [currentUrl]);

    const currentSection =
        new URL(currentUrl, 'http://localhost').searchParams.get('section') ??
        'profile';

    return (
        <>
            <motion.nav
                aria-label="Navigasi utama customer"
                animate={{ y: 0, opacity: 1 }}
                className="fixed inset-x-4 bottom-4 z-50 md:hidden"
                initial={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
                <div className="mx-auto flex max-w-md items-end justify-between rounded-2xl border border-white/10 bg-[#162044]/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_8px_32px_rgba(22,32,68,0.28)] backdrop-blur-xl">
                    <BottomLink
                        active={activeGroup === 'home'}
                        href={homeHref}
                        icon={Home}
                        label="Beranda"
                    />
                    <BottomLink
                        active={activeGroup === 'tailor'}
                        href={tailorHref}
                        icon={Shirt}
                        label="Tailor"
                    />
                    <BottomButton
                        active={activeGroup === 'transactions'}
                        icon={ClipboardList}
                        label="Transaksi"
                        onClick={() => setOpenGroup('transactions')}
                    />
                    <BottomButton
                        active={activeGroup === 'account'}
                        badge={
                            unreadNotificationsCount > 0
                                ? unreadNotificationsCount
                                : null
                        }
                        icon={UserCircle2}
                        label="Akun"
                        onClick={() => setOpenGroup('account')}
                    />
                </div>
            </motion.nav>

            <GroupedMenuSheet
                currentUrl={currentUrl}
                description="Katalog RTW, keranjang, pesanan, dan pembayaran dikelompokkan agar mobile flow tetap singkat."
                items={transactionItems}
                onClose={() => setOpenGroup(null)}
                open={openGroup === 'transactions'}
                title="Menu Belanja"
            />

            <GroupedMenuSheet
                currentSection={currentSection}
                currentUrl={currentUrl}
                description="Ukuran, alamat, dan profil customer dikelompokkan dalam satu parent menu."
                footer={
                    isCustomer ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                            onClick={() => router.post(logout().url)}
                        >
                            <LogOut className="size-4" />
                            Keluar
                        </Button>
                    ) : user ? (
                        <Button asChild className="w-full justify-start">
                            <Link href={office.dashboard()}>Buka Office</Link>
                        </Button>
                    ) : (
                        <div className="grid gap-2">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full justify-start border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                            >
                                <Link href={login()}>
                                    <LogIn className="size-4" />
                                    Masuk
                                </Link>
                            </Button>
                            <Button asChild className="w-full justify-start">
                                <Link href={register()}>Daftar</Link>
                            </Button>
                        </div>
                    )
                }
                items={accountItems}
                onClose={() => setOpenGroup(null)}
                open={openGroup === 'account'}
                unreadNotificationsCount={unreadNotificationsCount}
                title="Menu Akun"
            />
        </>
    );
}

type BottomLinkProps = {
    active: boolean;
    href: ReturnType<typeof customer.home>;
    icon: typeof Home;
    label: string;
};

function BottomLink({ active, href, icon: Icon, label }: BottomLinkProps) {
    return (
        <Link className={bottomItemClassName(active)} href={href} prefetch>
            <Icon className="size-5" />
            <span
                className={cn(
                    'h-1.5 w-1.5 rounded-full bg-transparent transition-colors duration-200',
                    active && 'bg-[#F9C11A]',
                )}
            />
            <span>{label}</span>
        </Link>
    );
}

type BottomButtonProps = {
    active: boolean;
    badge?: number | null;
    icon: typeof Home;
    label: string;
    onClick: () => void;
};

function BottomButton({
    active,
    badge,
    icon: Icon,
    label,
    onClick,
}: BottomButtonProps) {
    return (
        <button
            className={bottomItemClassName(active)}
            onClick={onClick}
            type="button"
        >
            <Icon className="size-5" />
            {badge !== null && badge !== undefined && badge > 0 && (
                <span className="absolute top-1.5 right-4 inline-flex min-w-5 items-center justify-center rounded-full bg-[#F9C11A] px-1.5 py-0.5 text-[10px] font-semibold text-[#162044]">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
            <span
                className={cn(
                    'h-1.5 w-1.5 rounded-full bg-transparent transition-colors duration-200',
                    active && 'bg-[#F9C11A]',
                )}
            />
            <span>{label}</span>
        </button>
    );
}

type GroupedMenuSheetProps = {
    currentSection?: string;
    currentUrl: string;
    description: string;
    footer?: ReactNode;
    items: GroupedNavItem[];
    onClose: () => void;
    open: boolean;
    title: string;
    unreadNotificationsCount?: number;
};

function GroupedMenuSheet({
    currentSection,
    currentUrl,
    description,
    footer,
    items,
    onClose,
    open,
    title,
    unreadNotificationsCount = 0,
}: GroupedMenuSheetProps) {
    return (
        <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <SheetContent
                side="bottom"
                className="rounded-t-[2rem] border-t-[#DBEAFE] bg-[#F8FAFF] px-0 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            >
                <SheetHeader className="border-b border-[#DBEAFE] px-6 pb-4 text-left">
                    <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-[#DBEAFE]" />
                    <SheetTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                        {title}
                    </SheetTitle>
                    <SheetDescription className="text-slate-600">
                        {description}
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-3 px-6 pt-5">
                    {items.map((item) => {
                        const isActive = item.section
                            ? currentUrl.startsWith(item.match) &&
                              currentSection === item.section
                            : currentUrl.startsWith(item.match);

                        return (
                            <Link
                                key={item.label}
                                className={cn(
                                    'flex items-start gap-4 rounded-2xl border px-4 py-4 transition-colors duration-200',
                                    isActive
                                        ? 'border-[#BFDBFE] bg-[#EFF4FF]'
                                        : 'border-[#DBEAFE] bg-white hover:bg-[#EFF4FF]/70',
                                )}
                                href={item.href}
                                onClick={onClose}
                            >
                                <div
                                    className={cn(
                                        'mt-0.5 rounded-2xl p-3',
                                        isActive
                                            ? 'bg-[#2563EB] text-white'
                                            : 'bg-[#EFF4FF] text-[#2563EB]',
                                    )}
                                >
                                    <item.icon className="size-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="[font-family:var(--font-heading)] text-base font-semibold text-[#0F172A]">
                                            {item.label}
                                        </p>
                                        {item.match === '/app/notifications' &&
                                            unreadNotificationsCount > 0 && (
                                                <span className="inline-flex items-center rounded-full bg-[#F9C11A]/20 px-2 py-0.5 text-[11px] font-semibold text-[#B77900]">
                                                    {unreadNotificationsCount}{' '}
                                                    baru
                                                </span>
                                            )}
                                        {isActive && (
                                            <span className="inline-flex items-center rounded-full bg-[#F9C11A]/20 px-2 py-0.5 text-[11px] font-semibold text-[#B77900]">
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}

                    {footer && (
                        <div className="mt-2 border-t border-[#DBEAFE] pt-4">
                            {footer}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function bottomItemClassName(active: boolean): string {
    return cn(
        'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors duration-200',
        active ? 'text-[#F9C11A]' : 'text-white/80',
    );
}
