import { Head, Link } from '@inertiajs/react';
import { LayoutGrid, PackageCheck, Layers3 } from 'lucide-react';
import { PageHeader } from '@/components/office/page-header';
import { PremiumCard } from '@/components/office/premium-card';
import OfficeLayout from '@/layouts/office-layout';
import office from '@/routes/office';

// Office Primitives

const breadcrumbs = [{ title: 'CMS', href: '/cms/dashboard' }];

export default function CmsDashboard() {
    return (
        <OfficeLayout breadcrumbs={breadcrumbs}>
            <Head title="CMS Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Admin"
                    title="CMS Dashboard"
                    description="Kelola narasi landing page, katalog ready-to-wear, dan konfigurasi master data."
                />

                <div className="grid gap-6 md:grid-cols-3">
                    <PremiumCard className="flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                                <LayoutGrid className="size-6" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-base font-bold text-brand-ink">Konten Landing</h3>
                                <p className="text-xs text-muted-foreground leading-5">
                                    Kelola narasi homepage, testimonial customer, dan Call to Action (CTA) pada halaman depan.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-border/50">
                            <button
                                type="button"
                                className="w-full text-left text-xs font-semibold text-muted-foreground"
                                disabled
                            >
                                Segera Hadir (Legacy normalized)
                            </button>
                        </div>
                    </PremiumCard>

                    <PremiumCard className="flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                                <PackageCheck className="size-6" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-base font-bold text-brand-ink">Katalog Ready-to-Wear</h3>
                                <p className="text-xs text-muted-foreground leading-5">
                                    Kelola produk ready-to-wear, pantau ketersediaan stok, harga jual, dan status clearance.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-border/50">
                            <Link
                                href={office.admin.products.index()}
                                className="inline-flex text-xs font-semibold text-brand-blue hover:text-brand-blue-deep hover:underline"
                            >
                                Kelola Produk RTW &rarr;
                            </Link>
                        </div>
                    </PremiumCard>

                    <PremiumCard className="flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                                <Layers3 className="size-6" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-base font-bold text-brand-ink">Master Data</h3>
                                <p className="text-xs text-muted-foreground leading-5">
                                    Atur model pakaian, tipe bahan kain, tarif dasar pengiriman, dan biaya penyesuaian operasional.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-border/50">
                            <Link
                                href={office.admin.garmentModels.index()}
                                className="inline-flex text-xs font-semibold text-brand-blue hover:text-brand-blue-deep hover:underline"
                            >
                                Kelola Master Data &rarr;
                            </Link>
                        </div>
                    </PremiumCard>
                </div>
            </div>
        </OfficeLayout>
    );
}
