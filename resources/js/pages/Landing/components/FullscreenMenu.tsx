import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowUpRight, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from '@/components/ui/sheet';
import type { LandingNavItem } from '../types';
import { Logo } from '@/components/Logo';

type FullscreenMenuProps = {
    actionHref: NonNullable<InertiaLinkProps['href']>;
    actionLabel: string;
    navItems: LandingNavItem[];
    onNavigate: (sectionId: string) => void;
    onOpenChange: (open: boolean) => void;
    open: boolean;
};

export function FullscreenMenu({
    actionHref,
    actionLabel,
    navItems,
    onNavigate,
    onOpenChange,
    open,
}: FullscreenMenuProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="h-screen border-none bg-[#161329] px-6 py-6 text-white sm:max-w-none md:px-10"
                side="top"
            >
                <div className="mx-auto flex h-full max-w-7xl flex-col">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-left">
                            <Logo />
                            <SheetTitle className="text-left [font-family:var(--landing-heading-font)] text-xl font-semibold text-white">
                                djaitin
                            </SheetTitle>
                            <SheetDescription className="mt-2 text-left text-sm text-white/60">
                                Sistem operasi yang lebih rapi untuk konveksi,
                                tailor, dan ready-to-wear.
                            </SheetDescription>
                        </div>
                        <Button
                            className="rounded-full border border-white/15 bg-white/8 text-white hover:bg-white/15 hover:text-white"
                            onClick={() => onOpenChange(false)}
                            size="icon"
                            type="button"
                            variant="ghost"
                        >
                            <X className="size-5" />
                        </Button>
                    </div>
                    <div className="mt-12 grid flex-1 gap-10 lg:grid-cols-[1fr_0.42fr]">
                        <div className="space-y-5">
                            {navItems.map((item, index) => (
                                <motion.button
                                    animate={{ opacity: 1, x: 0 }}
                                    className="block text-left"
                                    initial={{ opacity: 0, x: -24 }}
                                    key={item.id}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        onOpenChange(false);
                                    }}
                                    transition={{
                                        delay: index * 0.06,
                                        duration: 0.32,
                                        ease: 'easeOut',
                                    }}
                                    type="button"
                                >
                                    <span className="text-xs font-semibold tracking-[0.3em] text-white/45 uppercase">
                                        {item.kicker}
                                    </span>
                                    <span className="mt-2 block text-4xl font-bold tracking-tight text-white transition hover:text-[var(--landing-accent)] md:text-6xl">
                                        {item.label}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                        <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/6 p-6">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.24em] text-white/45 uppercase">
                                    Kenapa djaitin
                                </p>
                                <p className="mt-4 text-xl leading-8 text-white/90">
                                    Semua modul dirangkai sebagai satu alur:
                                    payment gate, stok, produksi, sampai laporan
                                    owner.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <Link
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-white"
                                    href={actionHref}
                                >
                                    {actionLabel}
                                    <ArrowUpRight className="size-4" />
                                </Link>
                                <div className="space-y-3 text-sm text-white/60">
                                    <p>hello@djaitin.app</p>
                                    <p>WhatsApp demo operasional by request</p>
                                    <p>Jakarta · Bandung · remote onboarding</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
