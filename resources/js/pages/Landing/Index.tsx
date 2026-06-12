import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    ChevronLeft,
    Building2,
    ChevronRight,
    ClipboardCheck,
    Layers3,
    PackageCheck,
    PenTool,
    Ruler,
    Scissors,
    ShoppingBag,
    ShieldCheck,
    Shirt,
    Sparkles,
    SwatchBook,
    Users2,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type {
    CSSProperties,
    MouseEvent as ReactMouseEvent,
    ReactNode,
} from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import LandingLayout from '@/layouts/landing-layout';
import { login } from '@/routes';
import customer from '@/routes/customer';
import type { User } from '@/types/auth';
import fittingImage from '../../../images/card-image/fitting.jpg';
import convectionImage from '../../../images/card-image/konveksi-1.jpg';
import convectionDetailImage from '../../../images/card-image/konveksi-2.jpg';
import batchImage from '../../../images/card-image/konveksi-3.jpg';
import readyToWearImage from '../../../images/card-image/ready-to-wear.jpg';
import catalogBatikImage from '../../../images/generated/catalog-product-batik.jpg';
import catalogCasualImage from '../../../images/generated/catalog-product-casual.jpg';
import catalogUniformImage from '../../../images/generated/catalog-product-uniform.jpg';
import { CountUpStat } from './components/CountUpStat';
import { FloatingNavbar } from './components/FloatingNavbar';
import { LenisProvider } from './components/LenisProvider';
import { TextReveal } from './components/TextReveal';
import type { LandingNavItem } from './types';
import bannerImage from '../../../images/generated/landing-banner.png';

type LandingPageProps = {
    brand: {
        name: string;
        services: string[];
        tagline: string;
    };
    catalog: {
        cta_label: string;
        description: string;
        eyebrow: string;
        guest_cta_label: string;
        index_url: string;
        title: string;
    };
    featuredProducts: FeaturedProduct[];
};

type FeaturedProduct = {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    category: string;
    size: string;
    selling_price: number;
    discount_amount: number;
    final_price: number;
    is_clearance: boolean;
    stock: number;
    is_low_stock: boolean;
    is_sold_out: boolean;
    image_path: string | null;
};

// Sequence scroll frames removed.

const navItems: LandingNavItem[] = [
    { id: 'hero', label: 'Intro', kicker: '00' },
    { id: 'about', label: 'About', kicker: '01' },
    { id: 'services', label: 'Services', kicker: '02' },
    { id: 'catalog', label: 'Catalog', kicker: '03' },
    { id: 'trust', label: 'Trust', kicker: '04' },
    { id: 'division', label: 'Division', kicker: '05' },
    { id: 'awards', label: 'Proof', kicker: '06' },
];

// Hero cues replaced by static premium banner layout.

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

export default function LandingIndex({
    brand,
    catalog,
    featuredProducts,
}: LandingPageProps) {
    const [activeAchievement, setActiveAchievement] = useState(0);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const canOpenCatalog = auth.user !== null;

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

    const updateCarouselIndex = () => {
        const node = carouselRef.current;
        if (!node) {
            return;
        }
        const slide = node.firstElementChild as HTMLElement | null;
        if (!slide) {
            return;
        }
        const slideRect = slide.getBoundingClientRect();
        const stride = slideRect.width + 16;
        if (stride <= 0) {
            return;
        }
        const next = Math.round(node.scrollLeft / stride);
        setCarouselIndex(
            Math.max(0, Math.min(featuredProducts.length - 1, next)),
        );
    };

    const scrollCarouselTo = (index: number) => {
        const node = carouselRef.current;
        if (!node) {
            return;
        }
        const target = node.children[index] as HTMLElement | undefined;
        if (!target) {
            return;
        }
        node.scrollTo({
            behavior: 'smooth',
            left: target.offsetLeft,
        });
    };

    const goToPrevSlide = () => {
        const next = Math.max(0, carouselIndex - 1);
        setCarouselIndex(next);
        scrollCarouselTo(next);
    };

    const goToNextSlide = () => {
        const last = Math.max(0, featuredProducts.length - 1);
        const next = Math.min(last, carouselIndex + 1);
        setCarouselIndex(next);
        scrollCarouselTo(next);
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

                    <section
                        className="relative min-h-[90vh] flex items-center px-6 pt-32 pb-20 md:px-10 lg:px-14 bg-gradient-to-b from-[#f7f7f5] via-[#f7f7f5] to-[#f2f5f8] overflow-hidden"
                        id="hero"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,210,31,0.15),transparent_35%)] pointer-events-none" />
                        <div className="mx-auto w-full max-w-6xl relative z-10">
                            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    className="space-y-6 text-[#123c78]"
                                >
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#123c78]/10 bg-white/60 px-4 py-1.5 backdrop-blur-sm shadow-sm">
                                        <span className="size-2 rounded-full bg-[#ffd21f] animate-pulse" />
                                        <p className="text-[10px] md:text-xs font-semibold tracking-[0.25em] text-[#3b73b9] uppercase">
                                            SIM Konveksi & Custom Tailor
                                        </p>
                                    </div>
                                    <h1 className="[font-family:var(--landing-heading-font)] text-5xl leading-[0.9] font-bold tracking-[0.01em] text-[#123c78] uppercase md:text-7xl xl:text-8xl">
                                        Refined Garments. <br />
                                        <span className="text-[#3b73b9]">Reliable Production.</span>
                                    </h1>
                                    <p className="text-base md:text-lg leading-relaxed text-[#123c78]/70 max-w-lg">
                                        Djaitin connects custom tailoring, ready-to-wear, and bulk convection production in a single integrated management system for consistent, precise, and timely results.
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <Button
                                            asChild
                                            className="rounded-full bg-[#123c78] text-white hover:bg-brand-blue hover:scale-105 active:scale-95 px-8 py-6 text-base font-semibold shadow-lg hover:shadow-brand-blue/20 transition-all duration-300 cursor-pointer border-0"
                                        >
                                            <Link href={login()}>
                                                Mulai Sekarang
                                                <ArrowRight className="size-4 ml-1.5" />
                                            </Link>
                                        </Button>
                                        <Button
                                            onClick={() => scrollToSection('about')}
                                            className="rounded-full border border-[#123c78]/20 bg-white/60 text-[#123c78] hover:bg-[#123c78]/5 hover:text-[#123c78] hover:scale-105 active:scale-95 px-8 py-6 text-base font-semibold transition-all duration-300 cursor-pointer shadow-sm"
                                        >
                                            Tentang Kami
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-[#123c78]/10">
                                        <div>
                                            <p className="text-2xl font-bold text-[#123c78]">420+</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Pesanan Selesai</p>
                                        </div>
                                        <div className="w-px h-8 bg-[#123c78]/10" />
                                        <div>
                                            <p className="text-2xl font-bold text-[#123c78]">1,800+</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Kapasitas Batch</p>
                                        </div>
                                        <div className="w-px h-8 bg-[#123c78]/10" />
                                        <div>
                                            <p className="text-2xl font-bold text-[#123c78]">100%</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Garansi Kualitas</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                                    className="relative flex justify-center"
                                >
                                    <div className="relative w-full max-w-[480px] lg:max-w-none aspect-[4/5] md:aspect-[4/3] lg:aspect-[4/5] rounded-[2.5rem] border border-white/60 bg-white/80 p-3 shadow-[0_32px_90px_rgba(18,60,120,0.12)] backdrop-blur-md">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,210,31,0.22),transparent_40%)] pointer-events-none rounded-[2.5rem]" />
                                        <div className="w-full h-full rounded-[2rem] overflow-hidden border border-[#123c78]/5 relative">
                                            <img
                                                src={bannerImage}
                                                alt="Djaitin Premium Atelier & Convection"
                                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    <main className="relative z-20 -mt-16 pb-0">
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
                                    className="px-6 pt-24 md:px-10 lg:px-14"
                                    id="catalog"
                                >
                                    <div className="mx-auto max-w-6xl">
                                        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                                            <div className="max-w-3xl">
                                                <p className="text-xs font-semibold tracking-[0.3em] text-[#3b73b9] uppercase">
                                                    {catalog.eyebrow}
                                                </p>
                                                <h2 className="mt-4 [font-family:var(--landing-heading-font)] text-5xl leading-[0.88] tracking-[0.02em] text-[#123c78] uppercase md:text-7xl">
                                                    Ready pieces, framed like a
                                                    private rack.
                                                </h2>
                                            </div>
                                            <div className="max-w-md space-y-5">
                                                <p className="text-[1rem] leading-8 text-[#123c78]/68">
                                                    {catalog.description}
                                                </p>
                                                <Button
                                                    asChild
                                                    className="rounded-full bg-[#123c78] px-6 text-white hover:bg-[#0e3163]"
                                                >
                                                    <Link
                                                        href={
                                                            canOpenCatalog
                                                                ? catalog.index_url
                                                                : login()
                                                        }
                                                    >
                                                        {canOpenCatalog
                                                            ? catalog.cta_label
                                                            : catalog.guest_cta_label}
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-10 overflow-hidden rounded-[2.75rem] border border-[#123c78]/10 bg-[#123c78] shadow-[0_34px_120px_rgba(18,60,120,0.16)]">
                                            <div className="grid lg:grid-cols-[0.38fr_0.62fr]">
                                                <div className="relative min-h-[25rem] overflow-hidden p-6 text-white md:p-8 lg:p-9">
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,210,31,0.28),transparent_30%),radial-gradient(circle_at_86%_74%,rgba(59,115,185,0.4),transparent_38%)]" />
                                                    <div className="absolute inset-x-6 top-24 bottom-0 rounded-t-[999px] border border-white/10 bg-white/6 backdrop-blur-[2px]" />
                                                    <div className="relative flex h-full flex-col justify-between gap-10">
                                                        <div className="space-y-5">
                                                            <span className="inline-flex rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[0.7rem] font-semibold tracking-[0.22em] text-[#ffd21f] uppercase">
                                                                Curated stock
                                                            </span>
                                                            <p className="[font-family:var(--landing-heading-font)] text-6xl leading-[0.88] tracking-[0.02em] uppercase md:text-7xl">
                                                                The edited
                                                                selection.
                                                            </p>
                                                            <p className="max-w-sm text-[0.98rem] leading-8 text-white/70">
                                                                Three active
                                                                ready-to-wear
                                                                pieces surfaced
                                                                from current
                                                                stock, chosen to
                                                                show fit,
                                                                finish, and
                                                                everyday polish
                                                                before customers
                                                                enter the app.
                                                            </p>
                                                            <div className="grid gap-2 text-sm text-white/68">
                                                                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2.5">
                                                                    <span className="size-1.5 rounded-full bg-[#ffd21f]" />
                                                                    Swipe to
                                                                    review the
                                                                    short list.
                                                                </div>
                                                                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2.5">
                                                                    <span className="size-1.5 rounded-full bg-[#ffd21f]" />
                                                                    Sign in to
                                                                    check full
                                                                    detail and
                                                                    checkout.
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3 border-y border-white/12 py-5">
                                                            <CatalogMetric
                                                                label="Pieces"
                                                                value={
                                                                    featuredProducts.length
                                                                }
                                                            />
                                                            <CatalogMetric
                                                                label="Stock"
                                                                value={featuredProducts.reduce(
                                                                    (
                                                                        total,
                                                                        product,
                                                                    ) =>
                                                                        total +
                                                                        product.stock,
                                                                    0,
                                                                )}
                                                            />
                                                            <CatalogMetric
                                                                label="Lane"
                                                                value="RTW"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="overflow-hidden bg-[linear-gradient(135deg,#f9fafb_0%,#eef4fb_100%)] p-4 md:p-5 lg:p-6">
                                                    {featuredProducts.length >
                                                    0 ? (
                                                        <div className="flex h-full min-h-[33rem] flex-col justify-between gap-5">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <div>
                                                                    <p className="text-[0.68rem] font-semibold tracking-[0.24em] text-[#3b73b9] uppercase">
                                                                        Featured
                                                                        rack
                                                                    </p>
                                                                    <p className="mt-1 text-sm leading-6 text-[#123c78]/62">
                                                                        Swipe
                                                                        the
                                                                        cards or
                                                                        use the
                                                                        controls.
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <CarouselButton
                                                                        label="Previous product"
                                                                        onClick={
                                                                            goToPrevSlide
                                                                        }
                                                                        disabled={
                                                                            carouselIndex ===
                                                                            0
                                                                        }
                                                                    >
                                                                        <ChevronLeft className="size-4" />
                                                                    </CarouselButton>
                                                                    <CarouselButton
                                                                        label="Next product"
                                                                        onClick={
                                                                            goToNextSlide
                                                                        }
                                                                        disabled={
                                                                            carouselIndex ===
                                                                            featuredProducts.length -
                                                                                1
                                                                        }
                                                                    >
                                                                        <ChevronRight className="size-4" />
                                                                    </CarouselButton>
                                                                </div>
                                                            </div>

                                                            <div
                                                                aria-label="Featured ready-to-wear catalog"
                                                                className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                                                onScroll={
                                                                    updateCarouselIndex
                                                                }
                                                                ref={
                                                                    carouselRef
                                                                }
                                                            >
                                                                {featuredProducts.map(
                                                                    (
                                                                        product,
                                                                        index,
                                                                    ) => (
                                                                        <div
                                                                            className="min-w-[82%] snap-start sm:min-w-[22rem] lg:min-w-[20.5rem] xl:min-w-[22rem]"
                                                                            key={
                                                                                product.id
                                                                            }
                                                                        >
                                                                            <LandingCatalogCard
                                                                                product={
                                                                                    product
                                                                                }
                                                                                index={
                                                                                    index
                                                                                }
                                                                                canOpenCatalog={
                                                                                    canOpenCatalog
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between gap-4 border-t border-[#123c78]/10 pt-4">
                                                                <div className="flex gap-2">
                                                                    {featuredProducts.map(
                                                                        (
                                                                            product,
                                                                            index,
                                                                        ) => (
                                                                            <button
                                                                                aria-label={`Go to ${product.name}`}
                                                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                                                    carouselIndex ===
                                                                                    index
                                                                                        ? 'w-9 bg-[#123c78]'
                                                                                        : 'w-2 bg-[#123c78]/20 hover:bg-[#123c78]/40'
                                                                                }`}
                                                                                key={
                                                                                    product.id
                                                                                }
                                                                                onClick={() => {
                                                                                    setCarouselIndex(
                                                                                        index,
                                                                                    );
                                                                                    scrollCarouselTo(
                                                                                        index,
                                                                                    );
                                                                                }}
                                                                                type="button"
                                                                            />
                                                                        ),
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-semibold tracking-[0.22em] text-[#123c78]/45 uppercase">
                                                                    {String(
                                                                        carouselIndex +
                                                                            1,
                                                                    ).padStart(
                                                                        2,
                                                                        '0',
                                                                    )}
                                                                    /03
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[2rem] border border-[#123c78]/10 bg-white/74 p-8 text-center">
                                                            <ShoppingBag className="size-10 text-[#123c78]/42" />
                                                            <h3 className="mt-5 [font-family:var(--landing-heading-font)] text-4xl leading-none tracking-[0.03em] text-[#123c78] uppercase">
                                                                Catalog sedang
                                                                dikurasi.
                                                            </h3>
                                                            <p className="mt-3 max-w-md text-sm leading-7 text-[#123c78]/64">
                                                                Tim Djaitin
                                                                sedang memilih
                                                                stok aktif yang
                                                                layak tampil di
                                                                landing page.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
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

function CatalogMetric({
    label,
    value,
}: {
    label: string;
    value: number | string;
}) {
    return (
        <div>
            <p className="[font-family:var(--landing-heading-font)] text-4xl leading-none tracking-[0.03em] text-white uppercase">
                {value}
            </p>
            <p className="mt-1 text-[0.68rem] font-semibold tracking-[0.22em] text-white/48 uppercase">
                {label}
            </p>
        </div>
    );
}

function CarouselButton({
    children,
    disabled = false,
    label,
    onClick,
}: {
    children: ReactNode;
    disabled?: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            aria-label={label}
            className="inline-flex size-10 items-center justify-center rounded-full border border-[#123c78]/14 bg-white text-[#123c78] shadow-[0_10px_30px_rgba(18,60,120,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#123c78] hover:text-white focus-visible:ring-2 focus-visible:ring-[#123c78]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eef4fb] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:text-[#123c78]"
            disabled={disabled}
            onClick={onClick}
            type="button"
        >
            {children}
        </button>
    );
}

function LandingCatalogCard({
    canOpenCatalog,
    index,
    product,
}: {
    canOpenCatalog: boolean;
    index: number;
    product: FeaturedProduct;
}) {
    const detailHref = canOpenCatalog
        ? customer.catalog.show(product.id)
        : login();
    const hasDiscount = product.discount_amount > 0;

    return (
        <Link
            href={detailHref}
            className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-[#123c78]/8 bg-white/96 shadow-[0_18px_60px_rgba(18,60,120,0.06)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#123c78]/14 hover:shadow-[0_28px_90px_rgba(18,60,120,0.14)] focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#123c78]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eef4fb] focus-visible:outline-none"
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#eef4fb]">
                <img
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-[700ms] ease-out group-hover:scale-[1.05]"
                    src={resolveLandingProductImage(product, index)}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,60,120,0)_55%,rgba(18,60,120,0.55)_100%)]" />

                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                    <span className="rounded-full bg-white/92 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.22em] text-[#123c78] uppercase shadow-sm backdrop-blur">
                        {formatProductLabel(product.category)}
                    </span>
                    {product.is_clearance ? (
                        <span className="rounded-full bg-[#ffd21f] px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-[#7a5500] uppercase">
                            Clearance
                        </span>
                    ) : hasDiscount ? (
                        <span className="rounded-full bg-white/92 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-[#123c78] uppercase backdrop-blur">
                            -
                            {Math.round(
                                (product.discount_amount /
                                    product.selling_price) *
                                    100,
                            )}
                            %
                        </span>
                    ) : null}
                </div>

                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                    <span className="rounded-full border border-white/24 bg-white/12 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.22em] text-white uppercase backdrop-blur">
                        Size {product.size}
                    </span>
                    <span className={landingStockClassName(product)}>
                        {landingStockLabel(product)}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-4 p-4 md:p-5">
                <div>
                    <p className="text-[0.62rem] font-semibold tracking-[0.24em] text-[#3b73b9] uppercase">
                        {product.sku}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-[1.05rem] leading-snug font-semibold text-[#123c78] md:text-[1.12rem]">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-end justify-between gap-3 border-t border-[#123c78]/8 pt-4">
                    <div>
                        <p className="[font-family:var(--landing-heading-font)] text-2xl leading-none tracking-[0.02em] text-[#123c78] uppercase md:text-[1.65rem]">
                            {formatLandingCurrency(product.final_price)}
                        </p>
                        {hasDiscount && (
                            <p className="mt-1 text-[0.78rem] text-[#123c78]/42 line-through">
                                {formatLandingCurrency(product.selling_price)}
                            </p>
                        )}
                    </div>
                    <span
                        aria-hidden
                        className="inline-flex size-9 items-center justify-center rounded-full border border-[#123c78]/12 bg-white text-[#123c78] transition duration-300 group-hover:border-[#123c78] group-hover:bg-[#123c78] group-hover:text-white"
                    >
                        <ArrowRight className="size-4" />
                    </span>
                </div>
            </div>

            <span className="sr-only">
                {canOpenCatalog
                    ? `View ${product.name} detail`
                    : `Sign in to view ${product.name}`}
            </span>
        </Link>
    );
}

function resolveLandingProductImage(
    product: FeaturedProduct,
    index: number,
): string {
    if (product.image_path !== null) {
        return product.image_path.startsWith('http')
            ? product.image_path
            : `/storage/${product.image_path}`;
    }

    return [catalogBatikImage, catalogCasualImage, catalogUniformImage][
        index % 3
    ];
}

function formatProductLabel(value: string): string {
    return value
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatLandingCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        currency: 'IDR',
        maximumFractionDigits: 0,
        style: 'currency',
    }).format(value);
}

function landingStockClassName(product: FeaturedProduct): string {
    if (product.is_sold_out) {
        return 'rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700';
    }

    if (product.is_low_stock) {
        return 'rounded-full bg-[#ffd21f]/24 px-3 py-1 text-xs font-semibold text-[#8a6400]';
    }

    return 'rounded-full bg-[#edf4ef] px-3 py-1 text-xs font-semibold text-[#24533a]';
}

function landingStockLabel(product: FeaturedProduct): string {
    if (product.is_sold_out) {
        return 'Sold out';
    }

    if (product.is_low_stock) {
        return `${product.stock} left`;
    }

    return `${product.stock} ready`;
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
