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
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.15),transparent_22%),linear-gradient(180deg,rgba(2,1,6,0.28),rgba(2,1,6,0.58)_48%,rgba(2,1,6,0.88)_100%)]" />
                </motion.div>
                <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[var(--landing-shell)] via-[var(--landing-sidebar)]/90 to-transparent" />
                <motion.div
                    className="relative z-10 flex h-full items-center px-6 pt-28 pb-20 md:px-10"
                    style={{ y: heroCopyParallax }}
                >
                    <div className="mx-auto w-full max-w-7xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                className={`max-w-2xl rounded-[2rem] border border-white/12 bg-black/32 p-7 shadow-[0_35px_100px_rgba(0,0,0,0.38)] backdrop-blur-md md:p-10 ${
                                    activeCue.align === 'center'
                                        ? 'mx-auto text-center'
                                        : activeCue.align === 'right'
                                          ? 'ml-auto text-right'
                                          : 'text-left'
                                }`}
                                exit={{
                                    opacity: 0,
                                    x: activeCue.align === 'right' ? 24 : -24,
                                    y: -12,
                                }}
                                initial={{
                                    opacity: 0,
                                    x: activeCue.align === 'right' ? 24 : -24,
                                    y: 18,
                                }}
                                key={activeCue.title}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            >
                                <p className="text-xs font-semibold tracking-[0.28em] text-[var(--landing-accent)]/92 uppercase">
                                    {activeCue.eyebrow}
                                </p>
                                <h1 className="mt-5 [font-family:var(--landing-heading-font)] text-4xl leading-tight font-bold text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.5)] md:text-6xl md:leading-[1.04]">
                                    {activeCue.title}
                                </h1>
                                <p className="mt-5 text-base leading-7 text-white/84 md:text-lg">
                                    {activeCue.description}
                                </p>
                                <div
                                    className={`mt-6 flex flex-wrap gap-2 ${
                                        activeCue.align === 'center'
                                            ? 'justify-center'
                                            : activeCue.align === 'right'
                                              ? 'justify-end'
                                              : 'justify-start'
                                    }`}
                                >
                                    {activeCue.badges.map((badge) => (
                                        <Badge
                                            className="rounded-full border border-white/18 bg-black/40 px-3 py-1 text-white"
                                            key={badge}
                                            variant="secondary"
                                        >
                                            {badge}
                                        </Badge>
                                    ))}
                                </div>
                                {activeCueIndex === cues.length - 1 ? (
                                    <div
                                        className={`mt-8 flex flex-wrap gap-3 ${
                                            activeCue.align === 'center'
                                                ? 'justify-center'
                                                : activeCue.align === 'right'
                                                  ? 'justify-end'
                                                  : 'justify-start'
                                        }`}
                                    >
                                        <MagneticButton
                                            onClick={onPrimaryAction}
                                        >
                                            Jadwalkan Demo
                                        </MagneticButton>
                                        <MagneticButton
                                            className="border-white/18 bg-white/14 text-white hover:bg-white/20"
                                            onClick={onSecondaryAction}
                                            variant="secondary"
                                        >
                                            Lihat Modul
                                        </MagneticButton>
                                    </div>
                                ) : null}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
                <div className="absolute inset-x-0 bottom-8 z-10 px-6 md:px-10">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
                        <Badge className="rounded-full border border-white/14 bg-black/38 px-4 py-2 text-white">
                            240 frame sequence
                        </Badge>
                        <Badge className="rounded-full border border-white/40 bg-[#1A1830]/78 px-4 py-2 text-white">
                            Tailor · RTW · Konveksi
                        </Badge>
                        <Badge className="rounded-full border border-white/14 bg-black/38 px-4 py-2 text-white">
                            1920×1080 cinematic surfaces
                        </Badge>
                    </div>
                </div>
                <AnimatePresence>
                    {!isReady ? (
                        <motion.div
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-30 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(139,132,255,0.18),transparent_28%),linear-gradient(180deg,#09070F_0%,#0D0A17_100%)]"
                            exit={{
                                opacity: 0,
                                transition: { duration: 0.45 },
                            }}
                            initial={{ opacity: 1 }}
                        >
                            <div className="w-full max-w-md px-6 text-center">
                                <div className="mb-8 flex justify-center">
                                    <Logo />
                                </div>
                                <h2 className="mt-4 [font-family:var(--landing-heading-font)] text-4xl font-bold text-white">
                                    Menyiapkan alur operasional
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-white/68">
                                    Preload {orderedFrames.length} frame supaya
                                    hero scroll tetap halus dan tanpa loncatan.
                                </p>
                                <div className="mt-8 overflow-hidden rounded-full bg-white/10 p-1 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-[var(--landing-primary)] via-[#8C84FF] to-[var(--landing-accent)] transition-[width] duration-300"
                                        style={{ width: `${loadingProgress}%` }}
                                    />
                                </div>
                                <p className="mt-5 text-3xl font-semibold text-white">
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
