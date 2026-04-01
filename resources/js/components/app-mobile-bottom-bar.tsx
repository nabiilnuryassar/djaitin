import { Link } from '@inertiajs/react';
import {
    ClipboardList,
    CreditCard,
    LayoutDashboard,
    Plus,
    Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import office from '@/routes/office';
import tailor from '@/routes/office/orders/tailor';

const navigationItems = [
    {
        label: 'Dashboard',
        href: office.dashboard(),
        icon: LayoutDashboard,
        isActive: (currentUrl: string) =>
            currentUrl === office.home.url() ||
            currentUrl === office.dashboard.url(),
    },
    {
        label: 'Pesanan',
        href: office.orders.index(),
        icon: ClipboardList,
        isActive: (currentUrl: string) =>
            currentUrl.startsWith(office.orders.index.url()),
    },
    {
        label: 'Pembayaran',
        href: office.payments.index(),
        icon: CreditCard,
        isActive: (currentUrl: string) =>
            currentUrl.startsWith(office.payments.index.url()),
    },
    {
        label: 'Pelanggan',
        href: office.customers.index(),
        icon: Users,
        isActive: (currentUrl: string) =>
            currentUrl.startsWith(office.customers.index.url()),
    },
] as const;

export function AppMobileBottomBar() {
    const { currentUrl } = useCurrentUrl();

    return (
        <motion.nav
            aria-label="Navigasi utama office"
            animate={{ y: 0, opacity: 1 }}
            className="fixed inset-x-4 bottom-4 z-50 md:hidden"
            initial={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
            <div className="mx-auto flex max-w-md items-end justify-between rounded-2xl border border-white/10 bg-[#162044]/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_8px_32px_rgba(22,32,68,0.28)] backdrop-blur-xl">
                {navigationItems.slice(0, 2).map((item) => (
                    <NavItem
                        key={item.label}
                        currentUrl={currentUrl}
                        {...item}
                    />
                ))}

                <Link
                    aria-label="Tambah order"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F9C11A] text-[#162044] shadow-[0_10px_24px_rgba(249,193,26,0.28)] transition-transform duration-200 active:scale-95"
                    href={tailor.create()}
                    prefetch
                >
                    <Plus className="size-6" />
                </Link>

                {navigationItems.slice(2).map((item) => (
                    <NavItem
                        key={item.label}
                        currentUrl={currentUrl}
                        {...item}
                    />
                ))}
            </div>
        </motion.nav>
    );
}

type NavItemProps = (typeof navigationItems)[number] & {
    currentUrl: string;
};

function NavItem({
    currentUrl,
    href,
    icon: Icon,
    isActive,
    label,
}: NavItemProps) {
    const active = isActive(currentUrl);

    return (
        <Link
            className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors duration-200',
                active ? 'text-[#F9C11A]' : 'text-white/80',
            )}
            href={href}
            prefetch
        >
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
