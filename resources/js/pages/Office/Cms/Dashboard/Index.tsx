import { Head } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import OfficeLayout from '@/layouts/office-layout';

export default function CmsDashboard() {
    return (
        <OfficeLayout breadcrumbs={[{ title: 'CMS', href: '/cms/dashboard' }]}>
            <Head title="CMS Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="[font-family:var(--font-heading)] text-xl font-semibold text-[#0F172A]">
                            CMS Dashboard
                        </CardTitle>
                        <CardDescription>
                            Surface CMS legacy sudah dinormalisasi ke area
                            office.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Redirect `/cms/dashboard` tetap aktif ke
                        `/office/dashboard`.
                    </CardContent>
                </Card>
            </div>
        </OfficeLayout>
    );
}
