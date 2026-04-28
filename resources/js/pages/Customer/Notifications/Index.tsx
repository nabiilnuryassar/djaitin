import { Head, Link, usePoll } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    Palette,
    Package,
    Truck,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

type NotificationRow = {
    id: string;
    type: string;
    title: string;
    message: string;
    order_id: number | null;
    order_number: string | null;
    payment_amount: number | null;
    rejection_reason: string | null;
    tracking_number: string | null;
    courier_name: string | null;
    read_at: string | null;
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    notifications: {
        data: NotificationRow[];
        links: PaginationLink[];
    };
};

export default function CustomerNotificationsIndex({ notifications }: Props) {
    usePoll(15000);

    return (
        <CustomerLayout>
            <Head title="Notifikasi" />

            <div className="space-y-6">
                <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.08)]">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="[font-family:var(--font-heading)] text-2xl font-semibold text-[#0F172A]">
                                Notifikasi customer
                            </CardTitle>
                            <p className="text-sm text-slate-600">
                                Update pembayaran, progres order, dan pengiriman
                                terbaru tampil di sini.
                            </p>
                        </div>
                        <form {...customer.notifications.readAll.form()}>
                            <Button type="submit">
                                <CheckCheck className="size-4" />
                                Tandai Semua Dibaca
                            </Button>
                        </form>
                    </CardHeader>
                </Card>

                {notifications.data.length === 0 ? (
                    <Card className="border-0 bg-white shadow-[0_16px_50px_rgba(37,99,235,0.06)]">
                        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                            <Bell className="size-10 text-slate-300" />
                            <p className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Belum ada notifikasi
                            </p>
                            <p className="max-w-xl text-sm leading-6 text-slate-600">
                                Saat pembayaran diverifikasi, order diproses,
                                atau pengiriman bergerak, update-nya akan muncul
                                di halaman ini.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {notifications.data.map((notification) => (
                            <Card
                                key={notification.id}
                                className={
                                    notification.read_at === null
                                        ? 'border-[#BFDBFE] bg-[#F8FAFF] shadow-[0_12px_30px_rgba(37,99,235,0.08)]'
                                        : 'border-slate-200/80 bg-white shadow-sm'
                                }
                            >
                                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                                    <div className="flex gap-4">
                                        <div className="rounded-2xl bg-[#EFF4FF] p-3 text-[#2563EB]">
                                            <NotificationIcon
                                                type={notification.type}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="[font-family:var(--font-heading)] text-lg font-semibold text-[#0F172A]">
                                                    {notification.title}
                                                </p>
                                                {notification.read_at ===
                                                    null && (
                                                    <span className="rounded-full bg-[#F9C11A]/20 px-2 py-1 text-[11px] font-semibold text-[#B77900]">
                                                        Baru
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm leading-6 text-slate-600">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                                {notification.created_at ?? '-'}
                                            </p>
                                            <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                                                {notification.payment_amount !==
                                                    null && (
                                                    <span>
                                                        Nominal:{' '}
                                                        {formatCurrency(
                                                            notification.payment_amount,
                                                        )}
                                                    </span>
                                                )}
                                                {notification.tracking_number && (
                                                    <span>
                                                        Resi:{' '}
                                                        {
                                                            notification.tracking_number
                                                        }
                                                    </span>
                                                )}
                                                {notification.courier_name && (
                                                    <span>
                                                        Kurir:{' '}
                                                        {
                                                            notification.courier_name
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            {notification.rejection_reason && (
                                                <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">
                                                    {
                                                        notification.rejection_reason
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 md:justify-end">
                                        {notification.order_id !== null ? (
                                            <Button asChild variant="outline">
                                                <Link
                                                    href={customer.orders.show(
                                                        notification.order_id,
                                                    )}
                                                >
                                                    Lihat Order
                                                </Link>
                                            </Button>
                                        ) : null}
                                        {notification.read_at === null && (
                                            <form
                                                {...customer.notifications.read.form(
                                                    notification.id,
                                                )}
                                            >
                                                <Button type="submit">
                                                    Tandai Dibaca
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {notifications.links.map((link) => (
                        <Button
                            key={`${link.label}-${link.url ?? 'null'}`}
                            asChild={link.url !== null}
                            type="button"
                            variant={link.active ? 'default' : 'outline'}
                            className="min-w-11"
                            disabled={link.url === null}
                        >
                            {link.url === null ? (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <Link
                                    href={link.url}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            )}
                        </Button>
                    ))}
                </div>
            </div>
        </CustomerLayout>
    );
}

function NotificationIcon({ type }: { type: string }) {
    if (type.includes('payment')) {
        return <Wallet className="size-5" />;
    }

    if (type.includes('shipped')) {
        return <Truck className="size-5" />;
    }

    if (type.includes('design')) {
        return <Palette className="size-5" />;
    }

    return <Package className="size-5" />;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
