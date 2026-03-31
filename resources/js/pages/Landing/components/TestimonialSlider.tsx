import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { LandingPersonaQuote } from '../types';

type TestimonialSliderProps = {
    quotes: LandingPersonaQuote[];
};

export function TestimonialSlider({ quotes }: TestimonialSliderProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % quotes.length);
        }, 4800);

        return () => {
            window.clearInterval(timer);
        };
    }, [quotes.length]);

    const activeQuote = quotes[activeIndex];

    return (
        <div className="rounded-[2.2rem] border border-white/10 bg-[#161329] p-8 text-white shadow-[0_55px_140px_rgba(9,8,24,0.55)] md:p-10">
            <div className="flex flex-wrap items-center gap-3">
                {quotes.map((quote, index) => (
                    <button
                        className={`rounded-full px-4 py-2 text-sm transition ${
                            index === activeIndex
                                ? 'bg-white text-[#161329]'
                                : 'bg-white/8 text-white/70 hover:bg-white/12 hover:text-white'
                        }`}
                        key={quote.role}
                        onClick={() => setActiveIndex(index)}
                        type="button"
                    >
                        {quote.role}
                    </button>
                ))}
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="min-h-56">
                    <AnimatePresence mode="wait">
                        <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            initial={{ opacity: 0, y: 20 }}
                            key={activeQuote.role}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        >
                            <Badge className="rounded-full bg-[var(--landing-accent)]/20 px-3 py-1 text-[var(--landing-accent)]">
                                {activeQuote.label}
                            </Badge>
                            <p className="mt-6 text-2xl leading-[1.5] font-medium text-white/95 md:text-4xl">
                                “{activeQuote.quote}”
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6">
                    <p className="text-xs font-semibold tracking-[0.24em] text-white/55 uppercase">
                        Fokus utama
                    </p>
                    <p className="mt-4 [font-family:var(--landing-heading-font)] text-xl font-semibold">
                        {activeQuote.focus}
                    </p>
                    <div className="mt-8 space-y-3">
                        {quotes.map((quote, index) => (
                            <div
                                className="rounded-full bg-white/8 p-1"
                                key={`${quote.role}-progress`}
                            >
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        index === activeIndex
                                            ? 'w-full bg-[var(--landing-accent)]'
                                            : 'w-0 bg-transparent'
                                    }`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
