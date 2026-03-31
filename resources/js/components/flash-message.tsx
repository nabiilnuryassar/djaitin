import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { SharedPageProps } from '@/types/auth';

export function FlashMessage() {
    const { flash } = usePage<SharedPageProps>().props;

    if (flash.success) {
        return (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <CheckCircle2 className="text-emerald-600" />
                <AlertTitle>Berhasil</AlertTitle>
                <AlertDescription>{flash.success}</AlertDescription>
            </Alert>
        );
    }

    if (flash.error) {
        return (
            <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Terjadi kesalahan</AlertTitle>
                <AlertDescription>{flash.error}</AlertDescription>
            </Alert>
        );
    }

    return null;
}
