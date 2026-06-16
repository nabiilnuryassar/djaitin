import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    ClipboardList,
    CreditCard,
    Layers3,
    LayoutDashboard,
    PackageCheck,
    ScrollText,
    Shield,
    Tag,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavGroup } from '@/components/nav-group';
import { NavUser } from '@/components/nav-user';
import { Separator } from '@/components/ui/separator';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import office from '@/routes/office';
import type { NavItem } from '@/types';
import type { SharedPageProps } from '@/types/auth';

export function AppSidebar() {
    const { auth } = usePage<SharedPageProps>().props;
    const role = auth.user?.role;
    const operasionalItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: office.dashboard.url(),
            icon: LayoutDashboard,
        },
        {
            title: 'Pesanan',
            href: office.orders.index.url(),
            icon: ClipboardList,
        },
        {
            title: 'Produksi',
            href: office.production.index.url(),
            icon: PackageCheck,
        },
        {
            title: 'Pengiriman',
            href: office.shipping.index.url(),
            icon: Archive,
        },
        {
            title: 'Pembayaran',
            href: office.payments.index.url(),
            icon: CreditCard,
        },
        {
            title: 'Pelanggan',
            href: office.customers.index.url(),
            icon: Users,
        },
    ];

    const reportingItems: NavItem[] = [
        {
            title: 'Laporan',
            href: office.reports.index.url(),
            icon: ScrollText,
        },
        {
            title: 'Audit Log',
            href: office.auditLog.index.url(),
            icon: Shield,
        },
    ];

    const adminItems: NavItem[] = [];

    if (role === 'admin' || role === 'owner') {
        adminItems.push(
            {
                title: 'Pengguna',
                href: office.admin.users.index.url(),
                icon: Users,
            },
            {
                title: 'Produk RTW',
                href: office.admin.products.index.url(),
                icon: PackageCheck,
            },
            {
                title: 'Master Data',
                href: office.admin.garmentModels.index.url(),
                icon: Layers3,
            },
            {
                title: 'Diskon Loyalitas',
                href: office.admin.discounts.index.url(),
                icon: Tag,
            },
        );
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={office.dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavGroup title="Operasional" items={operasionalItems} />
                <NavGroup title="Reporting" items={reportingItems} />
                {adminItems.length > 0 && (
                    <NavGroup title="Administrasi" items={adminItems} />
                )}
            </SidebarContent>

            <SidebarFooter>
                <Separator className="bg-sidebar-border" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
