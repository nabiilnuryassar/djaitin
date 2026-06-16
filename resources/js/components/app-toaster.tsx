import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import type { SharedPageProps } from '@/types/auth';

export function AppToaster() {
    const { flash } = usePage<SharedPageProps>().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, {
                description: 'Notifikasi Djaitin',
            });
        }
        if (flash.error) {
            toast.error(flash.error, {
                description: 'Notifikasi Djaitin',
            });
        }
    }, [flash.success, flash.error]);

    return (
        <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
        />
    );
}
