import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { useForceLightTheme } from '@/hooks/use-force-light-theme';
import type { AppLayoutProps } from '@/types';

export default function OfficeLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    useForceLightTheme();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}
