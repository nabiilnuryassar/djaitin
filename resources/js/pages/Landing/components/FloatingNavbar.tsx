import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Menu } from 'lucide-react';
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
            <div className="fixed inset-x-0 top-4 z-50 px-4 hidden md:block">
                <div
                    className={cn(
                        'mx-auto flex max-w-6xl items-center justify-between rounded-full border px-4 py-3 transition-all duration-300 md:px-6',
                        isScrolled
                            ? 'border-white/12 bg-[#09070F]/86 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl'
                            : 'border-white/10 bg-[#09070F]/68 shadow-[0_24px_72px_rgba(0,0,0,0.28)] backdrop-blur-lg',
                    )}
                >
                    <button
                        className="flex items-center gap-3 text-left"
                        onClick={() => onNavigate('hero')}
                        type="button"
                    >
                        <Logo />
                        <div>
                            <p className="[font-family:var(--landing-heading-font)] text-sm font-semibold text-white">
                                djaitin
                            </p>
                            <p className="text-xs text-white/52">
                                Sistem Informasi Konveksi & Tailor
                            </p>
                        </div>
                    </button>
                    <div className="hidden items-center gap-2 lg:flex">
                        {navItems.map((item) => (
                            <button
                                className="rounded-full px-4 py-2 text-sm font-medium text-white/68 transition hover:bg-white/10 hover:text-white"
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                type="button"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            className="hidden rounded-full border border-white/14 bg-white/8 px-5 text-white hover:bg-white/14 md:inline-flex"
                        >
                            <Link href={actionHref}>{actionLabel}</Link>
                        </Button>
                        <Button
                            className="rounded-full border border-white/12 bg-white/8 px-4 text-white hover:bg-white/14"
                            onClick={() => setIsMenuOpen(true)}
                            type="button"
                            variant="ghost"
                        >
                            <Menu className="size-4" />
                            Menu
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
            />
        </>
    );
}
