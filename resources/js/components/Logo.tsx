import { cn } from '@/lib/utils';
import logo from '../../images/logo/logo-djaitin-transparan.png';

type LogoProps = {
    className?: string;
};

export function Logo({ className }: LogoProps) {
    return (
        <img
            alt="djaitin logo"
            className={cn('size-10 object-contain', className)}
            src={logo}
        />
    );
}
