import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { LandingHeroCue } from '../types';
import { Logo } from '@/components/Logo';
import { MagneticButton } from './MagneticButton';

type SequenceScrollProps = {
    cues: LandingHeroCue[];
    frameSources: string[];
    onPrimaryAction: () => void;
    onSecondaryAction: () => void;
};

function getFrameNumber(path: string): number {
    const match = path.match(/(\d+)\.jpg$/);

    return match ? Number(match[1]) : 0;
}

export function SequenceScroll({
    cues,
    frameSources,
    onPrimaryAction,
    onSecondaryAction,
}: SequenceScrollProps) {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
    const latestFrameRef = useRef(0);
    const [activeCueIndex, setActiveCueIndex] = useState(0);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });
    const heroCanvasParallax = useTransform(
        scrollYProgress,
        [0.82, 1],
        [0, -96],
    );
    const heroCanvasScale = useTransform(scrollYProgress, [0.82, 1], [1, 1.06]);
    const heroCopyParallax = useTransform(scrollYProgress, [0.82, 1], [0, 72]);

    function drawFrame(frameIndex: number) {
        const canvas = canvasRef.current;
        const image = imagesRef.current[frameIndex];

        if (!canvas || !image) {
            return;
        }

        const context = canvas.getContext('2d');

        if (!context) {
            return;
        }

        const devicePixelRatio = window.devicePixelRatio || 1;
        const viewportWidth = canvas.clientWidth;
        const viewportHeight = canvas.clientHeight;

        canvas.width = Math.max(
            1,
            Math.floor(viewportWidth * devicePixelRatio),
        );
        canvas.height = Math.max(
            1,
            Math.floor(viewportHeight * devicePixelRatio),
        );

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(devicePixelRatio, devicePixelRatio);
        context.clearRect(0, 0, viewportWidth, viewportHeight);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        const sourceHeight = image.height * 0.93;
        const imageRatio = image.width / sourceHeight;
        const viewportRatio = viewportWidth / viewportHeight;

        let drawWidth = viewportWidth;
        let drawHeight = viewportHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imageRatio > viewportRatio) {
            drawHeight = viewportHeight;
            drawWidth = drawHeight * imageRatio;
            offsetX = (viewportWidth - drawWidth) / 2;
        } else {
            drawWidth = viewportWidth;
            drawHeight = drawWidth / imageRatio;
            offsetY = (viewportHeight - drawHeight) / 2;
        }

        context.drawImage(
            image,
            0,
            0,
            image.width,
            sourceHeight,
            offsetX,
            offsetY,
            drawWidth,
            drawHeight,
        );
        latestFrameRef.current = frameIndex;
    }

    useEffect(() => {
        let isCancelled = false;
        let loadedCount = 0;

        imagesRef.current = Array.from(
            { length: frameSources.length },
            () => null,
        );

        frameSources.forEach((source, index) => {
            const image = new Image();
            let hasSettled = false;

            const settle = () => {
                if (hasSettled || isCancelled) {
                    return;
                }

                hasSettled = true;
                imagesRef.current[index] = image;
                loadedCount += 1;

                setLoadingProgress(
                    Math.round((loadedCount / frameSources.length) * 100),
                );

                if (index === 0) {
                    window.requestAnimationFrame(() => {
                        drawFrame(0);
                    });
                }

                if (loadedCount === frameSources.length) {
                    setIsReady(true);
                    window.requestAnimationFrame(() => {
                        drawFrame(latestFrameRef.current);
                    });
                }
            };

            image.onload = settle;
            image.onerror = settle;
            image.src = source;

            if (image.complete) {
                settle();
            }
        });

        return () => {
            isCancelled = true;
        };
    }, [frameSources]);

    useEffect(() => {
        const handleResize = () => {
            drawFrame(latestFrameRef.current);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        const nextFrame = Math.min(
            frameSources.length - 1,
            Math.max(0, Math.round(progress * (frameSources.length - 1))),
        );

        drawFrame(nextFrame);

        const cueIndex = cues.findIndex(
            (cue) => progress >= cue.start && progress <= cue.end,
        );

        if (cueIndex >= 0) {
            setActiveCueIndex(cueIndex);
        }
    });

    const activeCue = cues[activeCueIndex];
    const copyPositionClass =
        activeCue.align === 'center'
            ? 'mx-auto text-center'
            : activeCue.align === 'left'
              ? 'mr-auto text-left'
              : 'ml-auto text-right';
    const copyJustifyClass =
        activeCue.align === 'center'
            ? 'justify-center'
            : activeCue.align === 'left'
              ? 'justify-start'
              : 'justify-end';
    const orderedFrames = [...frameSources].sort(
        (left, right) => getFrameNumber(left) - getFrameNumber(right),
    );

    return (
        <section
            className="relative h-[420vh] bg-[var(--landing-sidebar)]"
            id="hero"
            ref={sectionRef}
        >
            <div className="sticky top-0 h-screen overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    style={{ scale: heroCanvasScale, y: heroCanvasParallax }}
                >
                    <canvas
                        className="absolute inset-0 h-full w-full bg-[var(--landing-sidebar)]"
                        ref={canvasRef}
                    />
                </motion.div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,210,31,0.18),transparent_25%),linear-gradient(180deg,rgba(247,247,245,0.12)_0%,rgba(247,247,245,0)_24%,rgba(247,247,245,0.28)_100%)]" />
                <motion.div
                    className="relative z-10 flex h-full items-center px-6 pt-28 pb-20 md:px-10"
                    style={{ y: heroCopyParallax }}
                >
                    <div className="mx-auto w-full max-w-6xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                className={`max-w-lg rounded-[1.8rem] border border-[#123c78]/10 bg-white/72 p-5 text-[#123c78] shadow-[0_18px_60px_rgba(18,60,120,0.08)] backdrop-blur-[6px] md:p-7 ${copyPositionClass}`}
                                exit={{
                                    opacity: 0,
                                    x:
                                        activeCue.align === 'center'
                                            ? 0
                                            : activeCue.align === 'left'
                                              ? -28
                                              : 28,
                                }}
                                initial={{
                                    opacity: 0,
                                    x:
                                        activeCue.align === 'center'
                                            ? 0
                                            : activeCue.align === 'left'
                                              ? 28
                                              : -28,
                                }}
                                key={activeCue.title}
                                transition={{ duration: 0.32, ease: 'easeOut' }}
                            >
                                <p className="text-xs font-semibold tracking-[0.28em] text-[#3b73b9] uppercase">
                                    {activeCue.eyebrow}
                                </p>
                                <h1 className="mt-4 [font-family:var(--landing-heading-font)] text-3xl leading-[0.98] font-bold tracking-[0.02em] text-[#123c78] uppercase md:text-5xl">
                                    {activeCue.title}
                                </h1>
                                <p className="mt-4 text-[1rem] leading-7 text-[#123c78]/74">
                                    {activeCue.description}
                                </p>
                                <div
                                    className={`mt-5 flex flex-wrap gap-2 ${copyJustifyClass}`}
                                >
                                    {activeCue.badges.map((badge) => (
                                        <Badge
                                            className="rounded-full border border-[#123c78]/10 bg-[#f7f7f7] px-3 py-1 text-[#123c78]/72"
                                            key={badge}
                                            variant="secondary"
                                        >
                                            {badge}
                                        </Badge>
                                    ))}
                                </div>
                                {activeCueIndex === cues.length - 1 ? (
                                    <div
                                        className={`mt-6 flex flex-wrap gap-3 ${copyJustifyClass}`}
                                    >
                                        <MagneticButton
                                            onClick={onPrimaryAction}
                                        >
                                            Explore Services
                                        </MagneticButton>
                                        <MagneticButton
                                            className="border-[#123c78]/10 bg-white/88 text-[#123c78] hover:bg-white"
                                            onClick={onSecondaryAction}
                                            variant="secondary"
                                        >
                                            About Djaitin
                                        </MagneticButton>
                                    </div>
                                ) : null}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
                <div className="absolute inset-x-0 bottom-8 z-10 px-6 md:px-10">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="rounded-full border border-[#123c78]/10 bg-white/82 px-4 py-2 text-[#123c78]/74">
                                {orderedFrames.length} frame sequence
                            </Badge>
                            <Badge className="rounded-full border border-[#123c78]/10 bg-white/82 px-4 py-2 text-[#123c78]/74">
                                Tailor · RTW · Convection
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[#123c78]">
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                className="flex size-11 items-center justify-center rounded-full border border-[#123c78]/12 bg-white/72"
                                transition={{
                                    duration: 1.5,
                                    ease: 'easeInOut',
                                    repeat: Infinity,
                                }}
                            >
                                <div className="h-2.5 w-2.5 rounded-full bg-[#123c78]" />
                            </motion.div>
                            <div>
                                <p className="text-xs font-semibold tracking-[0.26em] text-[#3b73b9] uppercase">
                                    Scroll to animate
                                </p>
                                <p className="mt-1 text-sm text-[#123c78]/66">
                                    Let the mark open the brand story.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {!isReady ? (
                        <motion.div
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-30 flex items-center justify-center bg-[linear-gradient(180deg,#f7f7f5_0%,#f2f5f8_100%)]"
                            exit={{
                                clipPath: 'inset(0 0 100% 0 round 0rem)',
                                opacity: 0,
                                transition: { duration: 0.55 },
                            }}
                            initial={{
                                clipPath: 'inset(0 0 0 0 round 0rem)',
                                opacity: 1,
                            }}
                        >
                            <div className="w-full max-w-md px-6 text-center">
                                <div className="mb-8 flex justify-center">
                                    <Logo className="size-20" />
                                </div>
                                <p className="text-xs font-semibold tracking-[0.32em] text-[#3b73b9] uppercase">
                                    Loading sequence
                                </p>
                                <h2 className="mt-4 [font-family:var(--landing-heading-font)] text-5xl font-bold tracking-[0.03em] text-[#123c78] uppercase">
                                    Preparing the brand motion
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-[#123c78]/66">
                                    Preloading {orderedFrames.length} frames so
                                    the hero sequence stays bright, fluid, and
                                    seamless.
                                </p>
                                <div className="mt-8 overflow-hidden rounded-full bg-white p-1 shadow-[0_18px_40px_rgba(18,60,120,0.10)]">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-[#3b73b9] via-[#5f8eca] to-[#ffd21f] transition-[width] duration-300"
                                        style={{ width: `${loadingProgress}%` }}
                                    />
                                </div>
                                <p className="mt-5 text-3xl font-semibold text-[#123c78]">
                                    {loadingProgress}%
                                </p>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </section>
    );
}
