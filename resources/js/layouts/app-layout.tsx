import OfficeLayout from '@/layouts/office-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <OfficeLayout breadcrumbs={breadcrumbs} {...props}>
        {children}
    </OfficeLayout>
);
