import type {ReactNode} from 'react';
import { PremiumCard } from '@/components/office/premium-card';

interface FilterBarProps {
    children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
    return <PremiumCard className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">{children}</PremiumCard>;
}
