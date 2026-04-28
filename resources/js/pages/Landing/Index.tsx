import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    ChevronRight,
    ClipboardCheck,
    Layers3,
    PackageCheck,
    PenTool,
    Ruler,
    Scissors,
    ShieldCheck,
    Shirt,
    Sparkles,
    SwatchBook,
    Users2,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
    type CSSProperties,
    type MouseEvent as ReactMouseEvent,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import LandingLayout from '@/layouts/landing-layout';
import customer from '@/routes/customer';
import { login } from '@/routes';
import readyToWearImage from '../../../images/card-image/ready-to-wear.jpg';
import fittingImage from '../../../images/card-image/fitting.jpg';
import convectionImage from '../../../images/card-image/konveksi-1.jpg';
import convectionDetailImage from '../../../images/card-image/konveksi-2.jpg';
import batchImage from '../../../images/card-image/konveksi-3.jpg';
import { CountUpStat } from './components/CountUpStat';
import { FloatingNavbar } from './components/FloatingNavbar';
import { LenisProvider } from './components/LenisProvider';
import { SequenceScroll } from './components/SequenceScroll';
import { TextReveal } from './components/TextReveal';
import type { LandingHeroCue, LandingNavItem } from './types';

type LandingPageProps = {
    brand: {
        name: string;
        services: string[];
        tagline: string;
    };
};

const frameSources = Object.entries(
    import.meta.glob('../../../images/sequence/*.jpg', {
        eager: true,
        import: 'default',
    }),
)
    .sort(([left], [right]) =>
        left.localeCompare(right, undefined, { numeric: true }),
    )
    .map(([, source]) => source as string);

const navItems: LandingNavItem[] = [
    { id: 'hero', label: 'Intro', kicker: '00' },
    { id: 'about', label: 'About', kicker: '01' },
    { id: 'services', label: 'Services', kicker: '02' },
    { id: 'trust', label: 'Trust', kicker: '03' },
    { id: 'division', label: 'Division', kicker: '04' },
    { id: 'awards', label: 'Proof', kicker: '05' },
];

const heroCues: LandingHeroCue[] = [
    {
        align: 'center',
        badges: ['Bright Editorial Hero', 'Tailor to Production'],
        description:
            'Djaitin is a modern convection and tailoring brand that brings personal tailoring, ready pieces, and scaled production into one clear service flow.',
        end: 0.18,
        eyebrow: 'What is Djaitin?',
        start: 0,
        title: 'A trusted convection brand for refined garments and reliable production.',
    },
    {
        align: 'left',
        badges: ['Consultative', 'Measured', 'Personal'],
        description:
            'Tailor Custom starts from fit, silhouette, and fabric direction, then turns it into a garment that feels intentional on the body.',
        end: 0.44,
        eyebrow: '30% · Tailor Custom',
        start: 0.19,
        title: 'Custom tailoring shaped with precision, not guesswork.',
    },
    {
        align: 'right',
        badges: ['Curated Drop', 'Fast Selection', 'Polished'],
        description:
            'Ready-to-Wear gives customers a faster route to Djaitin quality through curated essentials designed to stay clean, wearable, and brand-forward.',
        end: 0.72,
        eyebrow: '60% · Ready-to-Wear',
        start: 0.45,
        title: 'Ready pieces for those who need clarity and speed.',
    },
    {
        align: 'left',
        badges: ['Flexible Volume', 'Structured Delivery', 'Business Ready'],
        description:
            'Bulk Convection covers uniforms, event apparel, merchandise, and corporate orders with production discipline and clear communication.',
        end: 0.9,
        eyebrow: '85% · Bulk Convection',
        start: 0.73,
        title: 'Production capacity that stays dependable from sample to batch.',
    },
    {
        align: 'right',
        badges: ['Trusted Partner', 'Indonesia Ready', 'Brand Led'],
        description:
            'Djaitin is where craftsmanship, readiness, and production capability meet, for both personal orders and operational scale.',
        end: 1,
        eyebrow: 'Final State',
        start: 0.91,
        title: 'Djaitin is your trusted partner for tailoring, ready wear, and convection.',
    },
];

const services = [
    {
        accent: 'bg-[#f0f6ff]',
        description:
            'For customers who need garments built around exact measurements, styling intent, and finishing discipline.',
        highlights: [
            'Measured fitting flow',
            'Fabric and silhouette direction',
            'Personal consultation',
        ],
        icon: Scissors,
        title: 'Tailor Custom',
    },
    {
        accent: 'bg-[#fff8d8]',
        description:
            'For customers who want faster access to Djaitin quality through refined ready-to-wear selections.',
        highlights: [
            'Curated capsule pieces',
            'Immediate choice process',
            'Clean retail presentation',
        ],
        icon: Shirt,
        title: 'Ready-to-Wear',
    },
    {
        accent: 'bg-[#edf4ef]',
        description:
            'For brands, schools, offices, communities, and events that need scalable garment production with clarity.',
        highlights: [
            'Sampling to batch workflow',
            'Capacity planning',
            'Business order handling',
        ],
        icon: Building2,
        title: 'Bulk Convection',
    },
];

const trustPoints = [
    {
        description:
            'Each order is grounded in fit logic, finishing care, and material sensitivity.',
        icon: PenTool,
        title: 'Craftsmanship that feels considered',
    },
    {
        description:
            'Djaitin handles one-off personal pieces and larger structured production with the same clarity.',
        icon: Layers3,
        title: 'Flexible for personal and business needs',
    },
    {
        description:
            'Service paths stay direct, so customers understand scope, progress, and output from the start.',
        icon: ClipboardCheck,
        title: 'Clear process, cleaner decisions',
    },
    {
        description:
            'Production thinking supports uniforms, communities, campaigns, and recurring operational demand.',
        icon: PackageCheck,
        title: 'Capability that scales with demand',
    },
];

const partnerItems = [
    'Uniform Programs',
    'Community Apparel',
    'Corporate Orders',
    'Ready Capsule',
    'Custom Tailoring',
    'Event Production',
];

const divisions = [
    {
        copy: 'Personal garments shaped around fit, fabric, and presence.',
        icon: Ruler,
        image: fittingImage,
        title: 'Personal Tailoring',
    },
    {
        copy: 'Uniform systems for teams that need consistency and durability.',
        icon: ShieldCheck,
        image: convectionImage,
        title: 'Uniforms',
    },
    {
        copy: 'Event apparel with production control from sample through delivery.',
        icon: Sparkles,
        image: batchImage,
        title: 'Event Apparel',
    },
    {
        copy: 'Community merchandise that feels more refined than standard merch output.',
        icon: Users2,
        image: readyToWearImage,
        title: 'Community Merchandise',
    },
    {
        copy: 'Corporate and bulk orders with clearer communication and dependable batching.',
        icon: BadgeCheck,
        image: convectionDetailImage,
        title: 'Corporate / Bulk Orders',
    },
];

const stats = [
    {
        description: 'From personal tailoring to coordinated batch programs.',
        label: 'Orders handled',
        suffix: '+',
        value: 420,
    },
    {
        description:
            'A workable structure for sampling, revisions, and production runs.',
        label: 'Pieces per batch',
        suffix: '+',
        value: 1800,
    },
    {
        description: 'Service designed for both individuals and organizations.',
        label: 'Client segments',
        value: 3,
    },
    {
        description:
            'Tailor, RTW, and convection connected in one modern brand.',
        label: 'Core service lines',
        value: 3,
    },
];

const achievements = [
    {
        eyebrow: 'Production',
        summary:
            'Structured production flow for uniforms, events, and merchandise without losing finish quality.',
        title: 'Built for batch execution',
    },
    {
        eyebrow: 'Trust Signal',
        summary:
            'Clear service mapping gives customers a better sense of timeline, fit route, and delivery expectation.',
        title: 'Service clarity customers can follow',
    },
    {
        eyebrow: 'Craft',
        summary:
            'Tailoring logic stays visible in the way garments are fitted, refined, and presented.',
        title: 'Craftsmanship remains visible',
    },
    {
        eyebrow: 'Capability',
        summary:
            'Djaitin serves individual wardrobes and business procurement through the same premium lens.',
        title: 'Personal and business ready',
    },
];

const aboutImages = [
    { alt: 'Tailoring fitting session', src: fittingImage },
    { alt: 'Ready to wear garment detail', src: readyToWearImage },
    { alt: 'Convection production detail', src: convectionDetailImage },
];

export default function LandingIndex({ brand }: LandingPageProps) {
    const [activeAchievement, setActiveAchievement] = useState(0);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setActiveAchievement(
                (current) => (current + 1) % achievements.length,
            );
        }, 3200);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    const scrollToSection = (sectionId: string) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <LandingLayout>
            <Head title={brand.name} />

            <LenisProvider>
                <div className="bg-[var(--landing-shell)] text-[var(--landing-navy)]">
                    <FloatingNavbar
                        actionHref={login()}
                        actionLabel="Masuk"
                        navItems={navItems}
                        onNavigate={scrollToSection}
                    />

                    <SequenceScroll
                        cues={heroCues}
                        frameSources={frameSources}
                        onPrimaryAction={() => scrollToSection('services')}
                        onSecondaryAction={() => scrollToSection('about')}
                    />

                    <main className="relative z-20 -mt-24 pb-0">
                        <div className="w-full">
                            <div className="overflow-hidden rounded-t-[2.5rem] bg-[linear-gradient(180deg,rgba(247,247,245,0.82)_0%,#f7f7f5_22%,#f2f5f8_100%)] shadow-[0_-30px_120px_rgba(18,60,120,0.08)]">
                                <section
                                    className="px-6 pt-16 md:px-10 md:pt-20 lg:px-14"
                                    id="about"
                                >
                                    <div className="mx-auto max-w-6xl">
                                        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                                            <div className="space-y-6">
                                                <p className="text-xs font-semibold tracking-[0.3em] text-[#3b73b9] uppercase">
                                                    About Djaitin
                                                </p>
                                                <h2 className="[font-family:var(--landing-heading-font)] text-5xl leading-[0.94] tracking-[0.01em] text-[#123c78] uppercase md:text-7xl">
                                                    What is Djaitin?
                                                </h2>
                                            </div>
                                            <TextReveal
                                                className="max-w-3xl text-[#123c78] md:text-[2.15rem]"
                                                text={brand.tagline}
                                            />
                                        </div>

                                        <div className="mt-14 grid gap-6 lg:grid-cols-[0.76fr_0.24fr]">
                                            <div className="space-y-6">
                                                <EditorialImage
                                                    alt={aboutImages[0].alt}
                                                    src={aboutImages[0].src}
                                                />
                                                <div className="grid gap-6 md:grid-cols-2">
                                                    <article className="rounded-[2rem] border border-[#123c78]/10 bg-white/76 p-6 shadow-[0_22px_80px_rgba(18,60,120,0.08)] md:p-7">
                                                        <p className="text-xs font-semibold tracking-[0.28em] text-[#3b73b9] uppercase">
                                                            Tailor minded
                                                        </p>
                                                        <p className="mt-4 text-[1.02rem] leading-8 text-[#123c78]/76">
                                                            It starts from
                                                            measurement, style
                                                            intent, and
                                                            finishing, so the
                                                            garment feels
                                                            resolved before it
                                                            reaches the final
                                                            handoff.
                                                        </p>
                                                    </article>
                                                    <EditorialImage
                                                        alt={aboutImages[1].alt}
                                                        className="h-full min-h-64"
                                                        src={aboutImages[1].src}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <article className="rounded-[2rem] border border-[#123c78]/10 bg-[#123c78] p-6 text-white shadow-[0_28px_90px_rgba(18,60,120,0.18)] md:p-7">
                                                    <p className="text-xs font-semibold tracking-[0.28em] text-[#ffd21f] uppercase">
                                                        Brand statement
                                                    </p>
                                                    <p className="mt-6 [font-family:var(--landing-heading-font)] text-3xl leading-none tracking-[0.03em] uppercase md:text-4xl">
                                                        Tailor custom,
                                                        ready-to-wear, and
                                                        production that stays
                                                        trusted.
                                                    </p>
                                                </article>
                                                <EditorialImage
                                                    alt={aboutImages[2].alt}
                                                    className="min-h-[20rem] md:min-h-[22rem]"
                                                    src={aboutImages[2].src}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section
                                    className="px-6 pt-20 md:px-10 lg:px-14"
                                    id="services"
                                >
                                    <div className="mx-auto max-w-6xl">
                                        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                            <div>
                                                <p className="text-xs font-semibold tracking-[0.3em] text-[#3b73b9] uppercase">
                                                    Services
                                                </p>
                                                <h2 className="[font-family:var(--landing-heading-font)] text-4xl leading-none tracking-[0.02em] uppercase md:text-6xl">
                                                    Three service lanes, one
                                                    refined brand.
                                                </h2>
                                            </div>
                                            <p className="max-w-2xl text-base leading-8 text-[#123c78]/70">
                                                Djaitin keeps the offer simple:
                                                personal tailoring for fit,
                                                ready pieces for speed, and bulk
                                                convection for operational
                                                scale.
                                            </p>
                                        </div>

                                        <div className="mt-10 grid gap-5 xl:grid-cols-3">
                                            {services.map((service, index) => (
                                                <ServiceCard
                                                    featured={index === 2}
                                                    key={service.title}
                                                    service={service}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section
                                    className="px-6 pt-20 md:px-10 lg:px-14"
                                    id="trust"
                                >
                                    <div className="mx-auto max-w-6xl">
                                        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
                                            <div className="space-y-6">
                                                <p className="text-xs font-semibold tracking-[0.3em] text-[#3b73b9] uppercase">
                                                    Why Djaitin
                                                </p>
                                                <h2 className="[font-family:var(--landing-heading-font)] text-4xl leading-[0.96] tracking-[0.02em] uppercase md:text-6xl">
                                                    A trusted choice for
                                                    personal orders and business
                                                    runs.
                                                </h2>
                                                <p className="max-w-lg text-[1.02rem] leading-8 text-[#123c78]/72">
                                                    Customers come to Djaitin
                                                    when they need garments
                                                    handled with more control,
                                                    clearer communication, and
                                                    production capability that
                                                    stays accountable.
                                                </p>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {trustPoints.map((point) => (
                                                    <article
                                                        className="rounded-[1.8rem] border border-[#123c78]/10 bg-white/78 p-5 shadow-[0_20px_70px_rgba(18,60,120,0.07)] md:p-6"
                                                        key={point.title}
                                                    >
                                                        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef4fb] text-[#123c78]">
                                                            <point.icon className="size-5" />
                                                        </div>
                                                        <h3 className="mt-5 text-[1.15rem] font-semibold text-[#123c78] md:text-xl">
                                                            {point.title}
                                                        </h3>
                                                        <p className="mt-3 text-[0.98rem] leading-7 text-[#123c78]/68">
                                                            {point.description}
                                                        </p>
                                                    </article>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="pt-20">
                                    <PartnerMarquee items={partnerItems} />
                                </section>

                                <section
                                    className="px-6 pt-20 md:px-10 lg:px-14"
                                    id="division"
                                >
                                    <div className="mx-auto max-w-6xl">
                                        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                            <div>
                                                <p className="text-xs font-semibold tracking-[0.3em] text-[#3b73b9] uppercase">
                                                    Division / Category
                                                </p>
                                                <h2 className="[font-family:var(--landing-heading-font)] text-4xl leading-none tracking-[0.02em] uppercase md:text-6xl">
                                                    Built for different garment
                                                    needs.
                                                </h2>
                                            </div>
                                            <p className="max-w-2xl text-base leading-8 text-[#123c78]/70">
                                                The service grid is designed to
                                                feel complete, from private
                                                tailoring to recurring corporate
                                                procurement.
                                            </p>
                                        </div>

                                        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                            {divisions.map((division) => (
                                                <PointerGlowCard
                                                    division={division}
                                                    key={division.title}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section className="px-6 pt-20 md:px-10 lg:px-14">
                                    <div className="mx-auto max-w-6xl">
                                        <div className="rounded-[2.5rem] border border-[#123c78]/10 bg-[#123c78] px-6 py-8 text-white shadow-[0_35px_120px_rgba(18,60,120,0.22)] md:px-8 lg:px-10">
                                            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold tracking-[0.3em] text-[#ffd21f] uppercase">
                                                        Stats
                                                    </p>
                                                    <h2 className="[font-family:var(--landing-heading-font)] text-5xl leading-none tracking-[0.02em] uppercase md:text-7xl">
                                                        Numbers that reinforce
                                                        trust.
                                                    </h2>
                                                </div>
                                                <p className="max-w-2xl text-sm leading-7 text-white/72 md:text-base">
                                                    This section signals
                                                    readiness without turning
                                                    the brand into a dry
                                                    dashboard.
                                                </p>
                                            </div>
                                            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                                {stats.map((stat) => (
                                                    <CountUpStat
                                                        description={
                                                            stat.description
                                                        }
                                                        key={stat.label}
                                                        label={stat.label}
                                                        suffix={stat.suffix}
                                                        value={stat.value}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section
                                    className="px-6 pt-20 pb-24 md:px-10 lg:px-14"
                                    id="awards"
                                >
                                    <div className="mx-auto max-w-6xl">
                                        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                            <div>
                                                <p className="text-xs font-semibold tracking-[0.3em] text-[#3b73b9] uppercase">
                                                    Achievements / Trust Signals
                                                </p>
                                                <h2 className="[font-family:var(--landing-heading-font)] text-4xl leading-none tracking-[0.02em] uppercase md:text-6xl">
                                                    An Awwwards-grade proof
                                                    shelf, without generic
                                                    carousel energy.
                                                </h2>
                                            </div>
                                            <div className="flex gap-2">
                                                {achievements.map(
                                                    (item, index) => (
                                                        <button
                                                            aria-label={
                                                                item.title
                                                            }
                                                            className={`h-2.5 w-10 rounded-full transition ${
                                                                index ===
                                                                activeAchievement
                                                                    ? 'bg-[#123c78]'
                                                                    : 'bg-[#123c78]/15'
                                                            }`}
                                                            key={item.title}
                                                            onClick={() =>
                                                                setActiveAchievement(
                                                                    index,
                                                                )
                                                            }
                                                            type="button"
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <AchievementShelf
                                            activeIndex={activeAchievement}
                                            items={achievements}
                                            onSelect={setActiveAchievement}
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>
                    </main>

                    <Footer />
                </div>
            </LenisProvider>
        </LandingLayout>
    );
}

function EditorialImage({
    alt,
    className = '',
    src,
}: {
    alt: string;
    className?: string;
    src: string;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start 0.9', 'end 0.2'],
    });
    const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
    const width = useTransform(scrollYProgress, [0, 1], ['92%', '100%']);

    return (
        <div
            className={`flex items-center justify-center overflow-hidden rounded-[1.8rem] border border-[#123c78]/10 bg-white/72 p-3 shadow-[0_18px_60px_rgba(18,60,120,0.08)] ${className}`}
            ref={containerRef}
        >
            <motion.div
                className="overflow-hidden rounded-[1.35rem]"
                style={{ scale, width }}
            >
                <img
                    alt={alt}
                    className="h-[18rem] w-full object-cover md:h-[20rem]"
                    src={src}
                />
            </motion.div>
        </div>
    );
}

function ServiceCard({
    featured = false,
    service,
}: {
    featured?: boolean;
    service: (typeof services)[number];
}) {
    return (
        <article
            className={`relative overflow-hidden rounded-[2rem] border border-[#123c78]/10 p-5 shadow-[0_20px_70px_rgba(18,60,120,0.08)] md:p-6 ${featured ? 'bg-[#123c78] text-white' : 'bg-white/82 text-[#123c78]'}`}
        >
            <div
                className={`absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl ${featured ? 'bg-[#ffd21f]/20' : 'bg-[#3b73b9]/10'}`}
            />
            <div
                className={`relative flex size-14 items-center justify-center rounded-2xl ${featured ? 'bg-white/12 text-[#ffd21f]' : `${service.accent} text-[#123c78]`}`}
            >
                <service.icon className="size-6" />
            </div>
            <div className="relative mt-7 flex flex-col gap-6">
                <div>
                    <h3 className="[font-family:var(--landing-heading-font)] text-3xl leading-none tracking-[0.03em] uppercase md:text-4xl">
                        {service.title}
                    </h3>
                    <p
                        className={`mt-4 max-w-xl text-[1rem] leading-7 ${featured ? 'text-white/76' : 'text-[#123c78]/72'}`}
                    >
                        {service.description}
                    </p>
                </div>
                <div className="grid gap-2.5">
                    {service.highlights.map((highlight) => (
                        <div
                            className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-[0.95rem] ${featured ? 'border-white/10 bg-white/8 text-white' : 'border-[#123c78]/10 bg-[#f7f9fc] text-[#123c78]'}`}
                            key={highlight}
                        >
                            <ChevronRight className="size-4" />
                            {highlight}
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
}

function PartnerMarquee({ items }: { items: string[] }) {
    const repeatedItems = [...items, ...items];

    return (
        <div className="overflow-hidden border-y border-[#123c78]/10 bg-white/56 py-5">
            <motion.div
                animate={{ x: ['0%', '-50%'] }}
                className="flex w-max gap-5"
                transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
            >
                {repeatedItems.map((item, index) => (
                    <div
                        className="flex items-center gap-5 px-3 text-sm font-semibold tracking-[0.2em] text-[#123c78]/64 uppercase"
                        key={`${item}-${index}`}
                    >
                        <span>{item}</span>
                        <SwatchBook className="size-4 text-[#ffd21f]" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

function PointerGlowCard({
    division,
}: {
    division: (typeof divisions)[number];
}) {
    const [pointerStyle, setPointerStyle] = useState<CSSProperties>({
        '--glow-x': '50%',
        '--glow-y': '50%',
    } as CSSProperties);

    const handlePointerMove = (event: ReactMouseEvent<HTMLDivElement>) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        setPointerStyle({
            '--glow-x': `${x}%`,
            '--glow-y': `${y}%`,
        } as CSSProperties);
    };

    return (
        <article
            className="group relative overflow-hidden rounded-[1.9rem] border border-[#123c78]/10 bg-white/82 p-3 shadow-[0_20px_70px_rgba(18,60,120,0.07)]"
            onMouseMove={handlePointerMove}
            style={pointerStyle}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--glow-x)_var(--glow-y),rgba(255,210,31,0.28),transparent_36%)] opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col gap-4">
                <div className="overflow-hidden rounded-[1.6rem]">
                    <img
                        alt={division.title}
                        className="h-[15rem] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        src={division.image}
                    />
                </div>
                <div className="flex flex-1 flex-col gap-5 p-3">
                    <div>
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef4fb] text-[#123c78]">
                            <division.icon className="size-5" />
                        </div>
                        <h3 className="mt-4 text-[1.35rem] font-semibold text-[#123c78] md:text-[1.55rem]">
                            {division.title}
                        </h3>
                        <p className="mt-3 text-[0.98rem] leading-7 text-[#123c78]/68">
                            {division.copy}
                        </p>
                    </div>
                    <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#123c78]">
                        Explore category
                        <ArrowRight className="size-4 transition duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </article>
    );
}

function AchievementShelf({
    activeIndex,
    items,
    onSelect,
}: {
    activeIndex: number;
    items: typeof achievements;
    onSelect: (index: number) => void;
}) {
    return (
        <div className="mt-10 grid gap-5 lg:grid-cols-[0.54fr_0.46fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#123c78]/10 bg-[linear-gradient(135deg,#123c78_0%,#255ca3_45%,#f7f7f5_130%)] p-6 shadow-[0_24px_90px_rgba(18,60,120,0.20)] md:p-7">
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="relative max-w-xl text-white"
                    initial={{ opacity: 0, y: 18 }}
                    key={items[activeIndex].title}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                    <p className="text-xs font-semibold tracking-[0.3em] text-[#ffd21f] uppercase">
                        {items[activeIndex].eyebrow}
                    </p>
                    <h3 className="mt-5 [font-family:var(--landing-heading-font)] text-5xl leading-[0.94] tracking-[0.02em] uppercase md:text-6xl">
                        {items[activeIndex].title}
                    </h3>
                    <p className="mt-4 max-w-lg text-[1rem] leading-8 text-white/76">
                        {items[activeIndex].summary}
                    </p>
                </motion.div>
            </div>

            <div className="grid gap-4">
                {items.map((item, index) => (
                    <button
                        className={`rounded-[1.6rem] border p-4 text-left transition md:p-5 ${
                            index === activeIndex
                                ? 'border-[#123c78] bg-white shadow-[0_22px_80px_rgba(18,60,120,0.08)]'
                                : 'border-[#123c78]/10 bg-white/68'
                        }`}
                        key={item.title}
                        onClick={() => onSelect(index)}
                        type="button"
                    >
                        <p className="text-xs font-semibold tracking-[0.26em] text-[#3b73b9] uppercase">
                            {item.eyebrow}
                        </p>
                        <h4 className="mt-3 text-[1.12rem] font-semibold text-[#123c78] md:text-xl">
                            {item.title}
                        </h4>
                        <p className="mt-2 text-[0.97rem] leading-7 text-[#123c78]/66">
                            {item.summary}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}

function Footer() {
    return (
        <footer className="relative overflow-hidden pt-10 pb-0">
            <div className="w-full overflow-hidden rounded-[2.5rem_2.5rem_0_0] bg-[#0f3365] px-6 py-12 text-white shadow-[0_40px_120px_rgba(18,60,120,0.28)] md:px-10 md:py-16">
                <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(255,210,31,0.42),transparent_58%)]" />
                <div className="relative flex flex-col gap-10">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-center gap-4">
                            <Logo className="size-14" />
                            <div>
                                <p className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">
                                    Trusted convection partner
                                </p>
                                <p className="mt-2 max-w-md text-sm leading-7 text-white/72">
                                    Djaitin supports custom tailoring,
                                    ready-to-wear, and bulk production with a
                                    bright, modern, and more dependable service
                                    approach.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                asChild
                                className="rounded-full bg-[#ffd21f] px-5 text-[#123c78] hover:bg-[#ffe265]"
                            >
                                <Link href={customer.services.tailor()}>
                                    Explore Tailor
                                </Link>
                            </Button>
                            <Button
                                asChild
                                className="rounded-full border border-white/14 bg-white/10 px-5 text-white hover:bg-white/16"
                                variant="ghost"
                            >
                                <Link href={login()}>Masuk</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="[font-family:var(--landing-heading-font)] text-[5rem] leading-none tracking-[0.02em] text-white/96 uppercase md:text-[9rem] lg:text-[12rem]">
                        Djaitin
                    </div>
                </div>
            </div>
        </footer>
    );
}
