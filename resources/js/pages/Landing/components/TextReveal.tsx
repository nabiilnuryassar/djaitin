import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

type TextRevealProps = {
    className?: string;
    text: string;
};

function RevealWord({
    index,
    progress,
    totalWords,
    word,
}: {
    index: number;
    progress: ReturnType<typeof useScroll>['scrollYProgress'];
    totalWords: number;
    word: string;
}) {
    const start = index / totalWords;
    const end = start + 0.28;
    const opacity = useTransform(
        progress,
        [start, Math.min(end, 1)],
        [0.18, 1],
    );
    const translateY = useTransform(
        progress,
        [start, Math.min(end, 1)],
        [18, 0],
    );

    return (
        <motion.span
            className="mr-[0.3em] inline-block will-change-transform"
            style={{ opacity, y: translateY }}
        >
            {word}
        </motion.span>
    );
}

export function TextReveal({ className, text }: TextRevealProps) {
    const containerRef = useRef<HTMLParagraphElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start 0.85', 'end 0.25'],
    });

    const words = text.split(' ');

    return (
        <p
            ref={containerRef}
            className={cn(
                'text-2xl leading-[1.45] font-medium text-balance text-[#1A1830] md:text-4xl md:leading-[1.35]',
                className,
            )}
        >
            {words.map((word, index) => {
                return (
                    <RevealWord
                        index={index}
                        key={`${word}-${index}`}
                        progress={scrollYProgress}
                        totalWords={words.length}
                        word={word}
                    />
                );
            })}
        </p>
    );
}
