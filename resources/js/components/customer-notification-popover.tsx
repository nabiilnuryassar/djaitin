import { Form, Link } from '@inertiajs/react';
import { Bell, CheckCheck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import customer from '@/routes/customer';

type NotificationRow = {
    id: string;
    type: string;
    title: string;
    message: string;
    order_id: number | null;
    order_number: string | null;
    read_at: string | null;
    created_at: string | null;
};

type Props = {
    notifications: NotificationRow[];
    unreadCount: number;
};

export function CustomerNotificationPopover({
    notifications,
    unreadCount,
}: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="relative inline-flex size-10 items-center justify-center rounded-full bg-white text-[#162044] ring-1 ring-[#dbe4f5] transition hover:bg-[#f3f7ff]"
                    aria-label="Buka notifikasi"
                >
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#f4b21a] px-1 py-0.5 text-[10px] font-semibold text-[#162044]">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border-[#DBEAFE] bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            >
                <div className="border-b border-[#DBEAFE] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="[font-family:var(--font-heading)] text-base font-semibold text-[#0F172A]">
                                Notifikasi
                            </p>
                            <p className="text-xs text-slate-500">
                                Update pembayaran, order, dan pengiriman.
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Form
                                {...customer.notifications.readAll.form()}
                                options={{ preserveScroll: true }}
                            >
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-[#DBEAFE] text-xs text-[#1B5EC5]"
                                >
                                    <CheckCheck className="size-3.5" />
                                    Baca semua
                                </Button>
                            </Form>
                        )}
                    </div>
                </div>

                <div className="max-h-[28rem] overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                        <div className="grid gap-2 px-4 py-8 text-center text-sm text-slate-500">
                            <Bell className="mx-auto size-8 text-slate-300" />
                            Belum ada notifikasi.
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={
                                    notification.read_at === null
                                        ? 'rounded-xl bg-[#F8FAFF] p-3 ring-1 ring-[#BFDBFE]'
                                        : 'rounded-xl p-3 hover:bg-slate-50'
                                }
                            >
                                <div className="flex gap-3">
                                    <div className="mt-0.5 rounded-xl bg-[#EFF4FF] p-2 text-[#2563EB]">
                                        <Package className="size-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-semibold text-[#0F172A]">
                                                {notification.title}
                                            </p>
                                            {notification.read_at === null && (
                                                <span className="rounded-full bg-[#F9C11A]/20 px-2 py-0.5 text-[10px] font-semibold text-[#B77900]">
                                                    Baru
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs leading-5 text-slate-600">
                                            {notification.message}
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                            <span>
                                                {notification.created_at ?? '-'}
                                            </span>
                                            {notification.order_id !== null && (
                                                <Link
                                                    href={customer.orders.show(
                                                        notification.order_id,
                                                    )}
                                                    className="font-medium text-[#2563EB]"
                                                >
                                                    Lihat order
                                                </Link>
                                            )}
                                            {notification.read_at === null && (
                                                <Form
                                                    {...customer.notifications.read.form(
                                                        notification.id,
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    <button
                                                        type="submit"
                                                        className="font-medium text-[#2563EB]"
                                                    >
                                                        Tandai dibaca
                                                    </button>
                                                </Form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
