import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowUpRight, Instagram, Mail, Phone, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from '@/components/ui/sheet';
import { Logo } from '@/components/Logo';
import type { LandingNavItem } from '../types';

type FullscreenMenuProps = {
    actionHref: NonNullable<InertiaLinkProps['href']>;
    actionLabel: string;
    navItems: LandingNavItem[];
    onNavigate: (sectionId: string) => void;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    tickerItems: string[];
};

const newsItems = [
    {
        title: 'Custom tailoring for more personal garment direction.',
        tag: 'Tailor Custom',
    },
    {
        title: 'Ready-to-wear for a faster yet still polished selection path.',
        tag: 'Ready-to-Wear',
    },
    {
        title: 'Bulk convection for uniforms, events, brands, and recurring operational needs.',
        tag: 'Bulk Convection',
    },
];

function RevealWord({ text }: { text: string }) {
    return (
        <span
            aria-label={text}
            className="inline-flex flex-wrap overflow-hidden"
        >
            {text.split('').map((character, index) => (
                <span
                    className="inline-block transition-transform duration-300 group-hover:-translate-y-full"
                    key={`${text}-${index}`}
                >
                    <span className="relative inline-block">
                        {character === ' ' ? '\u00A0' : character}
                        <span className="absolute top-full left-0 inline-block">
                            {character === ' ' ? '\u00A0' : character}
                        </span>
                    </span>
                </span>
            ))}
        </span>
    );
}

export function FullscreenMenu({
    actionHref,
    actionLabel,
    navItems,
    onNavigate,
    onOpenChange,
    open,
    tickerItems,
}: FullscreenMenuProps) {
    const [activeNewsIndex, setActiveNewsIndex] = useState(0);

    useEffect(() => {
        if (!open) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setActiveNewsIndex((current) => (current + 1) % newsItems.length);
        }, 2800);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [open]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="h-screen overflow-y-auto border-none bg-[linear-gradient(180deg,#fafaf7_0%,#f1f5fb_100%)] px-4 py-4 text-[#123c78] sm:max-w-none md:px-10 md:py-6"
                side="top"
            >
                <div className="mx-auto flex min-h-full max-w-7xl flex-col">
                    <div className="flex items-start justify-between gap-3 md:gap-4">
                        <div className="flex min-w-0 items-start gap-3 md:items-center md:gap-4">
                            <Logo className="size-10 shrink-0 md:size-12" />
                            <div className="min-w-0">
                                <SheetTitle className="truncate [font-family:var(--landing-heading-font)] text-3xl leading-none tracking-[0.04em] text-[#123c78] uppercase md:text-4xl">
                                    Djaitin
                                </SheetTitle>
                                <SheetDescription className="mt-1 max-w-md text-sm leading-6 text-[#123c78]/68 md:mt-2 md:leading-7">
                                    A modern convection brand for custom
                                    tailoring, ready-to-wear, and structured
                                    production.
                                </SheetDescription>
                            </div>
                        </div>
                        <Button
                            className="rounded-full border border-[#123c78]/12 bg-white/90 text-[#123c78] hover:bg-white"
                            onClick={() => onOpenChange(false)}
                            size="icon"
                            type="button"
                            variant="ghost"
                        >
                            <X className="size-5" />
                        </Button>
                    </div>

                    <div className="mt-8 grid gap-5 md:mt-12 md:gap-8 xl:grid-cols-[0.78fr_1.22fr]">
                        <div className="order-2 flex flex-col gap-5 rounded-[1.8rem] border border-[#123c78]/10 bg-white px-4 py-5 shadow-[0_24px_60px_rgba(18,60,120,0.08)] md:order-1 md:rounded-[2.2rem] md:px-6 md:py-6">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.28em] text-[#3b73b9] uppercase">
                                    Contact & Socials
                                </p>
                                <div className="mt-5 space-y-3 text-sm text-[#123c78]/78 md:mt-6 md:space-y-4">
                                    <a
                                        className="flex items-center gap-3"
                                        href="mailto:hello@djaitin.co"
                                    >
                                        <Mail className="size-4" />
                                        hello@djaitin.co
                                    </a>
                                    <a
                                        className="flex items-center gap-3"
                                        href="https://wa.me/6281234567890"
                                    >
                                        <Phone className="size-4" />
                                        WhatsApp Consultation
                                    </a>
                                    <a
                                        className="flex items-center gap-3"
                                        href="https://instagram.com/djaitin"
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <Instagram className="size-4" />
                                        @djaitin
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="hidden overflow-hidden rounded-full border border-[#123c78]/10 bg-[#f6f8fb] px-4 py-3 md:block">
                                    <motion.div
                                        animate={{ x: ['0%', '-50%'] }}
                                        className="flex w-max gap-6 text-xs font-semibold tracking-[0.22em] text-[#123c78]/72 uppercase"
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
                                <div className="flex flex-wrap gap-2 md:hidden">
                                    {tickerItems.slice(0, 3).map((item) => (
                                        <span
                                            className="rounded-full border border-[#123c78]/10 bg-[#f6f8fb] px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.16em] text-[#123c78]/72 uppercase"
                                            key={item}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>

                                <div className="rounded-[1.5rem] bg-[#123c78] p-5 text-white md:rounded-[1.7rem] md:p-6">
                                    <p className="text-xs font-semibold tracking-[0.24em] text-white/68 uppercase">
                                        Primary action
                                    </p>
                                    <Link
                                        className="mt-3 inline-flex items-center gap-2 [font-family:var(--landing-heading-font)] text-2xl tracking-[0.04em] uppercase"
                                        href={actionHref}
                                    >
                                        {actionLabel}
                                        <ArrowUpRight className="size-5" />
                                    </Link>
                                    <p className="mt-3 text-sm leading-6 text-white/72 md:leading-7">
                                        Djaitin helps customers move from custom
                                        requests to scaled garment production
                                        with more certainty.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 grid gap-5 md:gap-6 xl:order-2">
                            <div className="grid gap-4 rounded-[1.8rem] border border-[#123c78]/10 bg-white/66 p-5 shadow-[0_24px_60px_rgba(18,60,120,0.05)] md:gap-5 md:rounded-[2.2rem] md:p-7">
                                {navItems.map((item, index) => (
                                    <motion.button
                                        animate={{ opacity: 1, x: 0 }}
                                        className="group block text-left"
                                        initial={{ opacity: 0, x: -24 }}
                                        key={item.id}
                                        onClick={() => {
                                            onNavigate(item.id);
                                            onOpenChange(false);
                                        }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.28,
                                            ease: 'easeOut',
                                        }}
                                        type="button"
                                    >
                                        <span className="text-xs font-semibold tracking-[0.3em] text-[#123c78]/38 uppercase">
                                            {item.kicker}
                                        </span>
                                        <span className="mt-1.5 block [font-family:var(--landing-heading-font)] text-4xl leading-none tracking-[0.02em] text-[#123c78] uppercase md:mt-2 md:text-7xl">
                                            <RevealWord text={item.label} />
                                        </span>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.8fr)]">
                                <div className="rounded-[1.8rem] border border-[#123c78]/10 bg-[#f1f5fb] p-5 shadow-[0_24px_60px_rgba(18,60,120,0.06)] md:rounded-[2rem] md:p-6">
                                    <p className="text-xs font-semibold tracking-[0.28em] text-[#3b73b9] uppercase">
                                        Brand updates
                                    </p>
                                    <div className="relative mt-5 overflow-hidden rounded-[1.4rem] bg-white p-5 md:mt-6 md:rounded-[1.6rem] md:p-6">
                                        <motion.div
                                            animate={{
                                                y: `${-activeNewsIndex * 100}%`,
                                            }}
                                            className="space-y-6"
                                            transition={{
                                                duration: 0.45,
                                                ease: 'easeInOut',
                                            }}
                                        >
                                            {newsItems.map((item) => (
                                                <article
                                                    className="min-h-[160px] md:min-h-[180px]"
                                                    key={item.title}
                                                >
                                                    <p className="inline-flex rounded-full border border-[#ffd21f]/70 bg-[#fff7da] px-3 py-1 text-[0.68rem] font-semibold tracking-[0.18em] text-[#8a6500] uppercase">
                                                        {item.tag}
                                                    </p>
                                                    <h3 className="mt-4 [font-family:var(--landing-heading-font)] text-3xl leading-none tracking-[0.03em] text-[#123c78] uppercase md:mt-5 md:text-4xl">
                                                        {item.title}
                                                    </h3>
                                                    <p className="mt-3 text-sm leading-6 text-[#123c78]/66 md:mt-4 md:leading-7">
                                                        Djaitin is shaped for
                                                        customers who want
                                                        cleaner results, clearer
                                                        service, and a
                                                        production partner that
                                                        can scale with them.
                                                    </p>
                                                </article>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="rounded-[1.8rem] border border-[#123c78]/10 bg-white p-5 shadow-[0_24px_60px_rgba(18,60,120,0.06)] md:rounded-[2rem] md:p-6">
                                    <p className="text-xs font-semibold tracking-[0.28em] text-[#3b73b9] uppercase">
                                        Shortcuts
                                    </p>
                                    <div className="mt-5 space-y-3 md:mt-6">
                                        {navItems.slice(1, 4).map((item) => (
                                            <button
                                                className="flex w-full items-center justify-between rounded-2xl border border-[#123c78]/10 bg-[#f7f9fc] px-4 py-3.5 text-left text-[#123c78] transition hover:bg-white md:py-4"
                                                key={item.id}
                                                onClick={() => {
                                                    onNavigate(item.id);
                                                    onOpenChange(false);
                                                }}
                                                type="button"
                                            >
                                                <span>
                                                    <span className="block text-xs font-semibold tracking-[0.26em] text-[#3b73b9] uppercase">
                                                        {item.kicker}
                                                    </span>
                                                    <span className="mt-2 block text-lg font-semibold">
                                                        {item.label}
                                                    </span>
                                                </span>
                                                <ArrowUpRight className="size-4" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
