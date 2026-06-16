import { AppToaster } from '@/components/app-toaster';
import { useForceLightTheme } from '@/hooks/use-force-light-theme';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default function OfficeLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    useForceLightTheme();

    return (
        <>
            <AppToaster />
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
        </>
    );
}
