import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LandingNavItem } from '../types';
import { FullscreenMenu } from './FullscreenMenu';
import { Logo } from '@/components/Logo';

type FloatingNavbarProps = {
    actionHref: NonNullable<InertiaLinkProps['href']>;
    actionLabel: string;
    navItems: LandingNavItem[];
    onNavigate: (sectionId: string) => void;
};

export function FloatingNavbar({
    actionHref,
    actionLabel,
    navItems,
    onNavigate,
}: FloatingNavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const tickerItems = [
        'Tailor Custom',
        'Ready-to-Wear',
        'Bulk Convection',
        'Editorial craft',
        'Reliable production',
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 80);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <div className="fixed inset-x-0 top-4 z-50 px-4 md:px-6">
                <div
                    className={cn(
                        'mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-full border px-3 py-2.5 transition-all duration-300 md:grid-cols-[auto_1fr_auto] md:gap-3 md:px-5 md:py-3',
                        isScrolled
                            ? 'border-[#123c78]/10 bg-white/88 shadow-[0_30px_90px_rgba(18,60,120,0.16)] backdrop-blur-xl'
                            : 'border-white/70 bg-white/72 shadow-[0_18px_48px_rgba(18,60,120,0.10)] backdrop-blur-lg',
                    )}
                >
                    <button
                        className="flex min-w-0 items-center gap-2.5 text-left md:gap-3"
                        onClick={() => onNavigate('hero')}
                        type="button"
                    >
                        <Logo className="size-9 shrink-0 md:size-11" />
                        <div className="min-w-0">
                            <p className="truncate [font-family:var(--landing-heading-font)] text-xl leading-none tracking-[0.04em] text-[#123c78] uppercase md:text-2xl">
                                djaitin
                            </p>
                            <p className="hidden truncate text-xs text-[#123c78]/52 sm:block">
                                Convection Taylor
                            </p>
                        </div>
                    </button>
                    <div className="hidden min-w-0 items-center gap-3 xl:flex">
                        <div className="flex items-center gap-1">
                            {navItems.slice(0, 4).map((item) => (
                                <button
                                    className="rounded-full px-4 py-2 text-sm font-medium text-[#123c78]/66 transition hover:bg-[#123c78]/6 hover:text-[#123c78]"
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    type="button"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative min-w-0 flex-1 overflow-hidden rounded-full border border-[#123c78]/10 bg-[#f6f8fb] px-4 py-2">
                            <motion.div
                                animate={{ x: ['0%', '-50%'] }}
                                className="flex w-max gap-6 text-xs font-semibold tracking-[0.22em] text-[#123c78]/70 uppercase"
                                transition={{
                                    duration: 16,
                                    ease: 'linear',
                                    repeat: Infinity,
                                }}
                            >
                                {[...tickerItems, ...tickerItems].map(
                                    (item, index) => (
                                        <span key={`${item}-${index}`}>
                                            {item}
                                        </span>
                                    ),
                                )}
                            </motion.div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            className="hidden rounded-full bg-[#123c78] px-5 text-white hover:bg-[#0e3163] lg:inline-flex"
                        >
                            <Link href={actionHref}>{actionLabel}</Link>
                        </Button>
                        <Button
                            className="rounded-full border border-[#123c78]/12 bg-white px-3 text-[#123c78] hover:bg-[#f1f5fb] md:px-4"
                            onClick={() => setIsMenuOpen(true)}
                            type="button"
                            variant="ghost"
                        >
                            <Menu className="size-4" />
                            <span className="text-sm md:text-base">Menu</span>
                        </Button>
                    </div>
                </div>
            </div>
            <FullscreenMenu
                actionHref={actionHref}
                actionLabel={actionLabel}
                navItems={navItems}
                onNavigate={onNavigate}
                onOpenChange={setIsMenuOpen}
                open={isMenuOpen}
                tickerItems={tickerItems}
            />
        </>
    );
}
