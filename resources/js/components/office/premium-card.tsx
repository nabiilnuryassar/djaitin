import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
    padded?: boolean;
}

export function PremiumCard({ className, padded = true, ...props }: PremiumCardProps) {
    return <div className={cn('office-surface-premium', padded && 'p-5 md:p-6', className)} {...props} />;
}
