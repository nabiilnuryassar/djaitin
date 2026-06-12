import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    create as createCustomer,
    index as customersIndex,
    show as showCustomer,
} from '@/actions/App/Http/Controllers/Office/CustomerController';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/office/page-header';
import { FilterBar } from '@/components/office/filter-bar';
import { EmptyState } from '@/components/office/empty-state';
import OfficeLayout from '@/layouts/office-layout';
import type { BreadcrumbItem } from '@/types';
import { Users } from 'lucide-react';

type Props = {
    filters: {
        search: string;
    };
    customers: {
        data: Array<{
            id: number;
            name: string;
            phone: string | null;
            address: string | null;
            is_loyalty_eligible: boolean;
            loyalty_order_count: number;
            orders_count: number;
        }>;
    };
    can: {
        create: boolean;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: DashboardController() },
    { title: 'Pelanggan', href: customersIndex() },
];

export default function CustomersIndex({ filters, customers, can }: Props) {
    const form = useForm({
        search: filters.search,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            customersIndex.url({
                query: {
                    search: form.data.search || null,
                },
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="Pelanggan" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    eyebrow="Pelanggan"
                    title="Daftar Pelanggan"
                    description="Kelola dan cari data pelanggan tailor Anda."
                    actions={
                        can.create && (
                            <Button asChild className="rounded-xl cursor-pointer bg-brand-blue text-white hover:bg-brand-blue-deep">
                                <Link href={createCustomer()}>
                                    Tambah pelanggan
                                </Link>
                            </Button>
                        )
                    }
                />

                <FilterBar>
                    <form onSubmit={submit} className="flex w-full gap-3">
                        <Input
                            value={form.data.search}
                            onChange={(event) =>
                                form.setData('search', event.target.value)
                            }
                            placeholder="Cari pelanggan berdasarkan nama atau nomor telepon..."
                            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-brand-ink flex-1"
                        />
                        <Button type="submit" variant="outline" className="rounded-xl cursor-pointer border-brand-blue text-brand-blue hover:bg-brand-blue/5">
                            Cari
                        </Button>
                    </form>
                </FilterBar>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {customers.data.length === 0 ? (
                        <div className="col-span-full">
                            <EmptyState
                                icon={Users}
                                title="Tidak ada pelanggan"
                                description="Tidak ada pelanggan yang cocok dengan pencarian."
                            />
                        </div>
                    ) : (
                        customers.data.map((customer) => (
                            <Link
                                key={customer.id}
                                href={showCustomer(customer.id)}
                                className="office-surface-premium p-5 transition hover:border-brand-blue/40 hover:bg-brand-blue/5 block cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-brand-ink text-base">
                                            {customer.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {customer.phone ??
                                                'Nomor telepon belum diisi'}
                                        </p>
                                    </div>
                                    {customer.is_loyalty_eligible && (
                                        <Badge className="bg-brand-gold hover:bg-brand-gold/90 text-brand-ink rounded-full px-2.5 font-semibold text-xs border-0">
                                            Loyal
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-4 space-y-1 text-sm text-muted-foreground border-t border-border/40 pt-3">
                                    <p className="line-clamp-2 min-h-[40px]">
                                        {customer.address ??
                                            'Alamat belum diisi'}
                                    </p>
                                    <p className="text-xs text-brand-blue-deep font-semibold mt-2">
                                        {customer.orders_count} order tercatat, loyal count{' '}
                                        {customer.loyalty_order_count}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </OfficeLayout>
    );
}
