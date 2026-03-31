import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MagneticButtonProps = {
    children: ReactNode;
    className?: string;
    external?: boolean;
    href?: NonNullable<InertiaLinkProps['href']>;
    onClick?: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
};

export function MagneticButton({
    children,
    className,
    external = false,
    href,
    onClick,
    variant = 'default',
}: MagneticButtonProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 180, damping: 18, mass: 0.5 });
    const springY = useSpring(y, { stiffness: 180, damping: 18, mass: 0.5 });

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
        if (!wrapperRef.current) {
            return;
        }

        const bounds = wrapperRef.current.getBoundingClientRect();
        const deltaX = event.clientX - (bounds.left + bounds.width / 2);
        const deltaY = event.clientY - (bounds.top + bounds.height / 2);

        x.set(deltaX * 0.12);
        y.set(deltaY * 0.12);
    }

    function handlePointerLeave() {
        x.set(0);
        y.set(0);
    }

    const sharedClassName = cn(
        buttonVariants({ variant }),
        'h-12 rounded-full px-6 text-sm font-semibold shadow-[0_20px_45px_rgba(26,24,48,0.12)] transition-transform duration-300',
        variant === 'default' &&
            'bg-[var(--landing-primary)] text-white hover:bg-[color-mix(in_srgb,var(--landing-primary)_88%,white)]',
        variant === 'outline' &&
            'border-white/40 bg-white/12 text-white backdrop-blur-md hover:bg-white/18 hover:text-white',
        className,
    );

    return (
        <motion.div
            ref={wrapperRef}
            className="inline-flex"
            style={{ x: springX, y: springY }}
            onPointerLeave={handlePointerLeave}
            onPointerMove={handlePointerMove}
        >
            {typeof href === 'string' && (href.startsWith('#') || external) ? (
                <a
                    className={sharedClassName}
                    href={href}
                    onClick={onClick}
                    rel={external ? 'noreferrer' : undefined}
                    target={external ? '_blank' : undefined}
                >
                    {children}
                </a>
            ) : href ? (
                <Link className={sharedClassName} href={href} onClick={onClick}>
                    {children}
                </Link>
            ) : (
                <button
                    className={sharedClassName}
                    onClick={onClick}
                    type="button"
                >
                    {children}
                </button>
            )}
        </motion.div>
    );
}
