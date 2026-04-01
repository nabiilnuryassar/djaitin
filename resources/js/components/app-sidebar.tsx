import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    ClipboardList,
    CreditCard,
    LayoutDashboard,
    PackageCheck,
    ScrollText,
    Shield,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
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
import type { SharedPageProps } from '@/types/auth';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<SharedPageProps>().props;
    const role = auth.user?.role;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: office.dashboard(),
            icon: LayoutDashboard,
        },
        {
            title: 'Pesanan',
            href: office.orders.index(),
            icon: ClipboardList,
        },
        {
            title: 'Produksi',
            href: office.production.index(),
            icon: PackageCheck,
        },
        {
            title: 'Pengiriman',
            href: office.shipping.index(),
            icon: Archive,
        },
        {
            title: 'Pembayaran',
            href: office.payments.index(),
            icon: CreditCard,
        },
        {
            title: 'Pelanggan',
            href: office.customers.index(),
            icon: Users,
        },
        {
            title: 'Laporan',
            href: office.reports.index(),
            icon: ScrollText,
        },
        {
            title: 'Audit Log',
            href: office.auditLog.index(),
            icon: Shield,
        },
    ];

    if (role === 'admin' || role === 'owner') {
        mainNavItems.push({
            title: 'Admin',
            href: office.admin.users.index(),
            icon: Shield,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={office.dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <Separator className="bg-sidebar-border" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
