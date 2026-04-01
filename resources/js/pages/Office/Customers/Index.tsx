import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardController from '@/actions/App/Http/Controllers/Office/DashboardController';
import {
    create as createCustomer,
    index as customersIndex,
    show as showCustomer,
} from '@/actions/App/Http/Controllers/Office/CustomerController';
import { FlashMessage } from '@/components/flash-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import OfficeLayout from '@/layouts/office-layout';
import type { BreadcrumbItem } from '@/types';

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

                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                                Daftar pelanggan
                            </CardTitle>
                            <CardDescription>
                                Cari pelanggan berdasarkan nama atau nomor
                                telepon.
                            </CardDescription>
                        </div>
                        {can.create && (
                            <Button asChild>
                                <Link href={createCustomer()}>
                                    Tambah pelanggan
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={submit} className="flex gap-3">
                            <Input
                                value={form.data.search}
                                onChange={(event) =>
                                    form.setData('search', event.target.value)
                                }
                                placeholder="Cari pelanggan..."
                            />
                            <Button type="submit" variant="outline">
                                Cari
                            </Button>
                        </form>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {customers.data.length === 0 ? (
                                <div className="col-span-full rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                    Tidak ada pelanggan yang cocok dengan
                                    pencarian.
                                </div>
                            ) : (
                                customers.data.map((customer) => (
                                    <Link
                                        key={customer.id}
                                        href={showCustomer(customer.id)}
                                        className="rounded-xl border p-5 transition hover:border-primary/40 hover:bg-accent/20"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {customer.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {customer.phone ??
                                                        'Nomor telepon belum diisi'}
                                                </p>
                                            </div>
                                            {customer.is_loyalty_eligible && (
                                                <Badge>Loyal</Badge>
                                            )}
                                        </div>
                                        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                                            <p>
                                                {customer.address ??
                                                    'Alamat belum diisi'}
                                            </p>
                                            <p>
                                                {customer.orders_count} order
                                                tercatat, loyal count{' '}
                                                {customer.loyalty_order_count}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}
