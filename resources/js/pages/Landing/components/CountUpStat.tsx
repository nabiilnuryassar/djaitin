import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type CountUpStatProps = {
    description: string;
    label: string;
    suffix?: string;
    value: number;
};

export function CountUpStat({
    description,
    label,
    suffix = '',
    value,
}: CountUpStatProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isInView = useInView(containerRef, {
        once: true,
        margin: '-10% 0px',
    });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!isInView) {
            return;
        }

        let frameId = 0;
        const startedAt = performance.now();
        const duration = 1100;

        const tick = (now: number) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(value * eased));

            if (progress < 1) {
                frameId = window.requestAnimationFrame(tick);
            }
        };

        frameId = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [isInView, value]);

    return (
        <div
            ref={containerRef}
            className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl"
        >
            <p className="text-xs font-semibold tracking-[0.28em] text-[var(--landing-primary)] uppercase">
                {label}
            </p>
            <p className="mt-4 [font-family:var(--landing-heading-font)] text-4xl font-bold text-white md:text-5xl">
                {displayValue}
                {suffix}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/68">
                {description}
            </p>
        </div>
    );
}
